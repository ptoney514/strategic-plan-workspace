'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, AlertCircle, Edit2, Eye, Home } from 'lucide-react';

// Import dashboard components
import OverviewV2 from '@/components/OverviewV2';
import MainViewDashboard from '@/components/MainViewDashboard';
import MainViewExact from '@/components/MainViewExact';
import { dbService } from '@/lib/db-service';
import { GoalWithMetrics, buildGoalHierarchy } from '@/lib/types';

export default function DraftDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.slug as string;
  
  const [district, setDistrict] = useState<any>(null);
  const [goals, setGoals] = useState<GoalWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'impact' | 'strategic'>('impact');

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
      console.error('Error loading draft dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load draft dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <p className="mt-4 text-gray-600">Loading draft dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {error || 'District not found'}
              </p>
              <Button onClick={() => router.push(`/districts/${districtSlug}/admin`)}>
                Return to Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/districts/${districtSlug}/admin`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="border-l pl-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{district.name}</h1>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    DRAFT PREVIEW
                  </span>
                </div>
                <p className="text-sm text-gray-500">Impact Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('impact')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'impact' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Impact Dashboard
                </button>
                <button
                  onClick={() => setViewMode('strategic')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'strategic' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Strategic View
                </button>
              </div>

              {/* Action buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/districts/${districtSlug}/admin`)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/${districtSlug}`)}
              >
                <Home className="h-4 w-4 mr-2" />
                Districts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/homepage/${districtSlug}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'impact' ? (
          <MainViewDashboard 
            district={district}
            goals={goals}
            onDrillDown={(goalId) => {
              // Navigate to goal detail or show modal
              console.log('Drill down to goal:', goalId);
            }}
          />
        ) : (
          <OverviewV2
            district={district}
            goals={goals}
            onDrillDown={(goalId) => {
              // Navigate to goal detail or show modal
              console.log('Drill down to goal:', goalId);
            }}
          />
        )}
      </div>
    </div>
  );
}