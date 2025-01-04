// app/layout.tsx
import './globals.css'  // Import Tailwind's global styles
import { ReactNode } from 'react'

export const metadata = {
  title: 'Your App Title',
  description: 'Your app description.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black"> {/* You can add Tailwind classes here */}
        {children}
      </body>
    </html>
  )
}
