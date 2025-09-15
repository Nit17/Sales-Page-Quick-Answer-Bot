# Sales Page Quick Answer Bot

A minimal Next.js (Pages Router + TypeScript) demo that delivers fast, sourced answers, right-moment nudges, natural lead capture, and streaming RAG from local docs.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Scenario walkthrough

- Visit /pricing and scroll ~70% (event logged to /api/events)
- Navigate to /security
- Ask: "Do you have SOC 2 and data residency in India?"
  - You should get two fast answers with sources.
- After two answers, you'll see a nudge: "Want a quick quote?"
- Accept the nudge, provide name, work email, and company size.
- Ask a follow-up: "What are the API limits?"

All answers include citations. Answers are streamed from `/api/answer-stream` using local docs in `data/docs`. Lead submission posts to `/api/lead` and is written to `data/leads.json`.

## Notes

- This is a demo with canned responses. Replace /pages/api/answer.ts with your own retrieval and citations logic.
- Streaming endpoint: `/api/answer-stream` (SSE). Local docs: `data/docs/*`.
- Admin dashboard: `/admin?key=admin` shows leads and events (set ADMIN_KEY env to customize).
- No external services required. All data is local and ephemeral.
