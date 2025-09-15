import type { NextApiRequest, NextApiResponse } from 'next'

const leads: any[] = []

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const lead = req.body
  leads.push({ ...lead, ts: Date.now() })
  console.log('lead', lead)
  res.status(200).json({ ok: true })
}
