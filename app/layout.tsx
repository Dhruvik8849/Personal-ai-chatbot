import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Dhruvik AI Assistant',
  description: 'Ask Dhruvik about his work, availability, and contact details.',
  applicationName: 'Dhruvik AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}