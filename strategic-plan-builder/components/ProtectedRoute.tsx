'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, hasDistrictAccess } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  districtId?: string;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  districtId,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [districtId]);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      if (districtId) {
        const hasAccess = await hasDistrictAccess(user.id, districtId);
        if (!hasAccess) {
          router.push('/unauthorized');
          return;
        }
      }

      if (requireAdmin) {
        const { getUserProfile } = await import('@/lib/auth');
        const profile = await getUserProfile(user.id);
        if (profile?.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}