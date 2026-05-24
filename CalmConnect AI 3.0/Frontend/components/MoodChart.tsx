
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MoodEntry } from '../types';

interface MoodChartProps {
  data: MoodEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const moodOption = {
      1: { emoji: '😔', label: 'Very Sad' },
      2: { emoji: '😟', label: 'Sad' },
      3: { emoji: '😐', label: 'Neutral' },
      4: { emoji: '🙂', label: 'Happy' },
      5: { emoji: '😄', label: 'Very Happy' },
    }[data.mood as number];

    return (
      <div className="p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-blue-500 dark:text-blue-400 text-sm">Mood: {moodOption?.emoji} {moodOption?.label}</p>
        {data.notes && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-normal">
              {data.notes}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};


const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  const formattedData = data.map(entry => ({
    ...entry,
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
  
  const yAxisTicks = [1, 2, 3, 4, 5];
  const formatYAxis = (tick: number) => {
    const labels = ['😔', '😟', '😐', '🙂', '😄'];
    return labels[tick - 1] || '';
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="date" stroke="#9ca3af"/>
        <YAxis 
          ticks={yAxisTicks}
          tickFormatter={formatYAxis} 
          domain={[0.5, 5.5]}
          stroke="#9ca3af"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} dot={{ fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoodChart;