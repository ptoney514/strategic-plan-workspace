import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { debug } from '@/lib/debug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    debug.log('🌐 API Route: Fetching districts with summaries');
    
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      debug.error('❌ API Route: Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all districts
    const { data: districts, error: districtsError } = await supabase
      .from('spb_districts')
      .select('*')
      .order('name');

    if (districtsError) {
      throw districtsError;
    }

    if (!districts || districts.length === 0) {
      return NextResponse.json({
        success: true,
        districts: []
      });
    }

    // Get all goals and metrics in batch
    const districtIds = districts.map(d => d.id);
    
    // Fetch goals count per district
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('district_id, level')
      .in('district_id', districtIds);

    if (goalsError) {
      debug.error('❌ Error fetching goals:', goalsError);
    }

    // Fetch metrics count per district (via goals)
    const { data: metrics, error: metricsError } = await supabase
      .from('spb_metrics')
      .select('goal_id, spb_goals!inner(district_id)')
      .in('spb_goals.district_id', districtIds);

    if (metricsError) {
      debug.error('❌ Error fetching metrics:', metricsError);
    }

    // Build summaries efficiently
    const districtSummaries = districts.map(district => {
      const districtGoals = goals?.filter(g => g.district_id === district.id) || [];
      const districtMetrics = metrics?.filter(m => 
        (m as any).spb_goals?.district_id === district.id
      ) || [];

      return {
        ...district,
        goalCount: districtGoals.filter(g => g.level === 1).length,
        strategyCount: districtGoals.filter(g => g.level === 0).length,
        subGoalCount: districtGoals.filter(g => g.level === 2).length,
        metricCount: districtMetrics.length,
        lastActivity: district.updated_at
      };
    });

    debug.log(`✅ API Route: Successfully fetched ${districts.length} districts with summaries`);
    
    return NextResponse.json({
      success: true,
      districts: districtSummaries
    });

  } catch (error: any) {
    debug.error('❌ API Route: Unexpected error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}