'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Info, AlertCircle, Calendar, Users, Target, FileText, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Goal, StrategicTheme } from '@/lib/types';
import { useGoal, useUpdateGoal, useDistrict } from '@/hooks/use-district';
import { createClient } from '@/lib/supabase';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const districtSlug = params.slug as string;
  const goalId = params.goalId as string;
  
  const { data: goal, isLoading: goalLoading } = useGoal(districtSlug, goalId);
  const { data: district } = useDistrict(districtSlug);
  const updateGoalMutation = useUpdateGoal(districtSlug);
  
  const [themes, setThemes] = useState<StrategicTheme[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for all fields
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    
    // Ownership & Accountability
    owner_name: '',
    department: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    status_detail: 'not_started' as 'not_started' | 'planning' | 'in_progress' | 'completed' | 'on_hold',
    
    // Timeline & Planning
    start_date: '',
    end_date: '',
    review_frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'annually',
    
    // Budget & Resources
    budget_allocated: 0,
    budget_spent: 0,
    
    // Strategic Alignment
    strategic_theme_id: '',
    executive_summary: '',
    is_public: true
  });

  // Load goal data when available
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        owner_name: goal.owner_name || '',
        department: goal.department || '',
        priority: goal.priority || 'medium',
        status_detail: goal.status_detail || 'not_started',
        start_date: goal.start_date || '',
        end_date: goal.end_date || '',
        review_frequency: goal.review_frequency || 'monthly',
        budget_allocated: goal.budget_allocated || 0,
        budget_spent: goal.budget_spent || 0,
        strategic_theme_id: goal.strategic_theme_id || '',
        executive_summary: goal.executive_summary || '',
        is_public: goal.is_public !== false
      });
    }
  }, [goal]);

  // Load strategic themes
  useEffect(() => {
    const loadThemes = async () => {
      if (!district) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('spb_strategic_themes')
        .select('*')
        .eq('district_id', district.id)
        .order('display_order');
      
      if (!error && data) {
        setThemes(data);
      }
    };
    
    loadThemes();
  }, [district]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!goal) return;
    
    setIsSaving(true);
    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates: formData
      });
      toast.success('Goal updated successfully');
      router.push(`/districts/${districtSlug}/admin`);
    } catch (error) {
      toast.error('Failed to update goal');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getGoalTypeLabel = () => {
    if (!goal) return '';
    if (goal.level === 0) return 'Strategic Objective';
    if (goal.level === 1) return 'Goal';
    return 'Sub-goal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on_hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'not_started': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (goalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Goal not found</p>
          <Button 
            onClick={() => router.push(`/districts/${districtSlug}/admin`)}
            className="mt-4"
          >
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/districts/${districtSlug}/admin`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edit {getGoalTypeLabel()}</h1>
                <p className="text-sm text-gray-500">
                  {goal.goal_number} - {goal.title}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="basic" className="gap-2">
              <FileText className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="ownership" className="gap-2">
              <Users className="h-4 w-4" />
              Ownership
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="strategic" className="gap-2">
              <Target className="h-4 w-4" />
              Strategic
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details about this {getGoalTypeLabel().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The title and description are the primary identifiers for this goal. 
                    Make them clear and actionable.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Goal Number</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {goal.goal_number}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {getGoalTypeLabel()}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a clear, actionable title"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: "Improve Student Literacy Rates" or "Enhance STEM Programs"
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of what this goal aims to achieve"
                    rows={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include context, scope, and expected outcomes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ownership & Accountability</CardTitle>
                <CardDescription>
                  Define who is responsible for achieving this goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Clear ownership ensures accountability and helps track progress effectively.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="owner_name">Goal Owner</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => handleInputChange('owner_name', e.target.value)}
                      placeholder="e.g., Dr. Sarah Johnson"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Primary person responsible for this goal
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Academic Affairs"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Department or division responsible
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical - Must complete</SelectItem>
                        <SelectItem value="high">High - Important</SelectItem>
                        <SelectItem value="medium">Medium - Standard priority</SelectItem>
                        <SelectItem value="low">Low - Nice to have</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.priority && (
                      <div className="mt-2">
                        <Badge className={getPriorityColor(formData.priority)}>
                          {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status_detail">Status</Label>
                    <Select
                      value={formData.status_detail}
                      onValueChange={(value) => handleInputChange('status_detail', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.status_detail && (
                      <div className="mt-2">
                        <Badge className={getStatusColor(formData.status_detail)}>
                          {formData.status_detail.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Planning</CardTitle>
                <CardDescription>
                  Set timeframes and review schedules for this goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Clear timelines help track progress and ensure timely completion.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">Target End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="review_frequency">Review Frequency</Label>
                  <Select
                    value={formData.review_frequency}
                    onValueChange={(value) => handleInputChange('review_frequency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    How often should progress be reviewed?
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget & Resources</CardTitle>
                <CardDescription>
                  Track financial resources allocated to this goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Budget tracking helps ensure resources are used effectively.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budget_allocated">Budget Allocated ($)</Label>
                    <Input
                      id="budget_allocated"
                      type="number"
                      value={formData.budget_allocated}
                      onChange={(e) => handleInputChange('budget_allocated', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                      min="0"
                      step="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total budget allocated for this goal
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="budget_spent">Budget Spent ($)</Label>
                    <Input
                      id="budget_spent"
                      type="number"
                      value={formData.budget_spent}
                      onChange={(e) => handleInputChange('budget_spent', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                      min="0"
                      step="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Amount spent so far
                    </p>
                  </div>
                </div>

                {formData.budget_allocated > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm text-gray-600">
                        {((formData.budget_spent / formData.budget_allocated) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (formData.budget_spent / formData.budget_allocated) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        ${formData.budget_spent.toLocaleString()} spent
                      </span>
                      <span className="text-xs text-gray-500">
                        ${(formData.budget_allocated - formData.budget_spent).toLocaleString()} remaining
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategic Alignment Tab */}
          <TabsContent value="strategic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Alignment</CardTitle>
                <CardDescription>
                  Connect this goal to broader strategic themes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Aligning goals with strategic themes ensures organizational coherence.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="strategic_theme">Strategic Theme</Label>
                  <Select
                    value={formData.strategic_theme_id}
                    onValueChange={(value) => handleInputChange('strategic_theme_id', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a strategic theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {themes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Link to a district-wide strategic theme
                  </p>
                </div>

                <div>
                  <Label htmlFor="executive_summary">Executive Summary</Label>
                  <Textarea
                    id="executive_summary"
                    value={formData.executive_summary}
                    onChange={(e) => handleInputChange('executive_summary', e.target.value)}
                    placeholder="Provide a brief summary for executive reporting (2-3 sentences)"
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used in executive dashboards and reports
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="is_public" className="text-base font-medium">
                      Public Visibility
                    </Label>
                    <p className="text-sm text-gray-500">
                      Make this goal visible on public dashboards
                    </p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tips for Success</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Be specific and measurable. Use action verbs in titles.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Best Practices</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Assign clear ownership and realistic timelines.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Regular reviews ensure goals stay on track.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}