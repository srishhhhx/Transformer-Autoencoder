import asyncio
import pandas as pd
import numpy as np
import os
from app.model import predict_reconstruction_error
from app.state import (
    get_streaming_flag, set_streaming_flag,
    get_current_index, increment_index,
    append_to_window, get_window, initialize_stock, reset_stock
)
from app.ws_manager import push_to_websocket
from app.utils import is_anomaly
from app.db import save_anomaly

# Config
SLEEP_INTERVAL = 1  # seconds between rows
WINDOW_SIZE = 60

# Preload data into memory for performance
data_cache = {}


def load_stock_data(stock: str) -> pd.DataFrame:
    try:
        if stock in data_cache:
            print(f"Using cached data for {stock}")
            return data_cache[stock]
        
        file_path = f"data/{stock}.csv"
        print(f"Loading data from: {file_path}")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Data file not found: {file_path}")
            
        df = pd.read_csv(file_path)
        print(f"Loaded {len(df)} rows from {file_path}")
        
        df.dropna(inplace=True)
        print(f"After dropping NaN: {len(df)} rows")
        
        data_cache[stock] = df.reset_index(drop=True)
        print(f"Data cached for {stock}. Columns: {list(df.columns)}")
        return data_cache[stock]
        
    except Exception as e:
        print(f"!!! Error loading stock data for {stock}: {e}")
        raise


async def simulate_stream(stock: str):
    try:
        initialize_stock(stock)
        set_streaming_flag(stock, True)
        df = load_stock_data(stock)
        print(f"Started streaming for {stock} with {len(df)} data points")

        while get_streaming_flag(stock):
            try:
                idx = get_current_index(stock)

                if idx >= len(df):
                    set_streaming_flag(stock, False)
                    print(f"Reached end of data for {stock}")
                    break

                row = df.iloc[idx]
                
                data_point = row.to_dict()
                
                # Check if we have enough columns
                if len(row) < 2:
                    print(f"!!! Row {idx} has insufficient columns: {len(row)}")
                    increment_index(stock)
                    continue
                
                try:
                    feature_data = row.iloc[1:].values.astype(float)
                    append_to_window(stock, feature_data)
                except Exception as data_error:
                    print(f"!!! Error processing row data at index {idx}: {data_error}")
                    increment_index(stock)
                    continue
                
                increment_index(stock)

                # Only infer once we have full window
                window = get_window(stock)
                anomaly = False
                score = None

                if len(window) == WINDOW_SIZE:
                    try:
                        window_array = np.array(window)
                        score = predict_reconstruction_error(window_array)
                        anomaly = is_anomaly(score)
                        
                        if anomaly:
                            print(f"Anomaly detected at {row.iloc[0]} with score {score}")
                            await save_anomaly(stock, row.iloc[0], score)  # timestamp is first column
                    except Exception as model_error:
                        print(f"!!! Model prediction error for {stock}: {model_error}")
                        import traceback
                        print(f"!!! Traceback: {traceback.format_exc()}")
                        # Send error message to frontend but continue streaming
                        await push_to_websocket(stock, {
                            "timestamp": row.iloc[0],
                            "data": data_point,
                            "anomaly": False,
                            "score": None,
                            "error": f"Model prediction failed: {str(model_error)}"
                        })
                        await asyncio.sleep(SLEEP_INTERVAL)
                        continue

                # Push to frontend
                await push_to_websocket(stock, {
                    "timestamp": row.iloc[0],
                    "data": data_point,
                    "anomaly": anomaly,
                    "score": score
                })

                await asyncio.sleep(SLEEP_INTERVAL)

            except Exception as loop_error:
                print(f"!!! Error in streaming loop for {stock}: {loop_error}")
                # Send error to frontend and break the loop
                try:
                    await push_to_websocket(stock, {
                        "error": f"Streaming error: {str(loop_error)}",
                        "timestamp": None,
                        "data": None,
                        "anomaly": False,
                        "score": None
                    })
                except Exception as ws_error:
                    print(f"!!! Failed to send error message via WebSocket: {ws_error}")
                break

    except Exception as stream_error:
        print(f"!!! Critical error in simulate_stream for {stock}: {stream_error}")
        set_streaming_flag(stock, False)
    finally:
        reset_stock(stock)
        set_streaming_flag(stock, False)
        print(f"Stream cleanup completed for {stock}")
