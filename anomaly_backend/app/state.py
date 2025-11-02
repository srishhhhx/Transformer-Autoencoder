from collections import deque
from typing import Dict, Deque, Any
import threading

# Constants
WINDOW_SIZE = 60

# In-memory state per stock (scalable to multiple stocks)
streaming_flags: Dict[str, bool] = {}
current_indices: Dict[str, int] = {}
rolling_windows: Dict[str, Deque[Any]] = {}

# Locking mechanism for thread safety
state_lock = threading.Lock()

def initialize_stock(stock: str):
    with state_lock:
        streaming_flags.setdefault(stock, False)
        current_indices.setdefault(stock, 0)
        rolling_windows.setdefault(stock, deque(maxlen=WINDOW_SIZE))

def reset_stock(stock: str):
    with state_lock:
        streaming_flags[stock] = False
        current_indices[stock] = 0
        rolling_windows[stock].clear()

def get_streaming_flag(stock: str) -> bool:
    with state_lock:
        return streaming_flags.get(stock, False)

def set_streaming_flag(stock: str, status: bool):
    with state_lock:
        streaming_flags[stock] = status

def get_current_index(stock: str) -> int:
    with state_lock:
        return current_indices.get(stock, 0)

def increment_index(stock: str):
    with state_lock:
        current_indices[stock] += 1

def get_window(stock: str) -> Deque[Any]:
    with state_lock:
        return rolling_windows[stock]

def append_to_window(stock: str, row: Any):
    with state_lock:
        rolling_windows[stock].append(row)
