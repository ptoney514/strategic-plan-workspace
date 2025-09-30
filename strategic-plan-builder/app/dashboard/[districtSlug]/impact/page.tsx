'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DistrictSwitcher from '@/components/DistrictSwitcher';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, AlertCircle, Home, Settings, LayoutGrid, BarChart2, TrendingUp } from 'lucide-react';

// Components
import OverviewV2 from '@/components/OverviewV2';
import GoalDrilldown from '@/components/GoalDrilldown';

import { dbService } from '@/lib/db-service';
import { GoalWithMetrics, buildGoalHierarchy } from '@/lib/types';

export default function ImpactDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.districtSlug as string;
  
  const [district, setDistrict] = useState<any>(null);
  const [goals, setGoals] = useState<GoalWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to load impact dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowDrilldown(true);
  };

  const handleBackToOverview = () => {
    setSelectedGoalId(null);
    setShowDrilldown(false);
  };

  const handleEditGoal = (goalId: string) => {
    router.push(`/dashboard/${districtSlug}?edit=${goalId}`);
  };

  const selectedGoal = selectedGoalId 
    ? goals.find(g => g.id === selectedGoalId)
    : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-40" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading impact dashboard...</p>
          </div>
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
                Failed to Load Impact Dashboard
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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Updated with max-width container */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {showDrilldown && (
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {district.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {showDrilldown && selectedGoal
                    ? `Strategic Goal - ${selectedGoal.title}`
                    : 'Impact Dashboard'
                  }
                </p>
              </div>
              {/* District Switcher */}
              <DistrictSwitcher 
                currentDistrictSlug={districtSlug} 
                currentDistrictName={district.name}
              />
            </div>
            <div className="flex gap-2">
              {/* Dashboard Navigation */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/${districtSlug}/strategic-objectives`)}
                title="Strategic Plan Dashboard"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Strategic Plan
              </Button>
              <Button 
                variant="default" 
                size="sm"
                disabled
                title="Impact Dashboard (Current)"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Impact Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/districts/${districtSlug}/admin`)}
                title="Administration Dashboard"
              >
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/`)}
                title="Homepage"
              >
                <Home className="w-4 h-4 mr-1" />
                Homepage
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className={showDrilldown ? 'max-w-[1400px] mx-auto px-6 py-6' : ''}>
          {showDrilldown && selectedGoal ? (
            <GoalDrilldown
              goal={selectedGoal}
              districtName={district.name}
              districtSlug={districtSlug}
              onBack={handleBackToOverview}
              onEditGoal={handleEditGoal}
              onRefresh={loadData}
            />
          ) : (
            <OverviewV2
              district={district}
              goals={goals}
              onDrillDown={handleDrillDown}
            />
          )}
        </div>

        {/* Success Story and How You Can Help sections */}
        {!showDrilldown && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Success Story */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium opacity-90">Success Story</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Emma's Reading Journey</h2>
              
              <p className="text-lg mb-6 opacity-95">
                "Six months ago, Emma struggled with reading. Thanks to our new reading 
                specialists and personalized support, she's now reading above grade level 
                and loves picking out books at the library!"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">SJ</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm opacity-90">Emma's Mom, Grade 2</p>
                </div>
              </div>
              
              <div className="absolute top-8 right-8 opacity-20">
                <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 2H3c-.6 0-1 .4-1 1v18l4-4h15c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1zM6 7h12v2H6V7zm8 5H6v-2h8v2zm4-3h-2V7h2v2z"/>
                </svg>
              </div>
            </div>

            {/* How You Can Help */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">How You Can Help</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Volunteer to Read</h3>
                    <p className="text-gray-600 mb-4">
                      Help students practice reading skills during our daily reading circles.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Sign Up
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Share Your Story</h3>
                    <p className="text-gray-600 mb-4">
                      Tell us how our programs have impacted your child's learning journey.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Share Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Attend Events</h3>
                    <p className="text-gray-600 mb-4">
                      Join our monthly community events and school board meetings.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      View Calendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}