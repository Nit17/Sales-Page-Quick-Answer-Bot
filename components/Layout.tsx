import Link from 'next/link'
import { ReactNode } from 'react'
import Chatbot from './chat/Chatbot'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header style={{ borderBottom: '1px solid #e5e7eb' }}>
        <nav className="container" style={{ display: 'flex', gap: 16, padding: '12px 0' }}>
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/security">Security</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
      <Chatbot />
    </>
  )
}
