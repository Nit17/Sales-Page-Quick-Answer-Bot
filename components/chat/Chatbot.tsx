import { useEffect, useMemo, useRef, useState } from 'react'
import { postJSON } from '../../lib/http'

type Msg = {
  id: string
  role: 'user' | 'bot' | 'system'
  text: string
  sources?: { title: string; url: string }[]
  kind?: 'nudge' | 'lead' | 'info'
}

type Lead = { name: string; email: string; companySize: string }

const SOURCES = {
  soc2: { title: 'Security: SOC 2', url: 'https://aicpa.org/soc2' },
  residencyIN: { title: 'Data Residency Options', url: 'https://cloud.google.com/learn/what-is-data-residency' },
  apiLimits: { title: 'API Rate Limits', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Rate_limiting' },
}

export default function Chatbot() {
  const [open, setOpen] = useState(true)
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'w1', role: 'bot', text: 'Hi! Ask me about pricing, security, or API limits.', kind: 'info' },
  ])
  const [input, setInput] = useState('')
  const [answersCount, setAnswersCount] = useState(0)
  const [leadMode, setLeadMode] = useState(false)
  const [lead, setLead] = useState<Lead>({ name: '', email: '', companySize: '' })
  const hasNudgedRef = useRef(false)
  const scroll70Sent = useRef(false)

  // Scroll and route tracking for scenario
  useEffect(() => {
    const onScroll = () => {
      const at = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
      if (at >= 0.7 && !scroll70Sent.current) {
        scroll70Sent.current = true
        postJSON('/api/events', { type: 'scroll-70', path: window.location.pathname })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    postJSON('/api/events', { type: 'view', path: window.location.pathname })
  }, [])

  const sendUser = (text: string) => {
    const id = `u-${Date.now()}`
    setMessages((m) => [...m, { id, role: 'user', text }])
  }

  const pushBot = (text: string, sources?: Msg['sources']) => {
    const id = `b-${Date.now()}`
    setMessages((m) => [...m, { id, role: 'bot', text, sources }])
    setAnswersCount((c) => c + 1)
  }

  const handleAsk = async () => {
    const q = input.trim()
    if (!q) return
    setInput('')
    sendUser(q)
    const res = await postJSON('/api/answer', { q }) as any
    if (Array.isArray(res.messages)) {
      res.messages.forEach((m: any) => pushBot(m.text, m.sources))
    } else if (res.text) {
      pushBot(res.text, res.sources)
    } else {
      pushBot('Sorry, I could not find an answer.')
    }
  }

  // Nudge after two answers
  useEffect(() => {
    if (!hasNudgedRef.current && answersCount >= 2 && !leadMode) {
      hasNudgedRef.current = true
      setMessages((m) => [
        ...m,
        {
          id: `n-${Date.now()}`,
          role: 'bot',
          kind: 'nudge',
          text: 'Want a quick quote? I can grab a few details and send it to your email.',
        },
      ])
    }
  }, [answersCount, leadMode])

  const acceptNudge = () => {
    setLeadMode(true)
    setMessages((m) => [
      ...m,
      { id: `l1-${Date.now()}`, role: 'bot', kind: 'lead', text: 'Great — what’s your name?' },
    ])
  }

  const onLeadSubmit = async () => {
    if (!lead.name || !lead.email || !lead.companySize) return
    await postJSON('/api/lead', lead)
    setLeadMode(false)
    setMessages((m) => [
      ...m,
      { id: `l4-${Date.now()}`, role: 'bot', text: 'Thanks! I’ll email a quick quote shortly.' },
    ])
  }

  // Mocked Q&A server-side shape (local only)
  const canned = useMemo(() => ({
    normalize: (q: string) => q.toLowerCase(),
    answer(q: string) {
      const n = this.normalize(q)
      if (n.includes('soc 2')) {
        return { text: 'Yes — We are SOC 2 aligned and follow industry best practices.', sources: [SOURCES.soc2] }
      }
      if (n.includes('residency') || n.includes('india')) {
        return { text: 'We support data residency options including India via regional hosting.', sources: [SOURCES.residencyIN] }
      }
      if (n.includes('api') && (n.includes('limit') || n.includes('rate'))) {
        return { text: 'Default API limit is 60 requests/min per key with bursts to 120. Higher tiers available.', sources: [SOURCES.apiLimits] }
      }
      return { text: 'I can help with pricing, security certifications, data residency, and API limits.', sources: [] }
    },
  }), [])

  // Lightweight server emulation through local API
  // Note: real logic resides in /api/answer but we re-use map for optimistic UX
  useEffect(() => {
    // nothing
  }, [])

  return (
    <div className="chatbot" role="complementary" aria-label="Quick Answer Bot">
      <div className="chat-header">
        <span>Quick Answers</span>
        <button className="pill" onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'Show'}</button>
      </div>
      {open && (
        <>
          <div className="chat-body" id="chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
                <div>{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="source">
                    Sources: {m.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                    )).reduce((prev, curr) => [prev, ' • ', curr] as any)}
                  </div>
                )}
                {m.kind === 'nudge' && (
                  <div style={{ marginTop: 8 }}>
                    <button className="btn" onClick={acceptNudge}>Yes, quick quote</button>
                  </div>
                )}
              </div>
            ))}
            {leadMode && (
              <div className="bubble bot">
                <div className="lead-form">
                  <input placeholder="Name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                  <input placeholder="Work email" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                  <select value={lead.companySize} onChange={(e) => setLead({ ...lead, companySize: e.target.value })}>
                    <option value="">Company size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                  </select>
                  <button className="btn" onClick={onLeadSubmit}>Submit</button>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              placeholder="Ask anything (e.g., Do you have SOC 2?)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAsk() }}
            />
            <button className="btn secondary" onClick={handleAsk}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}
