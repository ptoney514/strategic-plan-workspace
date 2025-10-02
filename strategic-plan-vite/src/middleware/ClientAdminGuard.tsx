import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ClientAdminGuardProps {
  children: ReactNode;
}

/**
 * ClientAdminGuard - Protects client admin routes
 * Only allows access to users with admin rights for the specific district
 *
 * Usage:
 * <ClientAdminGuard>
 *   <ClientAdminLayout />
 * </ClientAdminGuard>
 */
export function ClientAdminGuard({ children }: ClientAdminGuardProps) {
  const { slug } = useParams<{ slug: string }>();

  // TODO: Replace with actual auth check
  // const { user, hasDistrictAccess } = useAuth();
  // const hasAccess = hasDistrictAccess(slug);
  const hasAccess = true; // Temporary - always allow for development

  if (!hasAccess) {
    // Redirect to public district view if user doesn't have admin access
    return <Navigate to={`/${slug}`} replace />;
  }

  return <>{children}</>;
}
