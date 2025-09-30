'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { signUp } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districts, setDistricts] = useState<any[]>([]);
  const [isNewDistrict, setIsNewDistrict] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  useEffect(() => {
    // Test basic Supabase connectivity first
    console.log('Testing Supabase connectivity...');
    console.log('Supabase client:', supabase);
    
    loadDistricts();
  }, []);

  const loadDistricts = async (retryCount = 0) => {
    try {
      setLoadingDistricts(true);
      setError(''); // Clear any previous errors
      
      console.log(`🔄 Loading districts (attempt ${retryCount + 1})...`);
      console.log('🔧 Environment check:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      
      // Add timeout to the query with exponential backoff
      const timeout = Math.min(5000 + (retryCount * 2000), 15000);
      
      const queryPromise = supabase
        .from('spb_districts')
        .select('id, name, slug')
        .eq('is_public', true)
        .order('name');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Query timeout after ${timeout/1000} seconds`)), timeout)
      );
      
      console.log('🌐 Executing Supabase query...');
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      console.log('✅ Districts query result:', { 
        success: !error,
        dataCount: data?.length || 0,
        error: error?.message || null,
        districts: data?.map((d: any) => ({ id: d.id, name: d.name })) || []
      });
      
      if (error) {
        console.error('❌ Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from query');
        throw new Error('No data returned from database');
      }
      
      if (data.length === 0) {
        console.warn('⚠️ No public districts found');
        setError('No districts available for signup. Please contact your administrator.');
        setDistricts([]);
        return;
      }
      
      console.log(`✅ Successfully loaded ${data.length} districts:`, 
        data.map((d: any) => `${d.name} (${d.slug})`).join(', '));
      setDistricts(data);
      setError(''); // Clear any errors on success
      
    } catch (err: any) {
      console.error('❌ Error loading districts:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        retryCount
      });
      
      // Retry logic with exponential backoff
      if (retryCount < 2) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying in ${retryDelay/1000} seconds...`);
        setError(`Connection issue, retrying in ${retryDelay/1000} seconds...`);
        
        setTimeout(() => {
          loadDistricts(retryCount + 1);
        }, retryDelay);
        return;
      }
      
      // Try API route as fallback
      console.log('🔄 Trying API route fallback...');
      try {
        const response = await fetch('/api/districts');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.districts) {
            console.log(`✅ API fallback successful: ${result.districts.length} districts loaded`);
            setDistricts(result.districts);
            setError('⚠️ Using API fallback - ' + err.message);
            return;
          }
        }
        console.error('❌ API fallback failed:', await response.text());
      } catch (apiError: any) {
        console.error('❌ API fallback error:', apiError);
      }
      
      // Final fallback after all retries
      console.error('❌ All retry attempts and API fallback failed');
      setError(`Connection error: ${err.message}`);
      
      // Development fallback - use hardcoded data if in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using development fallback data...');
        const fallbackDistricts = [
          { id: '00483a6d-bd10-4ba8-8411-c09e83e4a7b1', name: 'Test District', slug: 'test-district' }
        ];
        setDistricts(fallbackDistricts);
        setError('⚠️ Using offline data (development mode) - ' + err.message);
      }
      
    } finally {
      setLoadingDistricts(false);
      console.log('🏁 loadDistricts completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      let finalDistrictId = districtId;

      // Create new district if needed
      if (isNewDistrict && newDistrictName) {
        const slug = newDistrictName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const { data: newDistrict, error: districtError } = await supabase
          .from('spb_districts')
          .insert([{
            name: newDistrictName,
            slug,
            admin_email: email,
            is_public: false,
            primary_color: '#3b82f6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (districtError) {
          setError('Error creating district: ' + districtError.message);
          setLoading(false);
          return;
        }

        finalDistrictId = newDistrict.id;
      }

      const result = await signUp(email, password, finalDistrictId);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Show success message
        setError('');
        alert('Account created successfully! Please check your email to verify your account.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to start building your district's strategic plan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@district.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={isNewDistrict ? 'new' : districtId}
                onValueChange={(value) => {
                  if (value === 'new') {
                    setIsNewDistrict(true);
                    setDistrictId('');
                  } else {
                    setIsNewDistrict(false);
                    setDistrictId(value);
                  }
                }}
                disabled={loadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingDistricts ? "Loading districts..." : 
                    districts.length === 0 ? "No districts available" :
                    "Select your district"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Create New District</SelectItem>
                  {districts.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                  {!loadingDistricts && districts.length === 0 && (
                    <SelectItem value="refresh" onClick={(e) => {
                      e.preventDefault();
                      loadDistricts();
                    }}>
                      🔄 Retry loading districts
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {loadingDistricts && (
                <p className="text-xs text-blue-500">Loading available districts...</p>
              )}
              {!loadingDistricts && districts.length > 0 && (
                <p className="text-xs text-green-600">Found {districts.length} district{districts.length !== 1 ? 's' : ''}</p>
              )}
              {!loadingDistricts && districts.length === 0 && !error && (
                <div className="text-xs space-y-1">
                  <p className="text-red-500">No districts loaded</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadDistricts()}
                    className="h-6 px-2 text-xs"
                  >
                    🔄 Retry
                  </Button>
                </div>
              )}
            </div>

            {isNewDistrict && (
              <div className="space-y-2">
                <Label htmlFor="districtName">District Name</Label>
                <Input
                  id="districtName"
                  type="text"
                  placeholder="Westside Community Schools"
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  required={isNewDistrict}
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (!districtId && !isNewDistrict) || (isNewDistrict && !newDistrictName)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
            </Button>
            
            <div className="text-sm text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}