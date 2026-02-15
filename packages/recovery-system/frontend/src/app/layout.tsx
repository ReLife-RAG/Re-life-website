import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Re-Life Recovery System',
  description: 'RAG-based addiction recovery system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
