import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Timeback - Edu Platform Vaidik',
  description: 'Created by Vaidik Edu Team',
  generator: 'Ayush',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
