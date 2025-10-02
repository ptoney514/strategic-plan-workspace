import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SystemAdminGuardProps {
  children: ReactNode;
}

/**
 * SystemAdminGuard - Protects system admin routes
 * Only allows access to users with system administrator role
 *
 * Usage:
 * <SystemAdminGuard>
 *   <SystemAdminLayout />
 * </SystemAdminGuard>
 */
export function SystemAdminGuard({ children }: SystemAdminGuardProps) {
  // TODO: Replace with actual auth check
  // const { user, isSystemAdmin } = useAuth();
  const isSystemAdmin = true; // Temporary - always allow for development

  if (!isSystemAdmin) {
    // Redirect to home if not a system admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
