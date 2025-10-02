import { useState } from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { Home, Target, BarChart2, Menu, X } from 'lucide-react';
import { useDistrict } from '../hooks/useDistricts';

/**
 * ClientPublicLayout - Layout for public client pages (/:slug)
 * Accessible to everyone, displays public strategic plan information
 */
export function ClientPublicLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading } = useDistrict(slug!);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Public Header - Sticky with Mobile Support */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* District Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{district.name}</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Strategic Plan</p>
            </div>

            {/* Public Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to={`/${slug}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to={`/${slug}/goals`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
              >
                <Target className="h-4 w-4" />
                Goals
              </Link>
              <Link
                to={`/${slug}/metrics`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
              >
                <BarChart2 className="h-4 w-4" />
                Metrics
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 pt-2 border-t border-border space-y-2">
              <Link
                to={`/${slug}`}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to={`/${slug}/goals`}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Target className="h-4 w-4" />
                Goals
              </Link>
              <Link
                to={`/${slug}/metrics`}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart2 className="h-4 w-4" />
                Metrics
              </Link>
            </nav>
          )}
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
