import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Create fresh client for this request
    const supabase = createServerClient();
    
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parentId');
    const level = parseInt(url.searchParams.get('level') || '0');
    
    console.log('🌐 API Route: Getting next goal number for district:', params.slug, { parentId, level });
    
    // Get district first
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (districtError || !district) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    let goalNumber: string;

    if (!parentId && level === 0) {
      // Strategic Objective level
      const { data } = await supabase
        .from('spb_goals')
        .select('goal_number')
        .eq('district_id', district.id)
        .eq('level', 0)
        .order('goal_number', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        const lastNum = parseInt(data[0].goal_number);
        goalNumber = (lastNum + 1).toString();
      } else {
        goalNumber = '1';
      }
    } else if (parentId) {
      // Sub-goal level
      const { data: parent } = await supabase
        .from('spb_goals')
        .select('goal_number')
        .eq('id', parentId)
        .single();
      
      if (!parent) {
        goalNumber = '1.1';
      } else {
        const { data: siblings } = await supabase
          .from('spb_goals')
          .select('goal_number')
          .eq('parent_id', parentId)
          .order('goal_number', { ascending: false })
          .limit(1);
        
        if (siblings && siblings.length > 0) {
          const parts = siblings[0].goal_number.split('.');
          const lastNum = parseInt(parts[parts.length - 1]);
          parts[parts.length - 1] = (lastNum + 1).toString();
          goalNumber = parts.join('.');
        } else {
          goalNumber = `${parent.goal_number}.1`;
        }
      }
    } else {
      goalNumber = '1';
    }

    console.log('✅ API Route: Next goal number:', goalNumber);
    return NextResponse.json({ goalNumber });

  } catch (error: any) {
    console.error('❌ API Route: Error getting next goal number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}