import { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'
import "./globals.css";

export const metadata: Metadata = {
  title: 'Strategic Plan Builder',
  description: 'Build and track your district\'s strategic goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}