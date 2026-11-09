import { Layout } from '../components/Layout.js'

type ErrorPageProps = {
  title: string
  message: string
}

export const ErrorPage = ({ title, message }: ErrorPageProps) => (
  <Layout title={`${title} – AgentClinic`} path="">
    <h1>{title}</h1>
    <p>{message}</p>
    <p><a class="back-link" href="/">← Back to the clinic</a></p>
  </Layout>
)
