// Loads every GET page of the built app in headless Chrome at 320/768/1280px and fails on
// horizontal page overflow or block-level tap targets shorter than 44px.
// Usage: npm run check:responsive   (set CHROME_PATH if Chrome is not auto-detected)
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const WIDTHS = [320, 768, 1280]
const PAGES = ['/', '/agents', '/agents/1', '/agents/1/edit', '/agents/new', '/ailments', '/therapies', '/dashboard', '/appointments/1', '/nope']
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.')
  process.exit(2)
}

const work = mkdtempSync(join(tmpdir(), 'agentclinic-responsive-'))
const port = 3900 + Math.floor(Math.random() * 90)
const base = `http://localhost:${port}`
const server = spawn(process.execPath, ['dist/index.js'], {
  env: { ...process.env, PORT: String(port), DATABASE_PATH: join(work, 'check.db') },
  stdio: ['ignore', 'pipe', 'inherit'],
})
const cleanup = () => {
  server.kill()
  rmSync(work, { recursive: true, force: true })
}

try {
  await new Promise((resolve, reject) => {
    server.once('exit', (code) => reject(new Error(`server exited early (${code})`)))
    server.stdout.on('data', (d) => String(d).includes('listening') && resolve())
    setTimeout(() => reject(new Error('server did not start')), 10_000)
  })

  // Create one appointment so the confirmation page and dashboard rows exist.
  const future = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 16)
  await fetch(`${base}/agents/1/appointments`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ therapist_id: '1', scheduled_at: future }),
    redirect: 'manual',
  })

  let html = '<body><pre id="out">pending</pre>'
  let i = 0
  for (const width of WIDTHS) {
    for (const page of PAGES) {
      const text = (await (await fetch(base + page)).text()).replace('<head>', `<head><base href="${base}/">`)
      const attr = text.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
      html += `<iframe data-k="${width}px ${page}" style="width:${width}px;height:600px" srcdoc="${attr}"></iframe>`
      i++
    }
  }
  html += `<script>setTimeout(()=>{const r=[];document.querySelectorAll('iframe').forEach(f=>{
    const doc=f.contentDocument,d=doc.documentElement
    const short=[...doc.querySelectorAll("a,button,select,input[type=text],input[type=datetime-local]")].filter(e=>{
      if(e.tagName==='A'&&getComputedStyle(e).display==='inline')return false
      return e.getBoundingClientRect().height<43.5
    }).map(e=>e.tagName.toLowerCase()+':'+(e.textContent||e.name||'').trim().slice(0,20))
    r.push({page:f.dataset.k,overflow:d.scrollWidth>d.clientWidth,scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,short})
  });document.getElementById('out').textContent=JSON.stringify(r)},1500)</script></body>`
  const file = join(work, 'check.html')
  writeFileSync(file, html)

  const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom', `file://${file}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  })
  const match = /<pre id="out">(\[.*?\])<\/pre>/s.exec(dom)
  if (!match) throw new Error('Could not read results from Chrome')
  const results = JSON.parse(match[1].replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>'))

  let failed = 0
  for (const r of results) {
    const problems = []
    if (r.overflow) problems.push(`horizontal overflow (${r.scrollWidth} > ${r.clientWidth})`)
    if (r.short.length) problems.push(`tap targets under 44px: ${r.short.join(', ')}`)
    if (problems.length) failed++
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${r.page}${problems.length ? ' — ' + problems.join('; ') : ''}`)
  }
  console.log(`\n${results.length - failed}/${results.length} page checks passed`)
  process.exitCode = failed ? 1 : 0
} catch (err) {
  console.error(err)
  process.exitCode = 2
} finally {
  cleanup()
}
