
import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: 'Your App Title',
  description: 'Your app description.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
