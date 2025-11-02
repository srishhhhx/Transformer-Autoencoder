import { useState, useEffect, useRef } from 'react';
import { ResizableBox } from 'react-resizable';
import ControlPanel from './components/ControlPanel';
import AnomalyTable from './components/AnomalyTable';
import AnomalyChart from './components/AnomalyChart';
import ErrorChart from './components/ErrorChart';
import axios from 'axios';

const STOCK = 'banknifty';
const BASE_URL = 'http://localhost:8000';

function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [anomalyTable, setAnomalyTable] = useState([]);
  const [chartData, setChartData] = useState([]); // {timestamp, value, is_anomaly}
  const [errorData, setErrorData] = useState([]); // {timestamp, reconstruction_error, threshold, is_anomaly}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef(null);

  // Initial fetch for anomaly table and health check
  useEffect(() => {
    setLoading(true);
    
    // First, check if backend is healthy
    axios.get(`${BASE_URL}/api/health`)
      .then(() => {
        console.log('Backend health check passed');
        // If healthy, fetch anomalies
        return axios.get(`${BASE_URL}/api/anomalies/${STOCK}`);
      })
      .then(res => {
        console.log('Anomalies fetched:', res.data);
        if (res.data && res.data.anomalies) {
          setAnomalyTable(res.data.anomalies);
        }
        setError("");
      })
      .catch((error) => {
        console.error('Initial connection failed:', error);
        setAnomalyTable([]);
        if (error.request && !error.response) {
          setError("Cannot connect to backend. Is the server running on port 8000?");
        } else {
          setError("Failed to fetch anomaly log.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // WebSocket handling
  useEffect(() => {
    if (!isStreaming) {
      if (wsRef.current) {
        console.log('Closing WebSocket due to streaming stop');
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }
    
    console.log('Attempting WebSocket connection to:', `ws://localhost:8000/ws/${STOCK}`);
    const ws = new window.WebSocket(`ws://localhost:8000/ws/${STOCK}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection opened successfully');
      // Send a ping message to keep connection alive
      ws.send('ping');
    };
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Received WebSocket message:', msg); // Debug log
        
        // Handle error messages from backend
        if (msg.error) {
          console.error('Backend error:', msg.error);
          setError(`Backend error: ${msg.error}`);
          return;
        }
        
        // Extract price data (using 'close' price from the data object)
        const price = msg.data?.close || 0;
        const threshold = 0.000087; // Fixed threshold from backend
        
        // Update chart data (rolling window) - using close price
        setChartData(prev => {
          const next = [...prev, { 
            timestamp: msg.timestamp, 
            value: price, 
            is_anomaly: msg.anomaly 
          }];
          return next.length > 50 ? next.slice(-50) : next;
        });
        
        // Update error data only if we have a score (after 60 data points)
        if (msg.score !== null && msg.score !== undefined) {
          setErrorData(prev => {
            const next = [...prev, { 
              timestamp: msg.timestamp, 
              reconstruction_error: msg.score, 
              threshold: threshold, 
              is_anomaly: msg.anomaly 
            }];
            return next.length > 50 ? next.slice(-50) : next;
          });
        }
        
        // Update anomaly table if anomaly detected
        if (msg.anomaly && msg.score !== null) {
          setAnomalyTable(prev => [
            { timestamp: msg.timestamp, score: msg.score }, 
            ...prev
          ].slice(0, 15));
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket error details:', {
        readyState: ws.readyState,
        url: ws.url,
        protocol: ws.protocol
      });
      setError("WebSocket connection error. Check if backend is running.");
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        readyState: ws.readyState
      });
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (wsRef.current === ws) {
        ws.close();
        wsRef.current = null;
      }
    };
  }, [isStreaming]);

  // Start/Stop handlers
  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('Attempting to start streaming at:', `${BASE_URL}/api/start/${STOCK}`);
      const response = await axios.post(`${BASE_URL}/api/start/${STOCK}`);
      console.log('Start streaming response:', response.data);
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start streaming:', error);
      if (error.response) {
        // Server responded with error status
        setError(`Failed to start streaming: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        setError("Failed to connect to backend. Is the server running on port 8000?");
      } else {
        // Something else happened
        setError("Failed to start streaming: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleStop = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/api/stop/${STOCK}`);
      setIsStreaming(false);
    } catch (error) {
      console.error('Failed to stop streaming:', error);
      setError("Failed to stop streaming.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-screen">
          {/* Left Column - Control Panel and Anomaly Table */}
          <div className="flex flex-col gap-6">
            <ResizableBox
              width={480}
              height={200}
              minConstraints={[300, 150]}
              maxConstraints={[800, 400]}
              resizeHandles={['se']}
              className="relative"
            >
              <ControlPanel
                isStreaming={isStreaming}
                onStart={handleStart}
                onStop={handleStop}
                loading={loading}
                error={error}
              />
            </ResizableBox>
            
            <ResizableBox
              width={480}
              height={400}
              minConstraints={[300, 200]}
              maxConstraints={[800, 800]}
              resizeHandles={['se']}
              className="relative flex-1"
            >
              <AnomalyTable anomalies={anomalyTable} />
            </ResizableBox>
          </div>
          
          {/* Right Column - Charts */}
          <div className="flex flex-col gap-6">
            <ResizableBox
              width={600}
              height={300}
              minConstraints={[400, 200]}
              maxConstraints={[1000, 600]}
              resizeHandles={['se']}
              className="relative"
            >
              <AnomalyChart data={chartData} />
            </ResizableBox>
            
            <ResizableBox
              width={600}
              height={300}
              minConstraints={[400, 200]}
              maxConstraints={[1000, 600]}
              resizeHandles={['se']}
              className="relative"
            >
              <ErrorChart data={errorData} />
            </ResizableBox>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
