import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Charades Game - Online Two Player Movie Guessing Game',
  description: 'Play charades online with a friend! Guess Hollywood and Bollywood movies in this fun two-player game.',
  keywords: 'charades, movie game, online game, two player, guessing game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-900">
            {children}
          </main>
        </SocketProvider>
      </body>
    </html>
  )
} 