'use client';

import React from 'react';
import { PerformanceTrend } from '@/components/metrics/visualizations/PerformanceTrend';
import { ComparativeChart } from '@/components/metrics/visualizations/ComparativeChart';
import { MilestoneTracker } from '@/components/metrics/visualizations/MilestoneTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricsShowcasePage() {
  // Sample data for Performance Trend
  const performanceTrendData = {
    years: [
      { year: 2021, target: 75, actual: 72 },
      { year: 2022, target: 78, actual: 76 },
      { year: 2023, target: 82, actual: 79 },
      { year: 2024, target: 85, actual: 83 },
      { year: 2025, target: 88, actual: null, projected: 86 },
    ],
    unit: '%',
    frequency: 'annual' as const,
    yAxisMin: 60,
    yAxisMax: 100,
  };

  // Sample data for Comparative Analysis
  const comparativeData = {
    entities: [
      { name: 'Lincoln High', value: 92, target: 85 },
      { name: 'Jefferson Middle', value: 78, target: 80 },
      { name: 'Washington Elementary', value: 85, target: 85 },
      { name: 'Roosevelt Primary', value: 73, target: 75 },
      { name: 'Adams Academy', value: 88, target: 82 },
      { name: 'Madison School', value: 81, target: 85 },
    ],
    metricName: 'Student Proficiency Rate',
    unit: '%',
    sortOrder: 'desc' as const,
    showDifference: true,
  };

  // Sample data for Milestone Tracker
  const milestoneData = {
    milestones: [
      {
        id: '1',
        name: 'Complete curriculum review',
        dueDate: new Date('2024-03-15'),
        status: 'completed' as const,
        completedDate: new Date('2024-03-10'),
        progress: 100,
      },
      {
        id: '2',
        name: 'Launch teacher training program',
        dueDate: new Date('2024-06-30'),
        status: 'completed' as const,
        completedDate: new Date('2024-06-25'),
        progress: 100,
      },
      {
        id: '3',
        name: 'Implement new assessment system',
        dueDate: new Date('2024-09-01'),
        status: 'on-track' as const,
        progress: 65,
      },
      {
        id: '4',
        name: 'Deploy student support services',
        dueDate: new Date('2024-10-15'),
        status: 'at-risk' as const,
        progress: 35,
      },
      {
        id: '5',
        name: 'Complete infrastructure upgrades',
        dueDate: new Date('2024-12-31'),
        status: 'on-track' as const,
        progress: 45,
      },
      {
        id: '6',
        name: 'Launch parent engagement portal',
        dueDate: new Date('2025-02-01'),
        status: 'on-track' as const,
        progress: 15,
      },
    ],
    showTimeline: true,
    showPercentComplete: true,
    currentDate: new Date('2024-08-15'),
  };

  // Additional sample data for different variations
  const schoolComparisonData = {
    entities: [
      { name: 'Math Department', value: 450000, category: 'Academic' },
      { name: 'Science Department', value: 380000, category: 'Academic' },
      { name: 'Athletics', value: 320000, category: 'Extra-curricular' },
      { name: 'Arts Program', value: 280000, category: 'Extra-curricular' },
      { name: 'Technology', value: 520000, category: 'Infrastructure' },
      { name: 'Facilities', value: 680000, category: 'Infrastructure' },
    ],
    metricName: 'Budget Allocation by Department',
    unit: '$',
    sortOrder: 'desc' as const,
    showDifference: false,
  };

  const enrollmentTrendData = {
    years: [
      { year: 2020, target: 5000, actual: 4850 },
      { year: 2021, target: 5100, actual: 4920 },
      { year: 2022, target: 5200, actual: 5080 },
      { year: 2023, target: 5300, actual: 5250 },
      { year: 2024, target: 5400, actual: 5380 },
      { year: 2025, target: 5500, actual: null, projected: 5450 },
    ],
    unit: 'students',
    frequency: 'annual' as const,
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Metrics Visualization Showcase</h1>
        <p className="text-muted-foreground">
          Demonstrating various metric visualization components for the Strategic Plan Builder POC
        </p>
      </div>

      {/* Performance Trend Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Performance Trend Visualizations</h2>
        <div className="grid grid-cols-12 gap-6">
          <PerformanceTrend
            name="Reading Proficiency Rate"
            description="Percentage of students meeting or exceeding reading standards"
            data={performanceTrendData}
            displayWidth="full"
          />
          <PerformanceTrend
            name="Student Enrollment"
            description="Total student enrollment across all schools"
            data={enrollmentTrendData}
            displayWidth="half"
          />
          <PerformanceTrend
            name="Graduation Rate"
            description="4-year graduation rate for high school students"
            data={{
              years: [
                { year: 2021, target: 85, actual: 82 },
                { year: 2022, target: 86, actual: 84 },
                { year: 2023, target: 87, actual: 86 },
                { year: 2024, target: 88, actual: 87 },
              ],
              unit: '%',
              frequency: 'annual' as const,
              yAxisMin: 75,
              yAxisMax: 95,
            }}
            displayWidth="half"
          />
        </div>
      </section>

      {/* Comparative Analysis Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Comparative Analysis</h2>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <ComparativeChart config={comparativeData} />
          </div>
          <div className="col-span-6">
            <ComparativeChart config={schoolComparisonData} />
          </div>
        </div>
      </section>

      {/* Milestone Tracker Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Milestone Tracking</h2>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <MilestoneTracker config={milestoneData} />
          </div>
          <div className="col-span-6">
            <MilestoneTracker 
              config={{
                ...milestoneData,
                milestones: milestoneData.milestones.slice(0, 3),
                timelineView: 'gantt',
              }} 
            />
          </div>
          <div className="col-span-6">
            <MilestoneTracker 
              config={{
                milestones: [
                  {
                    id: '1',
                    name: 'Q1 Assessment Complete',
                    dueDate: new Date('2024-03-31'),
                    status: 'completed' as const,
                    completedDate: new Date('2024-03-28'),
                    progress: 100,
                  },
                  {
                    id: '2',
                    name: 'Q2 Professional Development',
                    dueDate: new Date('2024-06-30'),
                    status: 'completed' as const,
                    completedDate: new Date('2024-06-30'),
                    progress: 100,
                  },
                  {
                    id: '3',
                    name: 'Q3 Technology Rollout',
                    dueDate: new Date('2024-09-30'),
                    status: 'on-track' as const,
                    progress: 60,
                  },
                  {
                    id: '4',
                    name: 'Q4 Year-End Review',
                    dueDate: new Date('2024-12-31'),
                    status: 'on-track' as const,
                    progress: 10,
                  },
                ],
                showTimeline: false,
                showPercentComplete: true,
                currentDate: new Date('2024-08-15'),
              }} 
            />
          </div>
        </div>
      </section>

      {/* Mixed Layout Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dashboard Layout Example</h2>
        <div className="grid grid-cols-12 gap-6">
          <PerformanceTrend
            name="Teacher Retention Rate"
            description="Annual teacher retention across the district"
            data={{
              years: [
                { year: 2021, target: 90, actual: 87 },
                { year: 2022, target: 91, actual: 88 },
                { year: 2023, target: 92, actual: 89 },
                { year: 2024, target: 93, actual: 91 },
              ],
              unit: '%',
              frequency: 'annual' as const,
              yAxisMin: 80,
              yAxisMax: 100,
            }}
            displayWidth="third"
          />
          <div className="col-span-4">
            <ComparativeChart 
              config={{
                entities: [
                  { name: 'Elementary', value: 92 },
                  { name: 'Middle', value: 87 },
                  { name: 'High', value: 89 },
                ],
                metricName: 'Attendance Rate by Level',
                unit: '%',
                sortOrder: 'desc' as const,
              }} 
            />
          </div>
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">5,380</p>
                    <p className="text-xs text-green-600">+2.5% from last year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teachers</p>
                    <p className="text-2xl font-bold">312</p>
                    <p className="text-xs text-green-600">+8 new hires</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Class Size</p>
                    <p className="text-2xl font-bold">22.4</p>
                    <p className="text-xs text-gray-600">Within target range</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}