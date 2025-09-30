'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Eye, Save, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditHomepage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.slug as string;
  
  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Homepage configuration state
  const [config, setConfig] = useState({
    hero: {
      title: 'Strategic Plan Builder',
      subtitle: 'Transform your strategic planning process',
      ctaText: 'View Our Strategic Plan',
      ctaLink: `/public/${districtSlug}`
    },
    features: [
      {
        title: 'Clear Objectives',
        description: 'Set and track strategic objectives with measurable outcomes'
      },
      {
        title: 'Data-Driven Insights',
        description: 'Monitor progress with real-time metrics and dashboards'
      },
      {
        title: 'Collaborative Planning',
        description: 'Engage stakeholders in the strategic planning process'
      }
    ],
    about: {
      title: 'About Our Strategic Plan',
      content: 'Our strategic plan provides a roadmap for achieving excellence through focused objectives, measurable goals, and continuous improvement.'
    },
    contact: {
      email: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    loadDistrict();
  }, [districtSlug]);

  const loadDistrict = async () => {
    try {
      const response = await fetch(`/api/districts/${districtSlug}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load district');
      }
      
      setDistrict(data);
      
      // If district has existing homepage config, load it
      if (data.homepage_config) {
        setConfig(data.homepage_config);
      } else {
        // Set default values with district name
        setConfig(prev => ({
          ...prev,
          hero: {
            ...prev.hero,
            title: `${data.name} Strategic Plan`,
            subtitle: `Transforming ${data.name} through strategic planning`
          }
        }));
      }
    } catch (error) {
      console.error('Error loading district:', error);
      toast.error('Failed to load district');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, we'll just show a success message
      // Later we'll implement the actual save to database
      toast.success('Homepage configuration saved! (Note: Database integration pending)');
      
      // TODO: Implement actual save
      // const response = await fetch(`/api/districts/${districtSlug}/homepage`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
    } catch (error) {
      console.error('Error saving homepage:', error);
      toast.error('Failed to save homepage configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-600">Loading district...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-600 mb-4">District not found</p>
              <Button onClick={() => router.push('/')}>
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/${districtSlug}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Edit Homepage
                </h1>
                <p className="text-sm text-slate-500">
                  {district.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/homepage/${districtSlug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  The main banner that appears at the top of your homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Title</Label>
                  <Input
                    id="hero-title"
                    value={config.hero.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    placeholder="Strategic Plan Builder"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    value={config.hero.subtitle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    placeholder="Transform your strategic planning process"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta">Call to Action Text</Label>
                  <Input
                    id="hero-cta"
                    value={config.hero.ctaText}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, ctaText: e.target.value }
                    }))}
                    placeholder="View Our Strategic Plan"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Highlight the key features of your strategic plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {config.features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <Label htmlFor={`feature-title-${index}`}>Feature {index + 1} Title</Label>
                      <Input
                        id={`feature-title-${index}`}
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-desc-${index}`}>Description</Label>
                      <Textarea
                        id={`feature-desc-${index}`}
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="Feature description"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>
                  Provide information about your strategic plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about-title">Section Title</Label>
                  <Input
                    id="about-title"
                    value={config.about.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      about: { ...prev.about, title: e.target.value }
                    }))}
                    placeholder="About Our Strategic Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="about-content">Content</Label>
                  <Textarea
                    id="about-content"
                    value={config.about.content}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      about: { ...prev.about, content: e.target.value }
                    }))}
                    placeholder="Describe your strategic plan..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How people can reach you about the strategic plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={config.contact.email}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="contact@district.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={config.contact.phone}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-address">Address</Label>
                  <Textarea
                    id="contact-address"
                    value={config.contact.address}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value }
                    }))}
                    placeholder="123 Main St, City, State 12345"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              This editor allows you to customize your district's public-facing homepage. 
              Changes will be visible when people visit your district's landing page.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/homepage/${districtSlug}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Homepage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/public/${districtSlug}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}