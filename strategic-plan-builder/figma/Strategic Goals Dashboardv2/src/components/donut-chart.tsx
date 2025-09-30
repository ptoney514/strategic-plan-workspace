import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  value: number;
  color: string;
  size?: number;
}

export function DonutChart({ value, color, size = 56 }: DonutChartProps) {
  const data = [
    { name: 'completed', value: value },
    { name: 'remaining', value: 100 - value }
  ];

  const colors = [color, '#E5E7EB'];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.36}
            outerRadius={size * 0.5}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-neutral-900">{value}%</span>
      </div>
    </div>
  );
}