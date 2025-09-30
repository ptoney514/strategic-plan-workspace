import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🌐 API Route: Fetching goals for district:', params.slug);
    
    // Create fresh client for this request
    const supabase = createServerClient();
    
    // Get district first
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    // Get goals
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', district.id)
      .order('goal_number');

    if (goalsError) {
      return NextResponse.json({ error: goalsError.message }, { status: 500 });
    }

    return NextResponse.json({ goals: goals || [] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { parentId, goalData } = body;
    
    // Get district first
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    console.log('🆔 District ID for goal creation:', district.id);
    console.log('🆔 District slug:', params.slug);

    // Create goal
    const { data: goal, error: goalError } = await supabase
      .from('spb_goals')
      .insert([{
        ...goalData,
        district_id: district.id,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (goalError) {
      console.error('❌ API Route: Error creating goal:', goalError);
      
      // Check for RLS policy violation
      if (goalError.message?.includes('row-level security policy') || goalError.code === '42501') {
        return NextResponse.json({ 
          error: 'Database security policy error. Please run the RLS setup script: node scripts/setup-getSupabaseClient()-rls.js',
          details: 'Row Level Security policies need to be configured for development.',
          code: 'RLS_POLICY_ERROR'
        }, { status: 403 });
      }
      
      return NextResponse.json({ error: goalError.message }, { status: 500 });
    }

    console.log('✅ Goal created successfully:', {
      goalId: goal.id,
      districtId: goal.district_id,
      title: goal.title,
      goalNumber: goal.goal_number
    });

    // Verification: immediately query to see if the goal exists
    console.log('🔍 Verifying goal was saved...');
    const { data: verifyGoal, error: verifyError } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('id', goal.id)
      .single();

    if (verifyError || !verifyGoal) {
      console.error('❌ VERIFICATION FAILED: Goal was not found after creation!', verifyError);
    } else {
      console.log('✅ VERIFICATION PASSED: Goal exists in database:', {
        id: verifyGoal.id,
        district_id: verifyGoal.district_id,
        title: verifyGoal.title
      });
    }

    return NextResponse.json({ goal });

  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    
    // Check for RLS policy violation in catch block too
    if (error.message?.includes('row-level security policy') || error.code === '42501') {
      return NextResponse.json({ 
        error: 'Database security policy error. Please run the RLS setup script: node scripts/setup-getSupabaseClient()-rls.js',
        details: 'Row Level Security policies need to be configured for development.',
        code: 'RLS_POLICY_ERROR'
      }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🌐 API Route: Updating goal for district:', params.slug);
    
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    const { goalId, updates } = body;
    
    if (!goalId) {
      console.error('❌ API Route: No goalId provided');
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      console.error('❌ API Route: No updates provided');
      return NextResponse.json({ error: 'Updates are required' }, { status: 400 });
    }
    
    // First check if goal exists
    const { data: existingGoal, error: checkError } = await supabase
      .from('spb_goals')
      .select('id, district_id')
      .eq('id', goalId)
      .single();

    if (checkError || !existingGoal) {
      console.error('❌ API Route: Goal not found:', goalId, checkError);
      return NextResponse.json({ error: `Goal not found: ${goalId}` }, { status: 404 });
    }

    // Verify the goal belongs to the correct district
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district || existingGoal.district_id !== district.id) {
      console.error('❌ API Route: Goal does not belong to district:', { goalId, districtSlug: params.slug });
      return NextResponse.json({ error: 'Goal not found in this district' }, { status: 404 });
    }

    // Update goal
    const { data: goal, error: goalError } = await supabase
      .from('spb_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (goalError) {
      console.error('❌ API Route: Error updating goal:', goalError);
      return NextResponse.json({ error: goalError.message }, { status: 500 });
    }

    console.log('✅ API Route: Goal updated successfully');
    return NextResponse.json({ goal });

  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const goalId = url.searchParams.get('goalId');
    
    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }
    
    // Delete goal (will cascade delete children and metrics due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('spb_goals')
      .delete()
      .eq('id', goalId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}