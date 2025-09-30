'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { VisualizationType } from '@/lib/metric-visualizations';
import { PerformanceTrendChart } from './visualizations/PerformanceTrendChart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface MetricPreviewProps {
  type: VisualizationType;
  data: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MetricPreview({ type, data }: MetricPreviewProps) {
  const renderPreview = () => {
    switch (type) {
      case 'percentage':
        return (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{data.label || 'Metric Name'}</h3>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {data.currentValue || 0}%
                  </span>
                  {data.suffix && (
                    <span className="text-lg text-gray-500">{data.suffix}</span>
                  )}
                  {data.showTrend && data.currentValue > 50 && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {data.showProgressBar && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>Target: {data.targetValue || 100}%</span>
                    </div>
                    <Progress 
                      value={(data.currentValue / (data.targetValue || 100)) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'number':
        const trend = data.previousValue ? 
          (data.currentValue > data.previousValue ? 'up' : 
           data.currentValue < data.previousValue ? 'down' : 'neutral') : null;
        
        return (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{data.label || 'Metric Name'}</h3>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {data.currentValue?.toFixed(data.decimals || 0) || 0}
                  </span>
                  {data.unit && (
                    <span className="text-lg text-gray-500">{data.unit}</span>
                  )}
                  {data.showTrend && trend && (
                    <>
                      {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                      {trend === 'neutral' && <Minus className="w-5 h-5 text-gray-500" />}
                    </>
                  )}
                </div>

                {data.targetValue && (
                  <div className="text-sm text-gray-600">
                    Target: {data.targetValue} {data.unit}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'bar-chart':
        const barData = data.dataPoints || [];
        
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{data.label || 'Bar Chart'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    {data.showLegend && <Legend />}
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      case 'line-chart':
        const lineData = data.dataPoints || [];
        
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{data.label || 'Line Chart'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {data.showArea ? (
                    <AreaChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="y" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type={data.smoothCurve ? "monotone" : "linear"}
                        dataKey="y" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={data.showDots !== false}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      case 'donut-chart':
        const pieData = data.categories || [];
        const total = pieData.reduce((sum: number, item: any) => sum + item.value, 0);
        
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{data.label || 'Donut Chart'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    {data.showLegend && <Legend />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {data.showPercentages && (
                <div className="mt-4 space-y-2">
                  {pieData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {((item.value / total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'status':
        const statusConfig = {
          'completed': { 
            color: 'bg-green-100 text-green-800 border-green-200', 
            icon: CheckCircle,
            text: 'Completed'
          },
          'on-target': { 
            color: 'bg-green-100 text-green-800 border-green-200', 
            icon: CheckCircle,
            text: 'On Target'
          },
          'off-target': { 
            color: 'bg-orange-100 text-orange-800 border-orange-200', 
            icon: AlertCircle,
            text: 'Off Target'
          },
          'at-risk': { 
            color: 'bg-red-100 text-red-800 border-red-200', 
            icon: XCircle,
            text: 'At Risk'
          },
          'pending': { 
            color: 'bg-gray-100 text-gray-800 border-gray-200', 
            icon: Clock,
            text: 'Pending'
          }
        };

        const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{data.label || 'Status'}</h3>
                  <Badge className={config.color}>
                    {config.text}
                  </Badge>
                </div>

                {data.showIcon && (
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-8 h-8" style={{ color: config.color.includes('green') ? '#22c55e' : 
                                                                config.color.includes('orange') ? '#f97316' :
                                                                config.color.includes('red') ? '#ef4444' : '#6b7280' }} />
                    <div>
                      <p className="text-2xl font-bold">{config.text}</p>
                      {data.description && (
                        <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                      )}
                    </div>
                  </div>
                )}

                {!data.showIcon && data.description && (
                  <p className="text-gray-600">{data.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'performance-trend':
        return <PerformanceTrendChart config={data} className="w-full" />;

      default:
        return (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center py-8 text-gray-500">
                Preview for {type} coming soon...
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <p className="text-sm text-gray-600">
          This is how your metric will appear
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
        {renderPreview()}
      </div>
    </div>
  );
}