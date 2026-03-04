import { ReactNode } from 'react'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden px-3 pt-3 gap-3">
      <Header />
      <main className="flex-1 flex min-h-0">
        {children}
      </main>
    </div>
  )
}
