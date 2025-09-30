'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDistrict } from '@/hooks/use-district';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/layout/AppHeader';
import { toast } from 'sonner';
import { 
  Loader2, 
  Users, 
  Settings, 
  BarChart3, 
  Target,
  CreditCard,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Rocket,
  Crown,
  Star,
  ArrowUpRight,
  UserPlus,
  Key,
  History,
  Download,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Video,
  Gift,
  Home
} from 'lucide-react';

export default function DistrictHub() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.districtSlug as string;
  
  const { data: district, isLoading: loading, error: queryError } = useDistrict(districtSlug);
  const [setupProgress, setSetupProgress] = useState(0);
  
  useEffect(() => {
    // Calculate setup progress based on what's completed
    if (district) {
      let progress = 25; // Base for having an account
      if (district.goals && district.goals.length > 0) progress += 25;
      if (district.goals?.some((g: any) => g.metrics && g.metrics.length > 0)) progress += 25;
      // Mock: if they have team members
      progress += 15;
      setSetupProgress(progress);
    }
  }, [district]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-4 text-slate-600">Loading your workspace...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (queryError || !district) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Unable to load workspace</p>
              <Button onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = {
    objectives: district.goals?.filter((g: any) => g.level === 0).length || 0,
    goals: district.goals?.reduce((acc: number, obj: any) => {
      return acc + (obj.children?.filter((c: any) => c.level === 1).length || 0);
    }, 0) || 0,
    metrics: district.goals?.reduce((acc: number, obj: any) => {
      const countMetrics = (goal: any): number => {
        let count = goal.metrics?.length || 0;
        if (goal.children) {
          goal.children.forEach((child: any) => {
            count += countMetrics(child);
          });
        }
        return count;
      };
      return acc + countMetrics(obj);
    }, 0) || 0,
    users: 3, // Mock
    lastUpdated: '2 hours ago' // Mock
  };

  const recentActivity = [
    { id: 1, action: 'Goal updated', user: 'Sarah Chen', time: '2 hours ago', icon: Target },
    { id: 2, action: 'New metric added', user: 'Mike Johnson', time: '5 hours ago', icon: TrendingUp },
    { id: 3, action: 'Team member invited', user: 'You', time: 'Yesterday', icon: UserPlus },
  ];

  const upcomingMilestones = [
    { id: 1, title: 'Q4 Review Meeting', date: 'Dec 15, 2025', status: 'upcoming' },
    { id: 2, title: 'Annual Report Due', date: 'Jan 5, 2026', status: 'upcoming' },
    { id: 3, title: 'Strategic Plan Update', date: 'Jan 20, 2026', status: 'planned' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Quick Actions */}
      <AppHeader
        title={`Welcome back to ${district.name}`}
        subtitle="Your strategic planning command center"
        districtSlug={districtSlug}
        showAdminHome={true}
        showQuickActions={true}
        showSettings={true}
        showNotifications={true}
        showHelp={true}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump right into your most common tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => router.push(`/districts/${districtSlug}/admin`)}
                >
                  <Target className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Manage Goals</span>
                  <span className="text-xs text-gray-500">Edit objectives & metrics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-green-50 hover:border-green-300"
                  onClick={() => router.push(`/dashboard/${districtSlug}/strategic-goals`)}
                >
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <span className="font-medium">View Dashboards</span>
                  <span className="text-xs text-gray-500">Track progress & insights</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => toast.info('Team management coming soon!')}
                >
                  <UserPlus className="h-6 w-6 text-purple-600" />
                  <span className="font-medium">Invite Team</span>
                  <span className="text-xs text-gray-500">Add collaborators</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-orange-50 hover:border-orange-300"
                  onClick={() => window.open(`/public/${districtSlug}`, '_blank')}
                >
                  <ArrowUpRight className="h-6 w-6 text-orange-600" />
                  <span className="font-medium">Public View</span>
                  <span className="text-xs text-gray-500">See what others see</span>
                </Button>
              </CardContent>
            </Card>

            {/* Activity & Milestones Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="mt-4 space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <activity.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="link" className="w-full">
                      View all activity
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="milestones" className="mt-4 space-y-3">
                    {upcomingMilestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{milestone.title}</p>
                          <p className="text-xs text-gray-500">{milestone.date}</p>
                        </div>
                        <Badge variant="outline">{milestone.status}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="team" className="mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          SC
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Sarah Chen</p>
                          <p className="text-xs text-gray-500">Admin • sarah@district.edu</p>
                        </div>
                        <Badge>Owner</Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                          MJ
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mike Johnson</p>
                          <p className="text-xs text-gray-500">Editor • mike@district.edu</p>
                        </div>
                        <Badge variant="secondary">Editor</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Team Member
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* New Feature Announcement */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <CardTitle className="text-white">New Feature: AI Goal Suggestions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-4">
                  Let AI help you create better strategic goals based on best practices from similar organizations.
                </p>
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  Try it now
                  <Rocket className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Account & Resources */}
          <div className="space-y-6">
            {/* Setup Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Your workspace is {setupProgress}% complete</span>
                    <span className="font-medium">{setupProgress}/100</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">Account created</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">First objective added</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {stats.metrics > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-gray-600">Metrics configured</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Team invited</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Objectives</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.objectives}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">Goals</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.goals}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Metrics</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.metrics}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Team Size</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.users}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Last Update</span>
                    </div>
                    <span className="text-sm font-medium">{stats.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Professional Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Users</span>
                    <span className="font-medium">3 / 10</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">2.1 GB / 50 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">API Calls</span>
                    <span className="font-medium">1,240 / 10,000</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-3">Next billing: Jan 1, 2026</p>
                    <Button variant="outline" className="w-full" onClick={() => toast.info('Upgrade options coming soon!')}>
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade to Enterprise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Support Chat
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Version History
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Two-factor auth</span>
                  <Badge variant="outline" className="text-green-600">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last backup</span>
                  <span className="text-xs">2 hours ago</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => router.push(`/dashboard/${districtSlug}/settings/privacy`)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}