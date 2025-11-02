import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

function ErrorChart({ data }) {
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
    displayTime: formatTime(item.timestamp),
    segment: item.reconstruction_error > item.threshold ? 'anomaly' : 'normal'
  }));

  // Get the latest threshold value for reference line
  const latestThreshold = data.length > 0 ? data[data.length - 1].threshold : 0.000087;

  if (!data || data.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">ErrorChart</h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No reconstruction error data available. Start streaming and wait for model inference.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">ErrorChart</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
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
              domain={[0, 'dataMax * 1.1']}
              tickFormatter={(value) => value.toExponential(2)}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#f9fafb'
              }}
              labelStyle={{ color: '#f9fafb' }}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toExponential(3) : value, 
                name === 'reconstruction_error' ? 'Reconstruction Error' : name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <ReferenceLine 
              y={latestThreshold} 
              stroke="red" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ value: "Threshold", position: "topRight", fill: "red" }}
            />
            {/* Normal area */}
            <Area
              type="monotone"
              dataKey="reconstruction_error"
              stroke="#d97706"
              strokeWidth={2}
              fill="url(#colorNormal)"
              isAnimationActive={false}
            />
            {/* Anomaly overlay */}
            <Area
              type="monotone"
              dataKey={(entry) => entry.segment === 'anomaly' ? entry.reconstruction_error : null}
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorAnomaly)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ErrorChart;
