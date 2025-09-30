import { CheckCircle, TrendingUp, Layers, RefreshCcw } from 'lucide-react';

export function StatisticsCards() {
  const stats = [
    {
      label: 'On Target',
      value: '73%',
      description: 'of KPIs meeting benchmarks',
      icon: CheckCircle,
      iconColor: 'text-emerald-500'
    },
    {
      label: 'Trending Up',
      value: '+9',
      description: 'KPIs improved this quarter',
      icon: TrendingUp,
      iconColor: 'text-teal-600'
    },
    {
      label: 'Active Initiatives',
      value: '42',
      description: 'across all objectives',
      icon: Layers,
      iconColor: 'text-indigo-600'
    },
    {
      label: 'Last Sync',
      value: '3h',
      description: 'data refreshed',
      icon: RefreshCcw,
      iconColor: 'text-neutral-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="rounded-2xl bg-white ring-1 ring-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <Icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <p className="mt-1 text-2xl tracking-tight">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.description}</p>
          </div>
        );
      })}
    </div>
  );
}