import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const event = req.body
  // For demo, just log to server console
  // In real app, forward to analytics or DB
  console.log('event', event)
  res.status(200).json({ ok: true })
}
