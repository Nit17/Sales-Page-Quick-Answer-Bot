import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const leadsFile = path.join(dataDir, 'leads.json')

function isWorkEmail(email: string) {
  const free = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const m = email.toLowerCase().match(/@([^@]+)$/)
  if (!m) return false
  const domain = m[1]
  return !free.includes(domain)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const lead = req.body as { name?: string; email?: string; companySize?: string }
  if (!lead.name || !lead.email || !lead.companySize) return res.status(400).json({ error: 'Missing fields' })
  if (!isWorkEmail(lead.email)) return res.status(400).json({ error: 'Please use a work email' })
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    const prev = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, 'utf8')) : []
    prev.push({ ...lead, ts: Date.now() })
    fs.writeFileSync(leadsFile, JSON.stringify(prev, null, 2))
  } catch {}
  console.log('lead', lead)
  res.status(200).json({ ok: true })
}
