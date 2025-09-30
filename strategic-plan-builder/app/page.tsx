'use client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Target,
  BarChart3,
  Users,
  Home as HomeIcon,
  Layout,
  Globe,
  Settings,
  FileText,
  TrendingUp,
  Building2,
  Presentation,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const navigationCards = [
    {
      title: 'District Admin',
      description: 'Manage districts, goals, and strategic objectives',
      icon: Building2,
      href: '/admin',
      color: 'bg-blue-500'
    },
    {
      title: 'Test District',
      description: 'Strategic goals and metrics dashboard',
      icon: BarChart3,
      href: '/dashboard/test-district/strategic-goals',
      color: 'bg-green-500'
    },
    {
      title: 'Impact Dashboard',
      description: 'View district impact and progress metrics',
      icon: Presentation,
      href: '/dashboard/test-district/impact',
      color: 'bg-orange-500'
    },
    {
      title: 'Strategic Objectives',
      description: 'Manage high-level strategic objectives',
      icon: Target,
      href: '/dashboard/test-district/strategic-objectives',
      color: 'bg-indigo-500'
    },
    {
      title: 'Public Homepage',
      description: 'Public-facing district information',
      icon: Globe,
      href: '/homepage/test-district',
      color: 'bg-cyan-500'
    },
    {
      title: 'Marketing Page',
      description: 'Product features and pricing information',
      icon: ExternalLink,
      href: '/marketing',
      color: 'bg-pink-500'
    },
    {
      title: 'Documentation',
      description: 'User guides and API documentation',
      icon: FileText,
      href: '#',
      color: 'bg-slate-500',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Strategic Plan Builder
              </h1>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                Navigation Hub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quick Navigation
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Access all areas of the Strategic Plan Builder application
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.href}
                className={`
                  group hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${card.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}
                `}
                onClick={() => !card.disabled && router.push(card.href)}
              >
                <CardHeader>
                  <div className={`
                    w-12 h-12 rounded-lg ${card.color} bg-opacity-10
                    flex items-center justify-center mb-3
                    group-hover:bg-opacity-20 transition-colors
                  `}>
                    <Icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Districts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">12</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Strategic Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">24</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Metrics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">87%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Progress</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New District
            </button>
            <button
              onClick={() => router.push('/dashboard/test-district/strategic-goals')}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              View Test District Goals
            </button>
            <button
              onClick={() => router.push('/marketing')}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              View Marketing Site
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white dark:bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Strategic Plan Builder v1.0.0
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="/marketing"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="/admin"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Admin
              </a>
              <a
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}