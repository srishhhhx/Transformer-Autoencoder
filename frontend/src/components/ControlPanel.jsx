import React from 'react';

function ControlPanel({ isStreaming, onStart, onStop, loading, error }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-gray-700 shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">Anomaly Detection</h2>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            className="flex-1 bg-green-800 hover:bg-green-700 disabled:bg-green-900 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            onClick={onStart}
            disabled={isStreaming || loading}
          >
            {loading && !isStreaming && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            Start
          </button>
          
          <button
            className="flex-1 bg-red-800 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            onClick={onStop}
            disabled={!isStreaming || loading}
          >
            {loading && isStreaming && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            Stop
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Status:</span>
            {isStreaming ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></div>
                </div>
                <span className="text-green-400 font-semibold">Streaming</span>
              </div>
            ) : (
              <span className="text-red-400 font-semibold">Stopped</span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
