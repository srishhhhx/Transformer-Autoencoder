from typing import Dict, List
from fastapi import WebSocket
from collections import defaultdict
import threading

# Holds connected WebSocket clients per stock
websocket_connections: Dict[str, List[WebSocket]] = defaultdict(list)
ws_lock = threading.Lock()

# Register a new WebSocket connection
def register_ws(stock: str, websocket: WebSocket):
    with ws_lock:
        websocket_connections[stock].append(websocket)

# Unregister a WebSocket connection
def unregister_ws(stock: str, websocket: WebSocket):
    with ws_lock:
        if websocket in websocket_connections[stock]:
            websocket_connections[stock].remove(websocket)

# Push a message to all clients listening to a specific stock
async def push_to_websocket(stock: str, message: dict):
    dead_clients = []
    with ws_lock:
        clients_to_send = websocket_connections[stock].copy()
    
    for ws in clients_to_send:
        try:
            await ws.send_json(message)
        except Exception as e:
            print(f"!!! WebSocket send error for {stock}: {e}")
            dead_clients.append(ws)

    # Remove dead clients
    for ws in dead_clients:
        unregister_ws(stock, ws)

# Optionally: broadcast to all stocks
async def broadcast_all(message: dict):
    for stock in websocket_connections:
        await push_to_websocket(stock, message)
