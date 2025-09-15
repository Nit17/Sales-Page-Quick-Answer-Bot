import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type Section = { id: string; title: string; content: string; url: string }

const DOC_DIR = path.join(process.cwd(), 'data', 'docs')

function loadDocs(): Section[] {
  const files = fs.readdirSync(DOC_DIR)
  return files.map((f) => {
    const p = path.join(DOC_DIR, f)
    const content = fs.readFileSync(p, 'utf8')
    const title = content.split('\n')[0].replace(/^#\s*/, '') || f
    return { id: f, title, content, url: `/docs/${f}` }
  })
}

function score(query: string, text: string): number {
  const q = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const t = text.toLowerCase()
  let s = 0
  for (const term of q) if (t.includes(term)) s += 1
  return s
}

function retrieve(query: string, k = 2) {
  const docs = loadDocs()
  return docs
    .map((d) => ({ d, s: score(query, d.content) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.d)
}

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const q = (req.query.q as string) || ''

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')

  const write = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  // Simulate streaming tokens
  const hits = retrieve(q)
  const answer = buildAnswer(q, hits)
  const tokens = tokenise(answer)
  for (const t of tokens) {
    write({ type: 'token', token: t })
    await sleep(20)
  }
  write({ type: 'done', sources: hits.map((h) => ({ title: h.title, url: h.url })) })
  res.end()
}

function buildAnswer(q: string, hits: Section[]): string {
  const n = q.toLowerCase()
  if (n.includes('soc 2') || n.includes('security')) {
    return 'Yes — We align with SOC 2 principles, including access controls, encryption, and incident response.'
  }
  if (n.includes('residency') || n.includes('india')) {
    return 'We support data residency in India via regional hosting and pinned backups.'
  }
  if (n.includes('api') && (n.includes('limit') || n.includes('rate'))) {
    return 'Default API limit is 60 requests/min per key with bursts to 120; higher tiers on Pro/Enterprise.'
  }
  if (hits.length > 0) {
    return `Here’s what I found: ${hits.map((h) => h.title).join('; ')}`
  }
  return 'I can help with pricing, security certifications, data residency, and API limits.'
}

function tokenise(s: string) {
  return s.split(/(\s+)/).filter(Boolean)
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }
