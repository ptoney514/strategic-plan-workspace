import { ArrowRight, LucideIcon } from 'lucide-react';
import { DonutChart } from './donut-chart';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ObjectiveDetailView } from './objective-detail-view';

interface ObjectiveCardProps {
  goalNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  status: 'On Target' | 'Watch' | 'Off Track';
  percentage: number;
  kpiText: string;
  additionalInfo: string;
  icons: LucideIcon[];
  lastUpdated: string;
  href: string;
  onViewObjective?: () => void;
}

export function ObjectiveCard({
  goalNumber,
  title,
  description,
  imageUrl,
  imageAlt,
  status,
  percentage,
  kpiText,
  additionalInfo,
  icons,
  lastUpdated,
  href,
  onViewObjective
}: ObjectiveCardProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'On Target':
        return 'bg-emerald-500/90 text-white';
      case 'Watch':
        return 'bg-amber-500/90 text-white';
      case 'Off Track':
        return 'bg-red-500/90 text-white';
      default:
        return 'bg-neutral-500/90 text-white';
    }
  };

  const getChartColor = (status: string) => {
    switch (status) {
      case 'On Target':
        return '#10B981';
      case 'Watch':
        return '#F59E0B';
      case 'Off Track':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleViewObjective = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewObjective?.();
  };

  return (
    <div className="group relative rounded-2xl bg-white ring-1 ring-neutral-200 overflow-hidden hover:shadow-lg transition">
      <div className="relative h-28">
        <ImageWithFallback
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent"></div>
        
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-2.5 py-1">
          <span className="text-[11px] text-neutral-700">Goal {goalNumber}</span>
        </div>
        
        <div className={`absolute top-3 right-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 ${getStatusStyle(status)}`}>
          <span className="h-2 w-2 rounded-full bg-white/80"></span>
          <span className="text-[11px]">{status}</span>
        </div>
      </div>

      <div className="p-4 h-52 flex flex-col">
        <h3 className="text-lg tracking-tight text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600 mt-1">{description}</p>
        
        <div className="flex-grow min-h-6"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DonutChart 
              value={percentage} 
              color={getChartColor(status)}
            />
            <div className="text-xs text-neutral-600">
              <div>{kpiText}</div>
              <div>{additionalInfo}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-neutral-600">
            {icons.map((Icon, index) => (
              <Icon key={index} className="h-4 w-4" />
            ))}
          </div>
        </div>
        
        <div className="mt-4 pb-6 flex items-center justify-between gap-2 min-h-[32px]">
          <span className="text-xs text-neutral-500 truncate flex-shrink">Updated {lastUpdated}</span>
          <button 
            onClick={handleViewObjective}
            className="inline-flex items-center gap-2 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 transition rounded-lg px-3 py-1.5 flex-shrink-0"
          >
            View Objective
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}