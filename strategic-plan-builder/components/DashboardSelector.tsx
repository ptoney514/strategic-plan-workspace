'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Grid3x3, 
  BarChart3, 
  Eye, 
  Sparkles,
  ChevronDown,
  Monitor,
  Moon,
  Sun,
  Zap,
  Smartphone,
  Layout,
  Layers
} from 'lucide-react';

export type DashboardView = 'overview-v2' | 'pixel-perfect' | 'drilldown' | 'main-view-exact';

interface DashboardSelectorProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  showDrilldown?: boolean;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  hideMainViewExact?: boolean; // Option to hide main-view-exact for pages that don't need it
}

const dashboardOptions = [
  {
    id: 'overview-v2' as DashboardView,
    label: 'Impact Dashboard',
    description: 'Card-based progress view',
    icon: Grid3x3,
    badge: null,
  },
  {
    id: 'pixel-perfect' as DashboardView,
    label: 'Executive Dashboard',
    description: 'Detailed metrics with dark mode',
    icon: Sparkles,
    badge: 'NEW',
  },
  {
    id: 'main-view-exact' as DashboardView,
    label: 'Main View Exact',
    description: 'Pixel-perfect Figma with slide-out',
    icon: Layers,
    badge: 'NEW',
  },
];

export default function DashboardSelector({
  currentView,
  onViewChange,
  showDrilldown = false,
  isDarkMode = false,
  onThemeToggle,
  hideMainViewExact = false,
}: DashboardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = dashboardOptions.find(opt => opt.id === currentView) || dashboardOptions[0];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-between">
            <div className="flex items-center gap-2">
              <currentOption.icon className="w-4 h-4" />
              <span>{currentOption.label}</span>
              {currentOption.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                  {currentOption.badge}
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px]" align="end">
          <DropdownMenuLabel>Dashboard Views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currentView} onValueChange={(value) => {
            onViewChange(value as DashboardView);
            setIsOpen(false);
          }}>
            {dashboardOptions
              .filter(option => !hideMainViewExact || option.id !== 'main-view-exact')
              .map(option => (
              <DropdownMenuRadioItem 
                key={option.id} 
                value={option.id}
                className="flex flex-col items-start py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <option.icon className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">{option.label}</span>
                  {option.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      {option.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-0.5 ml-6">
                  {option.description}
                </span>
              </DropdownMenuRadioItem>
            ))}
            {showDrilldown && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem 
                  value="drilldown"
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Goal Drilldown</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5 ml-6">
                    Detailed view of selected goal
                  </span>
                </DropdownMenuRadioItem>
              </>
            )}
          </DropdownMenuRadioGroup>
          
          {/* Theme Toggle for Pixel Perfect View */}
          {currentView === 'pixel-perfect' && onThemeToggle && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onThemeToggle}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span>Theme</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {isDarkMode ? 'Dark' : 'Light'}
                  </span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick theme toggle button for pixel-perfect view */}
      {currentView === 'pixel-perfect' && onThemeToggle && (
        <Button
          variant="outline"
          size="icon"
          onClick={onThemeToggle}
          className="h-9 w-9"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}