'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  Building2,
  Users,
  Shield,
  Key,
  CreditCard,
  Bell,
  Database,
  Globe,
  Code,
  FileText,
  HelpCircle,
  Settings,
  BarChart3,
  GraduationCap,
  BookOpen,
  Calendar,
  Target,
  MessageSquare,
  Briefcase,
  Award,
  Map,
  ClipboardList,
  UserCheck,
  FileBarChart,
  PieChart,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

interface SettingsSidebarProps {
  districtSlug: string;
}

export function SettingsSidebar({ districtSlug }: SettingsSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['district']);

  const navItems: NavItem[] = [
    {
      title: 'District Settings',
      href: '#',
      icon: Building2,
      children: [
        { title: 'General', href: `/dashboard/${districtSlug}/settings`, icon: Settings },
        { title: 'Profile', href: `/dashboard/${districtSlug}/settings/profile`, icon: Building2 },
        { title: 'Branding', href: `/dashboard/${districtSlug}/settings/branding`, icon: Globe },
        { title: 'Notifications', href: `/dashboard/${districtSlug}/settings/notifications`, icon: Bell },
      ],
    },
    {
      title: 'School Management',
      href: '#',
      icon: GraduationCap,
      children: [
        { title: 'Schools', href: `/dashboard/${districtSlug}/settings/schools`, icon: GraduationCap },
        { title: 'Departments', href: `/dashboard/${districtSlug}/settings/departments`, icon: Briefcase },
        { title: 'Programs', href: `/dashboard/${districtSlug}/settings/programs`, icon: BookOpen },
        { title: 'Academic Calendar', href: `/dashboard/${districtSlug}/settings/calendar`, icon: Calendar },
      ],
    },
    {
      title: 'Strategic Planning',
      href: '#',
      icon: Target,
      children: [
        { title: 'Goals & Objectives', href: `/dashboard/${districtSlug}/settings/goals`, icon: Target },
        { title: 'KPIs & Metrics', href: `/dashboard/${districtSlug}/settings/metrics`, icon: BarChart3 },
        { title: 'Reports', href: `/dashboard/${districtSlug}/settings/reports`, icon: FileBarChart },
        { title: 'Dashboards', href: `/dashboard/${districtSlug}/settings/dashboards`, icon: PieChart },
      ],
    },
    {
      title: 'Team & Access',
      href: '#',
      icon: Users,
      children: [
        { title: 'Team Members', href: `/dashboard/${districtSlug}/settings/team`, icon: Users },
        { title: 'Roles & Permissions', href: `/dashboard/${districtSlug}/settings/roles`, icon: Shield },
        { title: 'Access Logs', href: `/dashboard/${districtSlug}/settings/audit`, icon: ClipboardList },
        { title: 'API Keys', href: `/dashboard/${districtSlug}/settings/api-keys`, icon: Key },
      ],
    },
    {
      title: 'Compliance',
      href: '#',
      icon: Shield,
      children: [
        { title: 'Data Privacy', href: `/dashboard/${districtSlug}/settings/privacy`, icon: Shield },
        { title: 'Legal Documents', href: `/dashboard/${districtSlug}/settings/legal`, icon: FileText },
        { title: 'Audit Trail', href: `/dashboard/${districtSlug}/settings/audit-trail`, icon: UserCheck },
        { title: 'Certifications', href: `/dashboard/${districtSlug}/settings/certifications`, icon: Award },
      ],
    },
    {
      title: 'Billing & Usage',
      href: '#',
      icon: CreditCard,
      children: [
        { title: 'Subscription', href: `/dashboard/${districtSlug}/settings/subscription`, icon: CreditCard },
        { title: 'Usage', href: `/dashboard/${districtSlug}/settings/usage`, icon: BarChart3 },
        { title: 'Invoices', href: `/dashboard/${districtSlug}/settings/invoices`, icon: FileText },
      ],
    },
    {
      title: 'Integrations',
      href: '#',
      icon: Code,
      children: [
        { title: 'Connected Apps', href: `/dashboard/${districtSlug}/settings/integrations`, icon: Code },
        { title: 'Webhooks', href: `/dashboard/${districtSlug}/settings/webhooks`, icon: Globe },
        { title: 'Data Export', href: `/dashboard/${districtSlug}/settings/export`, icon: Database },
      ],
    },
    {
      title: 'Support',
      href: '#',
      icon: HelpCircle,
      children: [
        { title: 'Help Center', href: `/dashboard/${districtSlug}/settings/help`, icon: HelpCircle },
        { title: 'Contact Support', href: `/dashboard/${districtSlug}/settings/support`, icon: MessageSquare },
        { title: 'Feature Requests', href: `/dashboard/${districtSlug}/settings/feedback`, icon: MessageSquare },
      ],
    },
  ];

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = pathname === item.href;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              depth > 0 && 'ml-4'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{item.title}</span>
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
          depth > 0 && 'ml-8',
          isActive
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
    </div>
  );
}