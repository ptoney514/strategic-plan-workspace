'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDistrict } from '@/hooks/use-district';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2,
  Save,
  Building2,
  Globe,
  Shield,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function DistrictSettingsPage() {
  const params = useParams();
  const districtSlug = params.districtSlug as string;
  const { data: district, isLoading, error } = useDistrict(districtSlug);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    timezone: 'America/New_York',
    fiscalYearStart: 'July',
    studentCount: '',
    staffCount: '',
    schoolCount: '',
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    weeklyReports: true,
    goalDeadlines: true,
    teamActivity: false,
    systemAlerts: true,
    mobileNotifications: false,
  });

  const [privacy, setPrivacy] = useState({
    publicDashboard: true,
    showMetrics: true,
    allowDataExport: false,
    enableAPI: false,
    assistantOptIn: false,
  });

  useEffect(() => {
    if (district) {
      setFormData((prev) => ({
        ...prev,
        name: district.name || '',
        slug: district.slug || districtSlug,
        description: district.description || '',
      }));
    }
  }, [district, districtSlug]);

  const handleSave = async () => {
    toast.success('Settings saved successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Unable to load settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href={`/dashboard/${districtSlug}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">General Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your district's core settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Organization Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>
            Basic information about your district
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Springfield School District"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="springfield-sd"
                disabled
              />
              <p className="text-xs text-gray-500">Used in URLs and cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief description of your district..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.district.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@district.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
              <select
                id="fiscalYear"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.fiscalYearStart}
                onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
              >
                <option value="January">January</option>
                <option value="April">April</option>
                <option value="July">July</option>
                <option value="October">October</option>
              </select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="students">Student Count</Label>
              <Input
                id="students"
                type="number"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Count</Label>
              <Input
                id="staff"
                type="number"
                value={formData.staffCount}
                onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schools">Number of Schools</Label>
              <Input
                id="schools"
                type="number"
                value={formData.schoolCount}
                onChange={(e) => setFormData({ ...formData, schoolCount: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose how you want to receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email Updates</p>
                <p className="text-xs text-gray-500">Receive important updates via email</p>
              </div>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, emailUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Weekly Reports</p>
                <p className="text-xs text-gray-500">Get weekly progress summaries</p>
              </div>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, weeklyReports: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Goal Deadlines</p>
                <p className="text-xs text-gray-500">Alerts for upcoming deadlines</p>
              </div>
            </div>
            <Switch
              checked={notifications.goalDeadlines}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, goalDeadlines: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Mobile Notifications</p>
                <p className="text-xs text-gray-500">Push notifications on mobile devices</p>
              </div>
            </div>
            <Switch
              checked={notifications.mobileNotifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, mobileNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>Data Privacy</CardTitle>
          </div>
          <CardDescription>
            Control your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Public Dashboard</p>
                <p className="text-xs text-gray-500">Allow public access to view dashboard</p>
              </div>
            </div>
            <Switch
              checked={privacy.publicDashboard}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, publicDashboard: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Show Metrics Publicly</p>
                <p className="text-xs text-gray-500">Display metrics on public dashboard</p>
              </div>
            </div>
            <Switch
              checked={privacy.showMetrics}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, showMetrics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Assistant Opt-in Level</p>
                <p className="text-xs text-gray-500">AI-powered insights and suggestions</p>
              </div>
            </div>
            <Switch
              checked={privacy.assistantOptIn}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, assistantOptIn: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}