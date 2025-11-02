import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot, CartesianGrid } from 'recharts';

function AnomalyChart({ data }) {
  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    displayTime: formatTime(item.timestamp)
  }));

  if (!data || data.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">AnomalyChart</h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No data available. Start streaming to see live price data.</p>
        </div>
      </div>
    );
  }

  // Calculate a threshold line position based on data range
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const thresholdValue = minValue + (maxValue - minValue) * 0.7; // 70% of the range

  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">AnomalyChart</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#374151" strokeDasharray="2 2" strokeOpacity={0.3} />
            <XAxis 
              dataKey="displayTime" 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#f9fafb'
              }}
              labelStyle={{ color: '#f9fafb' }}
              formatter={(value) => [
                typeof value === 'number' ? value.toFixed(2) : value, 
                'Price'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <ReferenceLine 
              y={thresholdValue} 
              stroke="red" 
              strokeDasharray="3 3" 
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0891b2"
              strokeWidth={2}
              dot={({ cx, cy, payload }) =>
                payload && payload.is_anomaly ? (
                  <Dot cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                ) : false
              }
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnomalyChart;
