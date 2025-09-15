import fs from 'fs'
import path from 'path'

export async function getServerSideProps({ query }: { query: any }) {
  const key = process.env.ADMIN_KEY || 'admin'
  if (query.key !== key) return { notFound: true }
  const dataDir = path.join(process.cwd(), 'data')
  const leadsFile = path.join(dataDir, 'leads.json')
  const eventsFile = path.join(dataDir, 'events.json')
  const leads = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, 'utf8')) : []
  const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, 'utf8')) : []
  return { props: { leads, events } }
}

export default function Admin({ leads, events }: { leads: any[]; events: any[] }) {
  return (
    <main className="container">
      <h1>Admin</h1>
      <h2>Leads</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(leads, null, 2)}</pre>
      <h2>Events</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(events, null, 2)}</pre>
    </main>
  )
}
