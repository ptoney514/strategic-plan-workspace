import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { debug } from '@/lib/debug';
import { buildGoalHierarchy } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    debug.log('🌐 API Route: Fetching district by slug:', params.slug);
    
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
    
    // Create fresh Supabase client with validated credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get district
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district) {
      debug.error('❌ API Route: District not found:', districtError);
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }

    // Get ALL goals for this district - no caching, fresh query
    debug.log('🔍 Querying goals for district_id:', district.id);
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', district.id)
      .order('goal_number');

    if (goalsError) {
      debug.error('❌ API Route: Error fetching goals:', goalsError);
    } else {
      debug.log('🔍 Goals query completed. Total goals found:', goals?.length || 0);
      
      if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        const level0Goals = goals?.filter(g => g.level === 0) || [];
        const level1Goals = goals?.filter(g => g.level === 1) || [];
        const level2Goals = goals?.filter(g => g.level === 2) || [];
        debug.log('🔍 Goals by level:', {
          level0: level0Goals.length,
          level1: level1Goals.length,
          level2: level2Goals.length
        });
      }
    }

    // Get metrics for goals
    let metrics = [];
    if (goals && goals.length > 0) {
      const goalIds = goals.map(g => g.id);
      const { data: metricsData, error: metricsError } = await supabase
        .from('spb_metrics')
        .select('*')
        .in('goal_id', goalIds)
        .order('display_order');
      
      if (!metricsError && metricsData) {
        metrics = metricsData;
        
        // For survey metrics, fetch survey data
        const surveyMetrics = metrics.filter(m => m.metric_type === 'survey');
        if (surveyMetrics.length > 0) {
          const surveyMetricIds = surveyMetrics.map(m => m.id);
          const { data: surveyData, error: surveyError } = await supabase
            .from('spb_metric_survey_data')
            .select('*')
            .in('metric_id', surveyMetricIds)
            .order('year');
          
          if (!surveyError && surveyData) {
            // Attach survey data to corresponding metrics
            metrics = metrics.map(metric => {
              if (metric.metric_type === 'survey') {
                const metricSurveyData = surveyData.filter(sd => sd.metric_id === metric.id);
                return {
                  ...metric,
                  survey_data: metricSurveyData
                };
              }
              return metric;
            });
          }
        }
      }
    }

    // Build goal hierarchy using shared utility
    const goalsWithHierarchy = buildGoalHierarchy(goals || [], metrics);
    debug.log('🔨 Built hierarchy with', goalsWithHierarchy.length, 'root goals');

    debug.log(`✅ API Route: Successfully fetched district ${params.slug}`, {
      districtId: district.id,
      goalsCount: goals?.length || 0,
      metricsCount: metrics?.length || 0,
      hierarchicalGoalsCount: goalsWithHierarchy?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      district: {
        ...district,
        goals: goalsWithHierarchy
      }
    });

  } catch (error: any) {
    debug.error('❌ API Route: Unexpected error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}