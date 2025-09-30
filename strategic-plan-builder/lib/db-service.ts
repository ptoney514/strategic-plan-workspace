// lib/db-service.ts
import { createServiceClient } from './supabase-server';
import { supabase } from './supabase'; // For client-side usage
import { Goal, Metric, District } from './types';

// District operations
export async function getDistrict(districtId: string): Promise<District | null> {
  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_districts')
    .select('*')
    .eq('id', districtId)
    .single();
  
  if (error) {
    console.error('Error fetching district:', error);
    return null;
  }
  
  return data;
}

export async function getDistrictBySlug(slug: string): Promise<District | null> {
  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_districts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching district by slug:', error);
    return null;
  }
  
  return data;
}

export async function createDistrict(district: Partial<District>): Promise<District | null> {
  // Debug environment variables
  console.log('🔧 DB Service - Environment Check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    platform: process.env.VERCEL ? 'Vercel' : 'Local'
  });

  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_districts')
    .insert([district])
    .select()
    .single();
  
  if (error) {
    console.error('❌ DB Service - Error creating district:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      hint: error.hint
    });
    
    // Throw error instead of returning null for better error propagation
    throw new Error(`Failed to create district: ${error.message}`);
  }
  
  console.log('✅ DB Service - District created successfully:', data);
  return data;
}

export async function updateDistrict(districtId: string, updates: Partial<District>): Promise<boolean> {
  const supabaseClient = createServiceClient();
  const { error } = await supabaseClient
    .from('spb_districts')
    .update(updates)
    .eq('id', districtId);
  
  if (error) {
    console.error('Error updating district:', error);
    return false;
  }
  
  return true;
}

// Goal operations
export async function getGoals(districtId: string): Promise<Goal[]> {
  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_goals')
    .select('*')
    .eq('district_id', districtId)
    .order('goal_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
  
  return data || [];
}

export async function createGoal(goal: Partial<Goal>): Promise<Goal | null> {
  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_goals')
    .insert([{
      ...goal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating goal:', error);
    return null;
  }
  
  return data;
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<boolean> {
  const supabaseClient = createServiceClient();
  const { error } = await supabaseClient
    .from('spb_goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId);
  
  if (error) {
    console.error('Error updating goal:', error);
    return false;
  }
  
  return true;
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  // This will cascade delete all child goals and metrics due to foreign key constraints
  const supabaseClient = createServiceClient();
  const { error } = await supabaseClient
    .from('spb_goals')
    .delete()
    .eq('id', goalId);
  
  if (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
  
  return true;
}

// Metric operations
export async function getMetrics(districtId: string): Promise<Metric[]> {
  // First get all goals for this district
  const supabaseClient = createServiceClient();
  const { data: goals, error: goalsError } = await supabaseClient
    .from('spb_goals')
    .select('id')
    .eq('district_id', districtId);
  
  if (goalsError || !goals) {
    console.error('Error fetching goals for metrics:', goalsError);
    return [];
  }
  
  const goalIds = goals.map(g => g.id);
  
  if (goalIds.length === 0) {
    return [];
  }
  
  const { data, error } = await supabaseClient
    .from('spb_metrics')
    .select('*')
    .in('goal_id', goalIds)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }
  
  return data || [];
}

export async function createMetric(metric: Partial<Metric>): Promise<Metric | null> {
  const supabaseClient = createServiceClient();
  const { data, error } = await supabaseClient
    .from('spb_metrics')
    .insert([{
      ...metric,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating metric:', error);
    return null;
  }
  
  return data;
}

export async function updateMetric(metricId: string, updates: Partial<Metric>): Promise<boolean> {
  const supabaseClient = createServiceClient();
  const { error } = await supabaseClient
    .from('spb_metrics')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', metricId);
  
  if (error) {
    console.error('Error updating metric:', error);
    return false;
  }
  
  return true;
}

export async function deleteMetric(metricId: string): Promise<boolean> {
  const supabaseClient = createServiceClient();
  const { error } = await supabaseClient
    .from('spb_metrics')
    .delete()
    .eq('id', metricId);
  
  if (error) {
    console.error('Error deleting metric:', error);
    return false;
  }
  
  return true;
}

// Batch operations for better performance
export async function batchUpdateMetrics(metrics: Partial<Metric>[]): Promise<boolean> {
  const supabaseClient = createServiceClient();
  const updates = metrics.map(m => ({
    ...m,
    updated_at: new Date().toISOString()
  }));
  
  const { error } = await supabaseClient
    .from('spb_metrics')
    .upsert(updates);
  
  if (error) {
    console.error('Error batch updating metrics:', error);
    return false;
  }
  
  return true;
}

// Helper function to get all data for a district
export async function getDistrictData(districtId: string) {
  const [district, goals, metrics] = await Promise.all([
    getDistrict(districtId),
    getGoals(districtId),
    getMetrics(districtId)
  ]);
  
  return { district, goals, metrics };
}

// Helper function to duplicate a goal structure (useful for templates)
export async function duplicateGoalStructure(
  sourceGoalId: string,
  targetDistrictId: string,
  parentId: string | null = null
): Promise<boolean> {
  try {
    const supabaseClient = createServiceClient();
    // Get source goal
    const { data: sourceGoal, error: goalError } = await supabaseClient
      .from('spb_goals')
      .select('*')
      .eq('id', sourceGoalId)
      .single();
    
    if (goalError || !sourceGoal) {
      console.error('Error fetching source goal:', goalError);
      return false;
    }
    
    // Create new goal
    const newGoal = await createGoal({
      ...sourceGoal,
      id: undefined,
      district_id: targetDistrictId,
      parent_id: parentId,
      created_at: undefined,
      updated_at: undefined
    });
    
    if (!newGoal) return false;
    
    // Get and duplicate metrics
    const { data: sourceMetrics, error: metricsError } = await supabaseClient
      .from('spb_metrics')
      .select('*')
      .eq('goal_id', sourceGoalId);
    
    if (!metricsError && sourceMetrics) {
      for (const metric of sourceMetrics) {
        await createMetric({
          ...metric,
          id: undefined,
          goal_id: newGoal.id,
          created_at: undefined,
          updated_at: undefined
        });
      }
    }
    
    // Recursively duplicate child goals
    const { data: childGoals, error: childError } = await supabaseClient
      .from('spb_goals')
      .select('*')
      .eq('parent_id', sourceGoalId);
    
    if (!childError && childGoals) {
      for (const child of childGoals) {
        await duplicateGoalStructure(child.id, targetDistrictId, newGoal.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error duplicating goal structure:', error);
    return false;
  }
}

// Legacy wrapper for existing components (backwards compatibility)
export const dbService = {
  async getDistrict(slug: string) {
    console.log('getDistrict called with slug:', slug);
    
    try {
      const response = await fetch(`/api/districts/${slug}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch district');
      }
      
      return result.district;
    } catch (error) {
      console.error('Error fetching district:', error);
      throw error;
    }
  },

  buildGoalHierarchy(goals: Goal[]): Goal[] {
    const goalMap = new Map<string, Goal>();
    const rootGoals: Goal[] = [];
    
    // First pass: create map
    goals.forEach(goal => {
      goalMap.set(goal.id, { ...goal, children: [] });
    });
    
    // Second pass: build hierarchy
    goals.forEach(goal => {
      const currentGoal = goalMap.get(goal.id)!;
      if (goal.parent_id) {
        const parent = goalMap.get(goal.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentGoal);
        }
      } else {
        rootGoals.push(currentGoal);
      }
    });
    
    // Sort children at each level
    const sortGoals = (goals: Goal[]) => {
      goals.sort((a, b) => {
        // Sort by goal_number (handles 1.1, 1.2, 1.10 correctly)
        const aParts = a.goal_number.split('.').map(n => parseInt(n));
        const bParts = b.goal_number.split('.').map(n => parseInt(n));
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aNum = aParts[i] || 0;
          const bNum = bParts[i] || 0;
          if (aNum !== bNum) return aNum - bNum;
        }
        return 0;
      });
      
      goals.forEach(goal => {
        if (goal.children && goal.children.length > 0) {
          sortGoals(goal.children);
        }
      });
    };
    
    sortGoals(rootGoals);
    return rootGoals;
  },

  async updateDistrict(districtSlug: string, updates: any) {
    try {
      const response = await fetch(`/api/districts/${districtSlug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update district');
      }
      
      return result.district;
    } catch (error) {
      console.error('Error updating district:', error);
      throw error;
    }
  },

  async createGoal(districtSlug: string, parentId: string | null, goalData: {
    title: string;
    goal_number: string;
    level: number;
  }) {
    try {
      const response = await fetch(`/api/districts/${districtSlug}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, goalData: { ...goalData, order_position: 0 } })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create goal');
      }
      
      return result.goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async updateGoal(districtSlug: string, goalId: string, updates: any) {
    console.log('🌐 dbService.updateGoal called:', { districtSlug, goalId, updates });
    
    try {
      const response = await fetch(`/api/districts/${districtSlug}/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, updates })
      });
      
      console.log('📡 API Response status:', response.status);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', result);
        throw new Error(result.error || 'Failed to update goal');
      }
      
      console.log('✅ Goal updated successfully:', result.goal);
      return result.goal;
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(districtSlug: string, goalId: string) {
    try {
      const response = await fetch(`/api/districts/${districtSlug}/goals?goalId=${goalId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete goal');
      }
      
      return result.success;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async createMetric(districtSlug: string, goalId: string, metricData: any) {
    console.log('🌐 dbService.createMetric called:', { districtSlug, goalId, metricData });
    
    try {
      const response = await fetch(`/api/districts/${districtSlug}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, metricData })
      });
      
      console.log('📡 API Response status:', response.status);
      
      // Try to parse the response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('❌ API Error:', result);
        // Provide more detailed error message
        const errorMessage = result.error || result.message || 'Failed to create metric';
        const errorDetails = result.details ? `\n${JSON.stringify(result.details)}` : '';
        const errorHint = result.hint ? `\nHint: ${result.hint}` : '';
        throw new Error(`${errorMessage}${errorDetails}${errorHint}`);
      }
      
      console.log('✅ Metric created successfully:', result.metric);
      return result.metric;
    } catch (error) {
      console.error('❌ Error creating metric:', error);
      // Make sure to propagate the error with details
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to create metric: ' + String(error));
      }
    }
  },

  async updateMetric(districtSlug: string, metricId: string, updates: any) {
    console.log('🌐 dbService.updateMetric called:', { districtSlug, metricId, updates });
    
    try {
      const response = await fetch(`/api/districts/${districtSlug}/metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metricId, updates })
      });
      
      console.log('📡 API Response status:', response.status);
      
      // Try to parse the response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('❌ API Error:', result);
        // Provide more detailed error message
        const errorMessage = result.error || result.message || 'Failed to update metric';
        const errorDetails = result.details ? `\n${JSON.stringify(result.details)}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      console.log('✅ Metric updated successfully:', result.metric);
      return result.metric;
    } catch (error) {
      console.error('❌ Error updating metric:', error);
      // Make sure to propagate the error with details
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to update metric: ' + String(error));
      }
    }
  },

  async deleteMetric(districtSlug: string, metricId: string) {
    try {
      const response = await fetch(`/api/districts/${districtSlug}/metrics?metricId=${metricId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete metric');
      }
      
      return result.success;
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  },

  async getNextGoalNumber(districtSlug: string, parentId: string | null, level: number): Promise<string> {
    try {
      const params = new URLSearchParams({
        level: level.toString()
      });
      if (parentId) params.set('parentId', parentId);
      
      const response = await fetch(`/api/districts/${districtSlug}/goals/next-number?${params}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get next goal number');
      }
      
      return result.goalNumber;
    } catch (error) {
      console.error('Error getting next goal number:', error);
      throw error;
    }
  },

  async getAllDistricts() {
    const { data, error } = await supabase
      .from('spb_districts')
      .select('id, name, slug')
      .order('name');
    
    if (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
    
    console.log('Fetched districts:', data);
    return data || [];
  },

  async createDistrict(name: string, slug: string, adminEmail?: string) {
    const district = await createDistrict({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      primary_color: '#003366',
      secondary_color: '#0099CC',
      admin_email: adminEmail || '',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (!district) {
      throw new Error('Failed to create district');
    }
    
    return district;
  },

  async getDistrictSummary(districtId: string) {
    const [goalsResult, strategiesResult] = await Promise.all([
      supabase
        .from('spb_goals')
        .select('id')
        .eq('district_id', districtId)
        .eq('level', 0),
      supabase
        .from('spb_goals')
        .select('id')
        .eq('district_id', districtId)
        .neq('level', 0)
    ]);

    return {
      goalCount: goalsResult.data?.length || 0,
      strategyCount: strategiesResult.data?.length || 0
    };
  },

  async deleteDistrict(districtId: string, cascade: boolean = false) {
    console.log('🌐 dbService.deleteDistrict called:', { districtId, cascade });
    
    try {
      const response = await fetch('/api/districts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districtId, cascade })
      });
      
      console.log('📡 API Response status:', response.status);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', result);
        throw new Error(result.error || 'Failed to delete district');
      }
      
      console.log('✅ District deleted successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Error deleting district:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDeleteGoals: async (goalIds: string[]): Promise<boolean> => {
    try {
      console.log('🗑️ Bulk deleting goals:', goalIds);
      
      const { error } = await supabase
        .from('spb_goals')
        .delete()
        .in('id', goalIds);
      
      if (error) {
        console.error('❌ Error bulk deleting goals:', error);
        return false;
      }
      
      console.log('✅ Bulk delete successful for', goalIds.length, 'goals');
      return true;
    } catch (error) {
      console.error('❌ Error in bulkDeleteGoals:', error);
      return false;
    }
  },

  bulkArchiveGoals: async (goalIds: string[]): Promise<boolean> => {
    try {
      console.log('📦 Bulk archiving goals:', goalIds);
      
      const { error } = await supabase
        .from('spb_goals')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .in('id', goalIds);
      
      if (error) {
        console.error('❌ Error bulk archiving goals:', error);
        return false;
      }
      
      console.log('✅ Bulk archive successful for', goalIds.length, 'goals');
      return true;
    } catch (error) {
      console.error('❌ Error in bulkArchiveGoals:', error);
      return false;
    }
  },

  bulkUpdateGoalStatus: async (goalIds: string[], status: string): Promise<boolean> => {
    try {
      console.log('🔄 Bulk updating goal status:', goalIds, 'to', status);
      
      const { error } = await supabase
        .from('spb_goals')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', goalIds);
      
      if (error) {
        console.error('❌ Error bulk updating goal status:', error);
        return false;
      }
      
      console.log('✅ Bulk status update successful for', goalIds.length, 'goals');
      return true;
    } catch (error) {
      console.error('❌ Error in bulkUpdateGoalStatus:', error);
      return false;
    }
  }
};