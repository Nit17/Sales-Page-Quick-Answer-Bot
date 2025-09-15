import type { NextApiRequest, NextApiResponse } from 'next'

const SOURCES = {
  soc2: { title: 'Security: SOC 2', url: 'https://aicpa.org/soc2' },
  residencyIN: { title: 'Data Residency Options', url: 'https://cloud.google.com/learn/what-is-data-residency' },
  apiLimits: { title: 'API Rate Limits', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Rate_limiting' },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { q } = req.body as { q: string }
  const n = (q || '').toLowerCase()

  // If both SOC2 and Residency are asked together, send two quick sourced messages
  const wantsSoc2 = n.includes('soc 2') || n.includes('soc2')
  const wantsResidencyIN = n.includes('residency') || n.includes('india') || n.includes('data residency')
  if (wantsSoc2 && wantsResidencyIN) {
    return res.json({
      messages: [
        { text: 'Yes — We are SOC 2 aligned and follow industry best practices.', sources: [SOURCES.soc2] },
        { text: 'We support data residency options including India via regional hosting.', sources: [SOURCES.residencyIN] },
      ],
    })
  }

  if (n.includes('soc 2')) {
    return res.json({ text: 'Yes — We are SOC 2 aligned and follow industry best practices.', sources: [SOURCES.soc2] })
  }
  if (n.includes('residency') || n.includes('india')) {
    return res.json({ text: 'We support data residency options including India via regional hosting.', sources: [SOURCES.residencyIN] })
  }
  if (n.includes('api') && (n.includes('limit') || n.includes('rate'))) {
    return res.json({ text: 'Default API limit is 60 requests/min per key with bursts to 120. Higher tiers available.', sources: [SOURCES.apiLimits] })
  }
  return res.json({ text: 'I can help with pricing, security certifications, data residency, and API limits.', sources: [] })
}
