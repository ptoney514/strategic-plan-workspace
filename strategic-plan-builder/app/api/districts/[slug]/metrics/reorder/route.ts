import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates array is required' }, { status: 400 });
    }

    // Update each metric's display_order
    const promises = updates.map(({ id, display_order }) => 
      supabase
        .from('spb_metrics')
        .update({ display_order })
        .eq('id', id)
    );

    const results = await Promise.all(promises);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Errors updating metric order:', errors);
      return NextResponse.json({ 
        error: 'Failed to update some metrics',
        details: errors.map(e => e.error?.message)
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error reordering metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}