'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  HelpCircle, 
  Settings, 
  Menu, 
  X, 
  Home,
  Target,
  BarChart3,
  UserPlus,
  Eye,
  Search,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  districtSlug?: string;
  showSettings?: boolean;
  showNotifications?: boolean;
  showHelp?: boolean;
  showAdminHome?: boolean;
  showQuickActions?: boolean;
  onSearch?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  children?: ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  districtSlug,
  showSettings = true,
  showNotifications = true,
  showHelp = true,
  showAdminHome = false,
  showQuickActions = false,
  onSearch,
  onExport,
  onRefresh,
  children
}: AppHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const quickActions = [
    {
      label: 'Manage Goals',
      description: 'Edit objectives & metrics',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50 hover:border-blue-300',
      onClick: () => router.push(`/districts/${districtSlug}/admin`)
    },
    {
      label: 'View Dashboards',
      description: 'Track progress & insights',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50 hover:border-green-300',
      onClick: () => router.push(`/dashboard/${districtSlug}/strategic-goals`)
    },
    {
      label: 'Invite Team',
      description: 'Add collaborators',
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50 hover:border-purple-300',
      onClick: () => toast.info('Team management coming soon!')
    },
    {
      label: 'Public View',
      description: 'See what others see',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'hover:bg-orange-50 hover:border-orange-300',
      onClick: () => window.open(`/public/${districtSlug}`, '_blank')
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Quick Actions Dropdown */}
            {showQuickActions && districtSlug && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Menu className="h-4 w-4" />
                      Quick Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {quickActions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                        className={`cursor-pointer ${action.bgColor} transition-colors`}
                      >
                        <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{action.label}</span>
                          <span className="text-xs text-gray-500">{action.description}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="h-8 w-px bg-gray-200" />
              </>
            )}

            {/* Search Button */}
            {onSearch && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSearch}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            )}

            {/* Export Button */}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Export</span>
              </Button>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Refresh</span>
              </Button>
            )}

            {children && (
              <>
                {(onSearch || onExport || onRefresh) && <div className="h-8 w-px bg-gray-200" />}
                {children}
              </>
            )}

            {/* Separator before system buttons */}
            {(showQuickActions || onSearch || onExport || onRefresh || children) && 
             (showAdminHome || showNotifications || showHelp || showSettings) && (
              <div className="h-8 w-px bg-gray-200" />
            )}

            {/* Dev Only: Admin Navigation */}
            {showAdminHome && process.env.NODE_ENV === 'development' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Admin Home
                </Button>
                {(showNotifications || showHelp || showSettings) && (
                  <div className="h-8 w-px bg-gray-200" />
                )}
              </>
            )}
            
            {showNotifications && (
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            {showHelp && (
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
            
            {showSettings && districtSlug && (
              <>
                {(showNotifications || showHelp) && (
                  <div className="h-8 w-px bg-gray-200 mx-1" />
                )}
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={() => router.push(`/dashboard/${districtSlug}/settings`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t py-4 space-y-1">
            {/* Quick Actions in Mobile */}
            {showQuickActions && districtSlug && (
              <>
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                </div>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start px-4 py-3"
                    onClick={() => {
                      action.onClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-gray-500">{action.description}</span>
                    </div>
                  </Button>
                ))}
                <div className="my-2 border-t" />
              </>
            )}

            {/* Action Buttons in Mobile */}
            {onSearch && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  onSearch();
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            )}

            {onExport && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  onExport();
                  setMobileMenuOpen(false);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            {onRefresh && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  onRefresh();
                  setMobileMenuOpen(false);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}

            {(onSearch || onExport || onRefresh) && 
             (showAdminHome || showNotifications || showHelp || showSettings) && (
              <div className="my-2 border-t" />
            )}

            {/* System Navigation in Mobile */}
            {showAdminHome && process.env.NODE_ENV === 'development' && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  router.push('/admin');
                  setMobileMenuOpen(false);
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Admin Home
              </Button>
            )}
            
            {showNotifications && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            )}
            
            {showHelp && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            )}
            
            {showSettings && districtSlug && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  router.push(`/dashboard/${districtSlug}/settings`);
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            
            {children}
          </div>
        )}
      </div>
    </div>
  );
}