import { Outlet, Link, useParams } from 'react-router-dom';
import { Home, Target, BarChart2 } from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientPublicLayout - Layout for public client pages (/:slug)
 * Accessible to everyone, displays public strategic plan information
 */
export function ClientPublicLayout() {
  const { slug } = useParams<{ slug: string }>();
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
      {/* Public Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* District Info */}
            <div>
              <h1 className="text-xl font-semibold text-foreground">{district.name}</h1>
              <p className="text-sm text-muted-foreground">Strategic Plan</p>
            </div>

            {/* Public Navigation */}
            <nav className="flex items-center gap-4">
              <Link
                to={`/${slug}`}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Link
                to={`/${slug}/goals`}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                <Target className="h-4 w-4 inline mr-1" />
                Goals
              </Link>
              <Link
                to={`/${slug}/metrics`}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                <BarChart2 className="h-4 w-4 inline mr-1" />
                Metrics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {district.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
