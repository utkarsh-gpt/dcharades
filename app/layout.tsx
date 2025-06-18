import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Game Hub - Multiplayer Online Games Collection',
  description: 'Play fun multiplayer games online with friends! Including Charades, Trivia, Drawing Games, and more. Start playing now!',
  keywords: 'online games, multiplayer games, charades, trivia, drawing game, party games, friends, word games',
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