import type { NextApiRequest, NextApiResponse } from 'next'

import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const eventsFile = path.join(dataDir, 'events.json')

function appendEvent(event: any) {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    const prev = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, 'utf8')) : []
    prev.push({ ...event, ts: Date.now() })
    fs.writeFileSync(eventsFile, JSON.stringify(prev, null, 2))
  } catch {}
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const event = req.body
  // For demo, just log to server console
  // In real app, forward to analytics or DB
  console.log('event', event)
  appendEvent(event)
  res.status(200).json({ ok: true })
}
