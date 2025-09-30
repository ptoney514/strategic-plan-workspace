'use client';

import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/AuthProvider'
import { QueryProvider } from '@/providers/query-provider'
import { ReactNode } from 'react'

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster />
    </QueryProvider>
  );
}