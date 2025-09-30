import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

// Helper to get the appropriate client with fallback
const getSupabaseClient = () => {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }
  console.warn('⚠️ Using public client as fallback - admin client not available');
  return supabase;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🌐 API Route: Updating district:', params.slug);
    
    const body = await request.json();
    const updates = body;
    
    // Update district
    const { data: district, error: districtError } = await getSupabaseClient()
      .from('spb_districts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('slug', params.slug)
      .select()
      .single();

    if (districtError) {
      console.error('❌ API Route: Error updating district:', districtError);
      return NextResponse.json({ error: districtError.message }, { status: 500 });
    }

    console.log('✅ API Route: District updated successfully');
    return NextResponse.json({ district });

  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}