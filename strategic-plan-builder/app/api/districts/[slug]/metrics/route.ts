import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';

// Helper to create response with CORS headers
function createResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🌐 API Route: Fetching metrics for district:', params.slug);
    
    // Create fresh client for this request
    const supabase = createServerClient();
    
    // Get district first
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district) {
      console.error('District not found for slug:', params.slug);
      return createResponse({ error: 'District not found', slug: params.slug }, 404);
    }

    // Get all goals for this district to fetch metrics
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('id')
      .eq('district_id', district.id);

    if (goalsError || !goals || goals.length === 0) {
      console.log('No goals found for district, returning empty metrics');
      return createResponse({ metrics: [] });
    }

    const goalIds = goals.map(g => g.id);

    // Get metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('spb_metrics')
      .select('*')
      .in('goal_id', goalIds)
      .order('display_order');

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return createResponse({ error: metricsError.message, details: metricsError }, 500);
    }

    return createResponse({ metrics: metrics || [] });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return createResponse({ error: error.message }, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const body = await request.json();
    const { goalId, metricData } = body;
    
    // Ensure all required fields have defaults - matching ACTUAL production schema
    const metricToInsert = {
      goal_id: goalId,
      name: metricData.name || 'New Metric',
      metric_type: metricData.metric_type || 'percent',
      current_value: metricData.current_value || 0,
      target_value: metricData.target_value || 100,
      unit: metricData.unit || metricData.measure_unit || '%', // Production uses 'unit' not 'measure_unit'
      display_order: metricData.display_order || 0,
      is_primary: metricData.is_primary || false,
      // Visualization fields - CRITICAL for displaying charts
      ...(metricData.visualization_type && { visualization_type: metricData.visualization_type }),
      ...(metricData.visualization_config && { visualization_config: metricData.visualization_config }),
      // Display fields
      ...(metricData.display_width && { display_width: metricData.display_width }),
      ...(metricData.description && { description: metricData.description }),
      // Optional fields that exist in production
      ...(metricData.data_source && { data_source: metricData.data_source }),
      ...(metricData.timeframe_start && { timeframe_start: metricData.timeframe_start }),
      ...(metricData.timeframe_end && { timeframe_end: metricData.timeframe_end }),
      ...(metricData.data_points && { data_points: metricData.data_points }),
      ...(metricData.chart_type && { chart_type: metricData.chart_type }),
      ...(metricData.baseline_value !== undefined && { baseline_value: metricData.baseline_value }),
      ...(metricData.milestone_dates && { milestone_dates: metricData.milestone_dates }),
      ...(metricData.trend_direction && { trend_direction: metricData.trend_direction }),
      ...(metricData.collection_frequency && { collection_frequency: metricData.collection_frequency }),
      ...(metricData.data_source_details && { data_source_details: metricData.data_source_details }),
      ...(metricData.last_collected && { last_collected: metricData.last_collected }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating metric with data:', metricToInsert);
    
    // Create metric
    const { data: metric, error: metricError } = await supabase
      .from('spb_metrics')
      .insert([metricToInsert])
      .select()
      .single();

    if (metricError) {
      console.error('Failed to create metric:', metricError);
      console.error('Metric data that failed:', metricToInsert);
      return createResponse({ 
        error: metricError.message,
        details: metricError.details,
        hint: metricError.hint,
        attempted_data: metricToInsert
      }, 500);
    }

    console.log('✅ Metric created successfully:', metric);
    return createResponse({ metric });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return createResponse({ error: error.message }, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const body = await request.json();
    const { metricId, updates } = body;
    
    // Filter out fields that don't exist in production
    const validColumns = [
      'name', 'metric_type', 'data_source', 'current_value', 'target_value',
      'unit', 'timeframe_start', 'timeframe_end', 'data_points',
      'is_primary', 'display_order', 'chart_type', 'baseline_value',
      'milestone_dates', 'trend_direction', 'collection_frequency',
      'data_source_details', 'last_collected',
      // Visualization fields - CRITICAL for displaying charts
      'visualization_type', 'visualization_config',
      // Display fields - CRITICAL for layout and descriptions
      'display_width', 'description'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => validColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);
    
    console.log('Updating metric with:', filteredUpdates);
    
    // Update metric
    const { data: metric, error: metricError } = await supabase
      .from('spb_metrics')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', metricId)
      .select()
      .single();

    if (metricError) {
      console.error('Failed to update metric:', metricError);
      console.error('Update data that failed:', filteredUpdates);
      return createResponse({ 
        error: metricError.message,
        details: metricError.details,
        hint: metricError.hint,
        attempted_update: filteredUpdates
      }, 500);
    }

    console.log('✅ Metric created successfully:', metric);
    return createResponse({ metric });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return createResponse({ error: error.message }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const url = new URL(request.url);
    const metricId = url.searchParams.get('metricId');
    
    if (!metricId) {
      return createResponse({ error: 'Metric ID is required' }, 400);
    }
    
    // Delete metric
    const { error: deleteError } = await supabase
      .from('spb_metrics')
      .delete()
      .eq('id', metricId);

    if (deleteError) {
      console.error('Error deleting metric:', deleteError);
      return createResponse({ error: deleteError.message }, 500);
    }

    console.log('✅ Metric deleted successfully:', metricId);
    return createResponse({ success: true });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return createResponse({ error: error.message }, 500);
  }
}