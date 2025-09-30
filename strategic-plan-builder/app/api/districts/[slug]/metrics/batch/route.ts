import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { goalId, metrics } = body;
    
    if (!goalId || !metrics) {
      return NextResponse.json({ error: 'Goal ID and metrics are required' }, { status: 400 });
    }

    // Delete existing metrics for this goal
    const { error: deleteError } = await supabase
      .from('spb_metrics')
      .delete()
      .eq('goal_id', goalId);

    if (deleteError) {
      console.error('Error deleting existing metrics:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If no metrics to add, return success
    if (!metrics || metrics.length === 0) {
      return NextResponse.json({ success: true, metrics: [] });
    }

    // Prepare metrics for insertion
    const metricsToInsert = metrics.map((metric: any) => ({
      ...metric,
      goal_id: goalId,
      id: metric.id?.startsWith('temp-') ? undefined : metric.id, // Remove temp IDs
      created_at: metric.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert new metrics
    const { data: newMetrics, error: insertError } = await supabase
      .from('spb_metrics')
      .insert(metricsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting metrics:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, metrics: newMetrics });

  } catch (error: any) {
    console.error('Error in batch metrics update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}