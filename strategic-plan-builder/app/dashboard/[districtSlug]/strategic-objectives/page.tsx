'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Components
import MainViewExact from '@/components/MainViewExact';
import { dbService } from '@/lib/db-service';
import { District, GoalWithMetrics, buildGoalHierarchy } from '@/lib/types';

export default function StrategicObjectivesPage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.districtSlug as string;
  
  const [district, setDistrict] = useState<District | null>(null);
  const [goals, setGoals] = useState<GoalWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [districtSlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dbService.getDistrict(districtSlug);
      
      if (!data) {
        throw new Error('District not found');
      }

      setDistrict(data);

      // Build hierarchical goals structure
      if (data.goals) {
        const flatGoals: any[] = [];
        const flatMetrics: any[] = [];
        
        const flattenGoals = (goals: any[]) => {
          goals.forEach(goal => {
            const { children, metrics, ...goalData } = goal;
            flatGoals.push(goalData);
            if (metrics) {
              flatMetrics.push(...metrics);
            }
            if (children && children.length > 0) {
              flattenGoals(children);
            }
          });
        };
        
        flattenGoals(data.goals);
        const hierarchicalGoals = buildGoalHierarchy(flatGoals, flatMetrics);
        setGoals(hierarchicalGoals);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load strategic objectives';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = (goalId: string) => {
    // Navigate to the goals page with drilldown view
    router.push(`/dashboard/${districtSlug}/strategic-goals?view=drilldown&goalId=${goalId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading strategic objectives...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!loading && !district)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Strategic Objectives
              </h3>
              <p className="text-slate-600 mb-4">
                {error || 'District not found'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={loadData}>
                  Retry
                </Button>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainViewExact
      district={district}
      goals={goals}
      onDrillDown={handleDrillDown}
      districtSlug={districtSlug}
    />
  );
}