import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 API Route: Fetching districts...');
    
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('spb_districts')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('❌ API Route: Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn('⚠️ API Route: No data returned');
      return NextResponse.json(
        { error: 'No data returned' },
        { status: 404 }
      );
    }

    console.log(`✅ API Route: Successfully fetched ${data.length} districts`);
    
    return NextResponse.json({
      success: true,
      districts: data,
      count: data.length
    });

  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🌐 API Route: Deleting district...');
    
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const body = await request.json();
    const { districtId, cascade } = body;
    
    if (!districtId) {
      return NextResponse.json(
        { error: 'District ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting district ${districtId} with cascade: ${cascade}`);

    if (cascade) {
      // Delete all goals (which will cascade delete metrics due to foreign key constraints)
      console.log('🔄 Deleting child goals and metrics...');
      const { error: goalsError } = await supabase
        .from('spb_goals')
        .delete()
        .eq('district_id', districtId);
      
      if (goalsError) {
        console.error('❌ Error deleting goals:', goalsError);
        return NextResponse.json(
          { error: 'Failed to delete district goals', details: goalsError.message },
          { status: 500 }
        );
      }
      console.log('✅ Child goals and metrics deleted successfully');
    }

    // Delete the district
    console.log('🔄 Deleting district...');
    const { error } = await supabase
      .from('spb_districts')
      .delete()
      .eq('id', districtId);
    
    if (error) {
      console.error('❌ Error deleting district:', error);
      return NextResponse.json(
        { error: 'Failed to delete district', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ District deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'District deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ API Route: Unexpected error deleting district:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}