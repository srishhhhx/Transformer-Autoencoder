# Real-Time Financial Anomaly Detection System

A comprehensive anomaly detection system for financial time series data using Transformer Autoencoder models with real-time visualization capabilities.

##  Overview

This project implements a sophisticated anomaly detection system designed to identify unusual patterns in financial time series data. The system combines machine learning with real-time data processing to detect various types of anomalies including contextual, pattern-based, collective, and subtle anomalies in financial markets.

##  Architecture

The system consists of three main components:

### 1. **Machine Learning Model** (Transformer Autoencoder)
- **Architecture**: Multi-layer Transformer with encoder-decoder structure
- **Input**: Sequential financial data (OHLCV - Open, High, Low, Close, Volume)
- **Output**: Reconstruction error scores for anomaly detection
- **Key Features**:
  - Positional encoding for temporal understanding
  - Multi-head self-attention mechanisms
  - 3-layer encoder and decoder blocks
  - Residual connections and layer normalization

### 2. **Backend API** (FastAPI)
- **Framework**: FastAPI with async support
- **Features**:
  - RESTful API endpoints for model control
  - WebSocket connections for real-time data streaming
  - Data simulation and preprocessing
  - Model inference and anomaly scoring
- **Components**:
  - Real-time data simulator
  - WebSocket manager for live updates
  - Database integration for data persistence
  - Model serving and prediction pipeline

### 3. **Frontend Dashboard** (React)
- **Framework**: React 19 with Vite
- **Visualization**: Recharts for interactive charts
- **Styling**: Tailwind CSS with dark theme
- **Features**:
  - Real-time anomaly visualization
  - Interactive control panel
  - Multiple chart types (line, area, table)
  - Responsive design with modern UI/UX

##  Features

### Anomaly Detection Capabilities
- **Contextual Anomalies**: Breaks in normal feature correlations
- **Pattern Anomalies**: Spikes, dips, level shifts, trend changes
- **Collective Anomalies**: Multi-feature anomalies (flash crashes, price jumps)
- **Subtle Anomalies**: Hard-to-detect micro-patterns and small shifts
- **Mixed Anomalies**: Combination of multiple anomaly types

### Real-Time Processing
- Live data streaming via WebSocket
- Real-time anomaly detection and scoring
- Interactive start/stop controls
- Status monitoring and error handling

### Advanced Visualization
- **AnomalyChart**: Live stock price data with highlighted anomalies
- **ErrorChart**: Reconstruction error visualization with threshold lines
- **AnomalyTable**: Scrollable table of detected anomalies with timestamps
- **ControlPanel**: System control with status indicators

## Model Performance

The system has been tested with various anomaly injection methods:

| Anomaly Type | Precision | Recall | F1 Score | F2 Score | F4 Score |
|--------------|-----------|--------|----------|----------|----------|
| **Contextual** | 0.6622 | 0.9935 | 0.7947 | 0.9031 | 0.9651 |
| **Pattern** | 0.5890 | 0.7909 | 0.4233 | 0.5870 | 0.7176 |
| **Collective** | 0.5219 | 0.7939 | 0.5509 | 0.6749 | 0.7547 |
| **Subtle** | 0.4900 | 0.7439 | 0.0919 | 0.1939 | 0.4056 |
| **Mixed** | 0.5338 | 0.7751 | 0.3592 | 0.5297 | 0.6821 |

*Note: The model shows excellent recall across all anomaly types, with particularly strong performance on contextual anomalies.*

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **TensorFlow/Keras** - Deep learning framework for model training and inference
- **NumPy & Pandas** - Data manipulation and numerical computing
- **Scikit-learn** - Machine learning utilities and preprocessing
- **Uvicorn** - ASGI server for FastAPI
- **AsyncPG** - Async PostgreSQL driver
- **Python-dotenv** - Environment variable management

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Recharts** - Composable charting library for React
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **WebSocket API** - Real-time bidirectional communication

## Project Structure

```
anomaly-detection/
├── anomaly_backend/           # Backend API and ML model
│   ├── app/
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── model.py          # ML model loading and inference
│   │   ├── websocket.py      # WebSocket handlers
│   │   ├── rest.py           # REST API endpoints
│   │   ├── simulator.py      # Data simulation
│   │   ├── db.py             # Database operations
│   │   └── utils.py          # Utility functions
│   ├── models/               # Trained model files
│   ├── data/                 # Data storage
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Frontend utilities
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anomaly-detection/anomaly_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/anomaly_db

# Model Settings
MODEL_PATH=./models/transformer_autoencoder.h5
SCALER_PATH=./models/scaler.pkl
SEQUENCE_LENGTH=60
THRESHOLD=0.000028

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend Configuration
The frontend automatically connects to the backend API at `http://localhost:8000`. Update the API base URL in the source code if needed.

## Usage

### Starting Real-Time Detection

1. **Access the Dashboard**
   - Open your browser to `http://localhost:5173`
   - You'll see the anomaly detection dashboard

2. **Start Streaming**
   - Click the "Start Streaming" button in the control panel
   - The system will begin simulating real-time financial data
   - Anomalies will be detected and highlighted in real-time

3. **Monitor Results**
   - **AnomalyChart**: View live price data with red dots indicating anomalies
   - **ErrorChart**: Monitor reconstruction error levels and threshold
   - **AnomalyTable**: Review detailed anomaly information with timestamps

4. **Control the System**
   - Use Start/Stop buttons to control data streaming
   - Monitor system status through the status indicators

### API Endpoints

#### REST API
- `GET /health` - Health check
- `POST /start` - Start anomaly detection
- `POST /stop` - Stop anomaly detection
- `GET /status` - Get current system status

#### WebSocket
- `ws://localhost:8000/ws` - Real-time data and anomaly updates

## Model Training

The Transformer Autoencoder model is trained on NIFTY 50 minute-level financial data with the following specifications:

### Training Process
1. **Data Preprocessing**
   - Normalization using MinMaxScaler
   - Sequence creation (60-minute windows)
   - Feature selection (OHLCV)

2. **Model Architecture**
   - Input embedding with positional encoding
   - 3-layer Transformer encoder
   - 3-layer Transformer decoder
   - Multi-head attention (8 heads)
   - Feed-forward networks with ReLU activation

3. **Training Configuration**
   - Loss function: Mean Squared Error (MSE)
   - Optimizer: Adam with exponential decay
   - Early stopping with validation monitoring
   - Batch size: 32
   - Epochs: 100 (with early stopping)

4. **Anomaly Detection**
   - Reconstruction error calculation
   - ROC curve analysis with Youden's J-statistic
   - Optimal threshold determination
   - Performance evaluation with multiple metrics

## Use Cases

### Financial Applications
- **Fraud Detection**: Identify suspicious trading patterns
- **Market Monitoring**: Flag unusual market behavior
- **Risk Management**: Early warning system for market anomalies
- **Algorithmic Trading**: Detect system malfunctions or unusual patterns

### System Monitoring
- **Platform Monitoring**: Identify system irregularities in trading platforms
- **Data Quality**: Detect erroneous or corrupted data points
- **Performance Monitoring**: Track system performance anomalies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

