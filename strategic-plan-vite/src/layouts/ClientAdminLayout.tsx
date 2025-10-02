import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { Settings, Target, BarChart2, FileText, Eye, Shield } from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientAdminLayout - Layout for client admin area (/:slug/admin)
 * Only accessible to users with admin rights for the specific district
 */
export function ClientAdminLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: district, isLoading } = useDistrict(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* District Info */}
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-white" />
              <div>
                <h1 className="text-xl font-semibold text-white">{district.name}</h1>
                <p className="text-xs text-white/80">Administration Panel</p>
              </div>
            </div>

            {/* Admin Navigation */}
            <nav className="flex items-center gap-4">
              <Link
                to={`/${slug}/admin`}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>
              <Link
                to={`/${slug}/admin/goals`}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Target className="h-4 w-4 inline mr-1" />
                Goals
              </Link>
              <Link
                to={`/${slug}/admin/metrics`}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <BarChart2 className="h-4 w-4 inline mr-1" />
                Metrics
              </Link>
              <Link
                to={`/${slug}/admin/audit`}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Audit
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <button
                onClick={() => navigate(`/${slug}`)}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Eye className="h-4 w-4 inline mr-1" />
                View Public
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
