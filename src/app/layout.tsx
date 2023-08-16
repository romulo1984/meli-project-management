import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import ConvexClientProvider from '../contexts/ConvexClientProvider'
import Navbar from '@/components/navbar'
const roboto = Roboto({ subsets: ['latin'], weight: ['100', '400', '900'] })

export const metadata: Metadata = {
  title: 'Meli Project Management',
  description: 'Retrônomo',
}

interface LayoutProps { children: React.ReactNode }

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ConvexClientProvider>
          <Navbar />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
