'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbService } from '@/lib/db-service';
import { DistrictWithSummary } from '@/lib/types';
import { AppLogo } from '@/components/brand/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Users,
  Target,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  Building2,
  Shield,
  LogOut,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  History,
  BookOpen,
  Terminal,
  Key,
  FileText,
  Zap,
  HardDrive,
  Cpu,
  Globe,
  Grid3x3,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const router = useRouter();
  const [districts, setDistricts] = useState<DistrictWithSummary[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<DistrictWithSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDistrict, setNewDistrict] = useState({ name: '', slug: '' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean, 
    district?: DistrictWithSummary, 
    summary?: { goalCount: number; strategyCount: number },
    cascade?: boolean
  }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDistricts: 0,
    totalGoals: 0,
    totalMetrics: 0,
    activeDistricts: 0
  });

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    // Filter districts based on search term
    if (searchTerm) {
      const filtered = districts.filter(district => 
        district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts(districts);
    }
  }, [searchTerm, districts]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/api/districts/with-summaries');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch districts');
      }
      
      setDistricts(result.districts || []);
      setFilteredDistricts(result.districts || []);
      
      // Update stats
      const totalGoals = result.districts?.reduce((acc: number, d: any) => acc + (d.goalCount || 0), 0) || 0;
      const totalMetrics = result.districts?.reduce((acc: number, d: any) => acc + (d.metricCount || 0), 0) || 0;
      setStats({
        totalDistricts: result.districts?.length || 0,
        totalGoals,
        totalMetrics,
        activeDistricts: result.districts?.filter((d: any) => d.lastActivity).length || 0
      });
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Failed to load districts');
    } finally {
      setLoading(false);
    }
  };

  const createDistrict = async () => {
    if (!newDistrict.name || !newDistrict.slug) {
      toast.error('Please enter district name and URL slug');
      return;
    }
    
    setCreating(true);
    try {
      const data = await dbService.createDistrict(
        newDistrict.name,
        newDistrict.slug
      );
      
      toast.success('District created successfully!');
      setNewDistrict({ name: '', slug: '' });
      setShowCreateForm(false);
      await loadDistricts();
      router.push(`/dashboard/${data.slug}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error('That URL slug is already taken. Try another.');
      } else {
        toast.error('Failed to create district');
      }
    } finally {
      setCreating(false);
    }
  };

  const generateSlug = (name: string) => {
    const RESERVED_SLUGS = ['api', 'admin', 'dashboard', 'public', 'auth', 'login', 'logout'];
    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (RESERVED_SLUGS.includes(slug)) {
      slug = `${slug}-district`;
    }
    
    if (!slug) {
      slug = 'district';
    } else if (slug.length > 50) {
      slug = slug.substring(0, 50);
    }
    
    return slug;
  };

  const handleDeleteDistrict = async (district: any) => {
    setLoadingSummary(true);
    try {
      const summary = await dbService.getDistrictSummary(district.id);
      setDeleteDialog({ 
        open: true, 
        district, 
        summary,
        cascade: summary.goalCount > 0
      });
    } catch (error) {
      console.error('Error getting district summary:', error);
      toast.error('Failed to load district information');
    } finally {
      setLoadingSummary(false);
    }
  };

  const confirmDeleteDistrict = async () => {
    if (!deleteDialog.district) return;
    
    setDeleting(true);
    try {
      await dbService.deleteDistrict(deleteDialog.district.id, deleteDialog.cascade || false);
      await loadDistricts();
      setDeleteDialog({ open: false });
      toast.success('District deleted successfully');
    } catch (error: any) {
      console.error('Error deleting district:', error);
      toast.error(error.message || 'Failed to delete district');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffcf2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#eb5e28] mx-auto" />
          <p className="mt-4 text-[#403d39]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf2]">
      {/* Admin Header - Rustic Charm Theme */}
      <header className="bg-gradient-to-r from-[#252422] to-[#403d39] shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <AppLogo variant="admin" className="text-white" />
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ccc5b9] h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 bg-[#403d39]/50 border-[#ccc5b9]/30 text-[#fffcf2] placeholder:text-[#ccc5b9] focus:bg-[#403d39]/70 focus:border-[#eb5e28]/50 w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadDistricts}
                className="bg-[#ccc5b9]/10 text-[#fffcf2] border-[#ccc5b9]/30 hover:bg-[#ccc5b9]/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#eb5e28] to-[#eb5e28]/80 hover:from-[#eb5e28]/90 hover:to-[#eb5e28]/70 text-[#fffcf2] shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New District
              </Button>

              <div className="h-8 w-px bg-[#ccc5b9]/20" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-[#ccc5b9] hover:text-[#fffcf2] hover:bg-[#ccc5b9]/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit Admin
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-[#fffcf2]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-[#ccc5b9]/20 pb-4 space-y-2">
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ccc5b9] h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 bg-[#403d39]/50 border-[#ccc5b9]/30 text-[#fffcf2] placeholder:text-[#ccc5b9] focus:bg-[#403d39]/70 w-full"
                />
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-[#fffcf2] hover:bg-[#ccc5b9]/10"
                onClick={() => {
                  loadDistricts();
                  setMobileMenuOpen(false);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-[#fffcf2] hover:bg-[#ccc5b9]/10"
                onClick={() => {
                  setShowCreateForm(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New District
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-[#fffcf2] hover:bg-[#ccc5b9]/10"
                onClick={() => router.push('/')}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit Admin
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Admin Functions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Admin Actions</CardTitle>
                <CardDescription>Essential administrative tasks at your fingertips</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {/* Dashboard Design Links */}
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-[#eb5e28]/10 hover:border-[#eb5e28]/30 relative"
                  onClick={() => {
                    // Get the first district to navigate to
                    const firstDistrict = filteredDistricts[0];
                    if (firstDistrict) {
                      router.push(`/dashboard/${firstDistrict.slug}/strategic-goals?view=overview-v2`);
                    } else {
                      toast.error('No districts available. Please create a district first.');
                    }
                  }}
                >
                  <Grid3x3 className="h-6 w-6 text-[#eb5e28]" />
                  <span className="font-medium">Impact Dashboard</span>
                  <span className="text-xs text-[#403d39]">Card-based progress view</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-[#403d39]/10 hover:border-[#403d39]/30 relative"
                  onClick={() => {
                    const firstDistrict = filteredDistricts[0];
                    if (firstDistrict) {
                      router.push(`/dashboard/${firstDistrict.slug}/strategic-goals?view=pixel-perfect`);
                    } else {
                      toast.error('No districts available. Please create a district first.');
                    }
                  }}
                >
                  <Sparkles className="h-6 w-6 text-[#403d39]" />
                  <span className="font-medium">Executive Dashboard</span>
                  <span className="text-xs text-[#403d39]">Detailed metrics with dark mode</span>
                  <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs">NEW</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-[#252422]/10 hover:border-[#252422]/30 relative"
                  onClick={() => {
                    const firstDistrict = filteredDistricts[0];
                    if (firstDistrict) {
                      // Navigate directly to the main-view-exact dashboard
                      router.push(`/dashboard/${firstDistrict.slug}/strategic-objectives`);
                    } else {
                      toast.error('No districts available. Please create a district first.');
                    }
                  }}
                >
                  <Layers className="h-6 w-6 text-[#252422]" />
                  <span className="font-medium">Main View Exact</span>
                  <span className="text-xs text-[#403d39]">Pixel-perfect Figma with slide-out</span>
                  <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs">NEW</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center gap-2 p-4 hover:bg-[#ccc5b9]/20 hover:border-[#ccc5b9]/50"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-6 w-6 text-[#403d39]" />
                  <span className="font-medium">Create District</span>
                  <span className="text-xs text-[#403d39]">Add new organization</span>
                </Button>
              </CardContent>
            </Card>

            {/* Districts Management with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="districts" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="districts" id="districts-tab">Districts</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="health">System Health</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="districts" className="mt-4">
                    <div className="space-y-4">
                      {/* Search and Actions Bar */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#403d39] h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search districts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 border-[#ccc5b9]/30"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadDistricts}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Districts Table */}
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#fffcf2]/50">
                              <TableHead className="font-semibold text-[#252422]">District Title</TableHead>
                              <TableHead className="font-semibold text-center text-[#252422]"># Goals</TableHead>
                              <TableHead className="font-semibold text-center text-[#252422]">Impact Dashboard</TableHead>
                              <TableHead className="font-semibold text-center text-[#252422]">Main View Dashboard</TableHead>
                              <TableHead className="font-semibold text-center text-[#252422]">Manage District</TableHead>
                              <TableHead className="font-semibold text-center text-[#252422]">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDistricts.slice(0, 5).map((district) => (
                              <TableRow key={district.id} className="hover:bg-[#ccc5b9]/10 transition-colors">
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-[#252422]">{district.name}</p>
                                    <code className="text-xs text-[#403d39]">{district.slug}</code>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-semibold text-[#403d39]">{district.goalCount || 0}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/${district.slug}/strategic-objectives`)}
                                    className="hover:bg-[#eb5e28]/10 hover:text-[#eb5e28] hover:border-[#eb5e28]"
                                  >
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.push(`/homepage/${district.slug}`)}
                                    className="hover:bg-[#eb5e28]/10 hover:text-[#eb5e28] hover:border-[#eb5e28]"
                                  >
                                    <Layers className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.push(`/districts/${district.slug}/admin`)}
                                    className="hover:bg-[#eb5e28]/10 hover:text-[#eb5e28] hover:border-[#eb5e28]"
                                  >
                                    <Settings className="h-4 w-4 mr-1" />
                                    Manage
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteDistrict(district)}
                                    className="text-[#eb5e28] hover:bg-[#eb5e28]/10 hover:text-[#eb5e28] border-[#eb5e28]/50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {filteredDistricts.length > 5 && (
                        <Button variant="link" className="w-full">
                          View all {filteredDistricts.length} districts
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-4 space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-[#eb5e28]/10 rounded-lg">
                          <Plus className="h-4 w-4 text-[#eb5e28]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New district created</p>
                          <p className="text-xs text-gray-500">Test District • 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-[#403d39]/10 rounded-lg">
                          <Target className="h-4 w-4 text-[#403d39]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Goals updated</p>
                          <p className="text-xs text-gray-500">Test District • 5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-[#252422]/10 rounded-lg">
                          <Users className="h-4 w-4 text-[#252422]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">User permissions updated</p>
                          <p className="text-xs text-gray-500">System Admin • Yesterday</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="health" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Database</p>
                            <p className="text-xs text-gray-500">PostgreSQL 14.5</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">API Server</p>
                            <p className="text-xs text-gray-500">Response time: 45ms</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-sm font-medium">Storage</p>
                            <p className="text-xs text-gray-500">75% used (37.5GB / 50GB)</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Cache</p>
                            <p className="text-xs text-gray-500">Redis 6.2 • Hit rate: 94%</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Optimal</Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - System Stats & Resources */}
          <div className="space-y-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-[#eb5e28]" />
                      <span className="text-sm text-[#403d39]">Districts</span>
                    </div>
                    <span className="text-lg font-semibold text-[#252422]">{stats.totalDistricts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-[#403d39]" />
                      <span className="text-sm text-[#403d39]">Total Goals</span>
                    </div>
                    <span className="text-lg font-semibold text-[#252422]">{stats.totalGoals}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-[#ccc5b9]" />
                      <span className="text-sm text-[#403d39]">Metrics</span>
                    </div>
                    <span className="text-lg font-semibold text-[#252422]">{stats.totalMetrics}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-[#252422]" />
                      <span className="text-sm text-[#403d39]">Active</span>
                    </div>
                    <span className="text-lg font-semibold text-[#252422]">{stats.activeDistricts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-[#403d39]">Last Update</span>
                    </div>
                    <span className="text-sm font-medium text-[#252422]">2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Admin Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  System Logs
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Database Backup
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Audit Trail
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export System Data
                </Button>
              </CardContent>
            </Card>

            {/* Security & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#eb5e28]" />
                  Security & Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#403d39]">SSL Certificate</span>
                  <Badge variant="outline" className="text-green-600">Valid</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#403d39]">Firewall</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#403d39]">Last Backup</span>
                  <span className="text-xs">4 hours ago</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => toast.info('Security settings coming soon!')}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create District Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New District</DialogTitle>
            <DialogDescription>
              Add a new district to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">District Name</Label>
              <Input
                id="name"
                value={newDistrict.name}
                onChange={(e) => {
                  setNewDistrict({
                    ...newDistrict,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                placeholder="e.g., Austin Independent School District"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={newDistrict.slug}
                onChange={(e) => setNewDistrict({ ...newDistrict, slug: e.target.value })}
                placeholder="e.g., austin"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used in the URL: /dashboard/{newDistrict.slug || 'slug'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={createDistrict} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create District
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false })}
        onConfirm={confirmDeleteDistrict}
        title="Delete District"
        description={
          deleteDialog.summary ? 
            `Are you sure you want to delete "${deleteDialog.district?.name}"? This district contains ${deleteDialog.summary.goalCount} goals and ${deleteDialog.summary.strategyCount} strategies. All associated data will be permanently deleted.`
          : 'Are you sure you want to delete this district?'
        }
        confirmText={deleteDialog.cascade ? "Delete Everything" : "Delete"}
        variant="destructive"
        loading={deleting || loadingSummary}
      />
    </div>
  );
}