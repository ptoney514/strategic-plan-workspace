import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService } from '@/lib/db-service';
import { Goal, Metric, buildGoalHierarchy } from '@/lib/types';
import { toast } from 'sonner';

// District query key factory
export const districtKeys = {
  all: ['districts'] as const,
  detail: (slug: string) => [...districtKeys.all, slug] as const,
};

// Goal query key factory
export const goalKeys = {
  all: ['goals'] as const,
  detail: (districtSlug: string, goalId: string) => [...goalKeys.all, districtSlug, goalId] as const,
};

// Main hook to fetch district with goals and metrics
export function useDistrict(slug: string) {
  return useQuery({
    queryKey: districtKeys.detail(slug),
    queryFn: async () => {
      const data = await dbService.getDistrict(slug);
      if (!data) throw new Error('District not found');
      return data;
    },
    enabled: !!slug,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Hook to fetch a single goal
export function useGoal(districtSlug: string, goalId: string) {
  return useQuery({
    queryKey: goalKeys.detail(districtSlug, goalId),
    queryFn: async () => {
      // First get the district data
      const district = await dbService.getDistrict(districtSlug);
      if (!district) throw new Error('District not found');
      
      // Find the goal in the hierarchy
      const findGoal = (goals: Goal[]): Goal | null => {
        for (const goal of goals) {
          if (goal.id === goalId) return goal;
          if (goal.children) {
            const found = findGoal(goal.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const goal = findGoal(district.goals || []);
      if (!goal) throw new Error('Goal not found');
      
      return goal;
    },
    enabled: !!districtSlug && !!goalId,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Goal mutations with optimistic updates
export function useCreateGoal(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { parentId: string | null; level: number; title: string }) => {
      const startTime = Date.now();
      console.log('🚀 Starting goal creation:', params.title, 'at', new Date().toISOString());
      
      const goalNumber = await dbService.getNextGoalNumber(districtSlug, params.parentId, params.level);
      const result = await dbService.createGoal(districtSlug, params.parentId, {
        title: params.title,
        goal_number: goalNumber,
        level: params.level,
      });
      
      const endTime = Date.now();
      console.log('✅ Goal creation completed in', endTime - startTime, 'ms:', result.id);
      return result;
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
      toast.error(errorMessage);
    },
    onSuccess: async (newGoal) => {
      // Force immediate refresh of the data
      await queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      await queryClient.refetchQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Goal created successfully');
    },
  });
}

export function useUpdateGoal(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; updates: any }) => {
      return await dbService.updateGoal(districtSlug, params.goalId, params.updates);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Goal updated successfully');
    },
  });
}

export function useDeleteGoal(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      return await dbService.deleteGoal(districtSlug, goalId);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Goal deleted successfully');
    },
  });
}

// Metric mutations
export function useCreateMetric(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; metric: any }) => {
      return await dbService.createMetric(districtSlug, params.goalId, params.metric);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create metric';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Metric created successfully');
    },
  });
}

export function useUpdateMetric(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { metricId: string; updates: any }) => {
      return await dbService.updateMetric(districtSlug, params.metricId, params.updates);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update metric';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Metric updated successfully');
    },
  });
}

export function useDeleteMetric(districtSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metricId: string) => {
      return await dbService.deleteMetric(districtSlug, metricId);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete metric';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(districtSlug) });
      toast.success('Metric deleted successfully');
    },
  });
}