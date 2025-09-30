'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbService } from '@/lib/db-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardSelector() {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch districts');
      }
      
      const data = result.districts || [];
      setDistricts(data);
      
      // If only one district exists, redirect to it automatically
      if (data.length === 1) {
        router.push(`/dashboard/${data[0].slug}`);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Failed to load districts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Select a District
          </h1>
          <p className="text-lg text-slate-600">
            Choose which district dashboard you want to access
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Districts</CardTitle>
            <CardDescription>
              Select a district to manage its strategic plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : districts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">
                  No districts found. Create your first district to get started.
                </p>
                <Button onClick={() => router.push('/')}>
                  Go to Home
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {districts.map(district => (
                  <div 
                    key={district.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => router.push(`/dashboard/${district.slug}`)}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{district.name}</h3>
                      <p className="text-sm text-slate-500">Dashboard URL: /dashboard/{district.slug}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}