import {
  BookOpen,
  Heart,
  Target,
  Users,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Handshake,
  Globe,
  ShieldCheck,
  Building2,
  Wallet
} from 'lucide-react';
import { ObjectiveCard } from './objective-card';
import { ObjectiveDetailView } from './objective-detail-view';
import { useState } from 'react';

export function ObjectivesGrid() {
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const objectives = [
    {
      goalNumber: 1,
      title: 'Student Achievement & Well-being',
      description: 'Literacy, numeracy, attendance, and belonging.',
      imageUrl: 'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNvbGxhYm9yYXRpbmclMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwxfHx8fDE3NTc0OTk2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Students collaborating in classroom',
      status: 'On Target' as const,
      percentage: 72,
      kpiText: '12/16 KPIs on target',
      additionalInfo: '4 initiatives this quarter',
      icons: [BookOpen, Heart, Target],
      lastUpdated: '2d ago',
      href: '#objective-1'
    },
    {
      goalNumber: 2,
      title: 'Supported & Engaged Staff',
      description: 'Recruitment, retention, development, and wellness.',
      imageUrl: 'https://images.unsplash.com/photo-1722643882339-7a6c9cb080db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVycyUyMHN0YWZmJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3NDk5NjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Teachers collaborating in meeting',
      status: 'Watch' as const,
      percentage: 61,
      kpiText: '8/13 KPIs on target',
      additionalInfo: '2 areas need attention',
      icons: [Users, GraduationCap, HeartHandshake],
      lastUpdated: '5d ago',
      href: '#objective-2'
    },
    {
      goalNumber: 3,
      title: 'Community, Collaboration, & Partnerships',
      description: 'Family engagement and community impact.',
      imageUrl: 'https://images.unsplash.com/photo-1696041761463-8532347f4a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBwYXJ0bmVyc2hpcCUyMGZhbWlseSUyMGVuZ2FnZW1lbnR8ZW58MXx8fHwxNzU3NDk5NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Community partnership meeting',
      status: 'On Target' as const,
      percentage: 68,
      kpiText: '10/15 KPIs on target',
      additionalInfo: 'Community NPS +12',
      icons: [Megaphone, Handshake, Globe],
      lastUpdated: '1d ago',
      href: '#objective-3'
    },
    {
      goalNumber: 4,
      title: 'Finance, Safety, & Infrastructure',
      description: 'Stewardship, facilities, and secure learning environments.',
      imageUrl: 'https://images.unsplash.com/photo-1706969151544-dfefd704a3b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBidWlsZGluZyUyMGluZnJhc3RydWN0dXJlJTIwbW9kZXJufGVufDF8fHx8MTc1NzQ5OTYxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Modern school building',
      status: 'On Target' as const,
      percentage: 80,
      kpiText: '12/15 KPIs on target',
      additionalInfo: 'Budget variance -1.2%',
      icons: [ShieldCheck, Building2, Wallet],
      lastUpdated: '6h ago',
      href: '#objective-4'
    }
  ];

  const handleViewObjective = (objective: any) => {
    setSelectedObjective(objective);
    setIsDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setSelectedObjective(null);
  };

  return (
    <section className="mt-6 md:mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 items-stretch">
        {objectives.map((objective, index) => (
          <ObjectiveCard 
            key={index} 
            {...objective} 
            onViewObjective={() => handleViewObjective(objective)}
          />
        ))}
      </div>

      {selectedObjective && (
        <ObjectiveDetailView
          objective={selectedObjective}
          isOpen={isDetailViewOpen}
          onClose={handleCloseDetailView}
        />
      )}
    </section>
  );
}