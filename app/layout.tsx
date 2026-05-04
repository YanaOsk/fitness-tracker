import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitLife – מעקב כושר ותזונה',
  description: 'אפליקציית מעקב כושר ותזונה מותאמת אישית לנשים בהריון, נשים וגברים',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
