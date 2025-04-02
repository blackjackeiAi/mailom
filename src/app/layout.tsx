import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'  // Correct import
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'ร้านขายต้นไม้ใหญ่',
  description: 'ระบบจัดการร้านขายต้นไม้',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={notoSansThai.className}>
      <body>{children}</body>
    </html>
  )
}
