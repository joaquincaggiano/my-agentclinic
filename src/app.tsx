import { relative } from 'node:path'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Db } from './db.js'
import { projectRoot } from './paths.js'
import { createAgent, getAgent, getAgentAilmentIds, listAgents, updateAgent } from './repositories/agents.js'
import { createAppointment, getAppointment, isSlotTaken, listAppointments, setAppointmentStatus } from './repositories/appointments.js'
import { listAilments, listAilmentsWithTherapies } from './repositories/ailments.js'
import { getDashboardCounts } from './repositories/dashboard.js'
import { listTherapies } from './repositories/therapies.js'
import { listTherapists, therapistExists } from './repositories/therapists.js'
import { validateAgent } from './validation/agent.js'
import { validateBooking } from './validation/booking.js'
import { parseEnum, parseId } from './validation/fields.js'
import { Home } from './pages/Home.js'
import { Agents } from './pages/Agents.js'
import { AgentProfile } from './pages/AgentProfile.js'
import { AgentForm } from './pages/AgentForm.js'
import { Ailments } from './pages/Ailments.js'
import { Therapies } from './pages/Therapies.js'
import { AppointmentConfirmation } from './pages/AppointmentConfirmation.js'
import { Dashboard } from './pages/Dashboard.js'
import { ErrorPage } from './pages/ErrorPage.js'
import { NotFound } from './pages/NotFound.js'
import { ServerError } from './pages/ServerError.js'

export type AppOptions = {
  /** Clock used to validate booking times; injectable for tests. */
  now?: () => Date
}

const emptyAgent = { name: '', model_type: '', status: '', ailment_ids: [] as number[] }

export const createApp = (db: Db, { now = () => new Date() }: AppOptions = {}) => {
  const app = new Hono()

  app.use('/styles.css', serveStatic({ root: relative(process.cwd(), `${projectRoot}public`) || '.' }))
  app.post('*', bodyLimit({ maxSize: 16 * 1024, onError: (c) => c.html(<ErrorPage title="Request too large" message="That form submission was too large." />, 413) }))

  app.notFound((c) => c.html(<NotFound />, 404))
  app.onError((err, c) => {
    console.error(err)
    return c.html(<ServerError />, 500)
  })

  app.get('/', (c) => c.html(<Home />))

  app.get('/agents', (c) => c.html(<Agents agents={listAgents(db)} />))

  app.get('/agents/new', (c) => (
    c.html(<AgentForm heading="New agent" action="/agents/new" submitLabel="Create agent" cancelHref="/dashboard" ailments={listAilments(db)} values={emptyAgent} />)
  ))
  app.post('/agents/new', async (c) => {
    const ailments = listAilments(db)
    const result = validateAgent(await c.req.parseBody({ all: true }), new Set(ailments.map((a) => a.id)))
    if (!result.data) {
      return c.html(<AgentForm heading="New agent" action="/agents/new" submitLabel="Create agent" cancelHref="/dashboard" ailments={ailments} values={result.values} errors={result.errors} />, 422)
    }
    return c.redirect(`/agents/${createAgent(db, result.data)}`, 303)
  })

  app.get('/agents/:id', (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    return agent ? c.html(<AgentProfile agent={agent} therapists={listTherapists(db)} />) : c.notFound()
  })

  app.get('/agents/:id/edit', (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()
    const values = { name: agent.name, model_type: agent.model_type, status: agent.status, ailment_ids: getAgentAilmentIds(db, agent.id) }
    return c.html(<AgentForm heading={`Edit ${agent.name}`} action={`/agents/${agent.id}/edit`} submitLabel="Save changes" cancelHref={`/agents/${agent.id}`} ailments={listAilments(db)} values={values} />)
  })
  app.post('/agents/:id/edit', async (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()
    const ailments = listAilments(db)
    const result = validateAgent(await c.req.parseBody({ all: true }), new Set(ailments.map((a) => a.id)))
    if (!result.data) {
      return c.html(<AgentForm heading={`Edit ${agent.name}`} action={`/agents/${agent.id}/edit`} submitLabel="Save changes" cancelHref={`/agents/${agent.id}`} ailments={ailments} values={result.values} errors={result.errors} />, 422)
    }
    updateAgent(db, agent.id, result.data)
    return c.redirect(`/agents/${agent.id}`, 303)
  })

  app.post('/agents/:id/appointments', async (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()

    const result = validateBooking(await c.req.parseBody(), now())
    const errors = { ...result.errors }
    if (result.data) {
      if (!therapistExists(db, result.data.therapistId)) errors.therapist = 'Choose a therapist from the list.'
      else if (isSlotTaken(db, result.data.therapistId, result.data.scheduledAt)) {
        errors.scheduled_at = 'That therapist is already booked at that time.'
      } else {
        const created = createAppointment(db, { agentId: agent.id, ...result.data })
        if (created !== 'slot_taken') return c.redirect(`/appointments/${created}`, 303)
        errors.scheduled_at = 'That therapist is already booked at that time.'
      }
    }
    return c.html(<AgentProfile agent={agent} therapists={listTherapists(db)} form={{ values: result.values, errors }} />, 422)
  })

  app.get('/appointments/:id', (c) => {
    const id = parseId(c.req.param('id'))
    const appointment = id === undefined ? undefined : getAppointment(db, id)
    return appointment ? c.html(<AppointmentConfirmation appointment={appointment} />) : c.notFound()
  })

  app.post('/appointments/:id/status', async (c) => {
    const id = parseId(c.req.param('id'))
    if (id === undefined) return c.notFound()
    const body = await c.req.parseBody()
    const status = parseEnum(body.status, ['completed', 'cancelled'] as const)
    if (!status) return c.html(<ErrorPage title="Invalid request" message="Choose completed or cancelled." />, 400)
    const outcome = setAppointmentStatus(db, id, status)
    if (outcome === 'not_found') return c.notFound()
    if (outcome === 'invalid_transition') {
      return c.html(<ErrorPage title="Can't change that appointment" message="Only scheduled appointments can be completed or cancelled." />, 409)
    }
    return c.redirect('/dashboard', 303)
  })

  app.get('/ailments', (c) => c.html(<Ailments ailments={listAilmentsWithTherapies(db)} />))
  app.get('/therapies', (c) => c.html(<Therapies therapies={listTherapies(db)} />))

  app.get('/dashboard', (c) => (
    c.html(<Dashboard counts={getDashboardCounts(db)} appointments={listAppointments(db)} agents={listAgents(db)} ailments={listAilments(db)} />)
  ))

  return app
}
