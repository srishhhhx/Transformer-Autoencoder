import React, { useRef, useEffect } from 'react';

function AnomalyTable({ anomalies }) {
  const firstRowRef = useRef(null);

  useEffect(() => {
    if (firstRowRef.current && anomalies && anomalies.length > 0) {
      firstRowRef.current.classList.add('animate-flash');
      const timeout = setTimeout(() => {
        if (firstRowRef.current) {
          firstRowRef.current.classList.remove('animate-flash');
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [anomalies]);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Anomaly Table</h2>
      
      <div className="flex-1 overflow-hidden">
        {(!anomalies || anomalies.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">No anomalies detected yet.</p>
              <p className="text-sm">Start streaming to see anomaly data</p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto h-full scrollbar-dark">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="text-left py-3 px-3 text-gray-200 font-semibold">Timestamp</th>
                  <th className="text-left py-3 px-3 text-gray-200 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((row, idx) => {
                  const score = typeof row.score === 'number' ? row.score : parseFloat(row.score) || 0;
                  const isHighAnomaly = score > 3.0;
                  
                  return (
                    <tr
                      key={`${row.timestamp}-${row.score}-${idx}`}
                      className={`
                        hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700/50
                        ${idx === 0 ? 'bg-red-900/30' : ''}
                        ${isHighAnomaly ? 'bg-red-900/20' : ''}
                      `}
                      ref={idx === 0 ? firstRowRef : null}
                    >
                      <td className="py-2 px-3 font-mono text-xs text-gray-300">
                        {formatTime(row.timestamp)}
                      </td>
                      <td className={`py-2 px-3 font-mono text-xs font-bold ${isHighAnomaly ? 'text-red-300' : 'text-red-400'}`}>
                        {typeof row.score === 'number' ? row.score.toFixed(6) : row.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnomalyTable;
