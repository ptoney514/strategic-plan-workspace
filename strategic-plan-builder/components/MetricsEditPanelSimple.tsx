'use client';

import React from 'react';
import { Metric } from '@/lib/types';
import { MetricGridDisplay } from './metrics/MetricGridDisplay';

interface MetricsEditPanelSimpleProps {
  goalId: string;
  districtSlug: string;
  metrics: Metric[];
  onRefresh: () => void;
}

export function MetricsEditPanelSimple({ 
  goalId, 
  districtSlug, 
  metrics, 
  onRefresh 
}: MetricsEditPanelSimpleProps) {
  
  return (
    <MetricGridDisplay
      metrics={metrics}
      goalId={goalId}
      districtSlug={districtSlug}
      onRefresh={onRefresh}
      editable={true}
      maxRows={3}
    />
  );
}