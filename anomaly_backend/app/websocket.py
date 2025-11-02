from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws_manager import register_ws, unregister_ws
import asyncio

router = APIRouter()

@router.websocket("/ws/{stock}")
async def websocket_endpoint(websocket: WebSocket, stock: str):
    await websocket.accept()
    print(f"WebSocket connection accepted for {stock}")
    register_ws(stock, websocket)
    
    # Send a welcome message immediately
    try:
        await websocket.send_json({
            "type": "connection",
            "message": f"Connected to {stock} stream",
            "timestamp": None,
            "data": None,
            "anomaly": False,
            "score": None
        })
        print(f"Welcome message sent to {stock} client")
    except Exception as e:
        print(f"Failed to send welcome message: {e}")
    
    try:
        # Keep the connection alive without blocking on receive
        while True:
            try:
                # Use a timeout to avoid blocking indefinitely
                message = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                print(f"Received message from {stock} client: {message}")
            except asyncio.TimeoutError:
                # Timeout is expected - just continue to keep connection alive
                continue
            except WebSocketDisconnect:
                print(f"WebSocket client disconnected for {stock}")
                break
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {stock}")
    except Exception as e:
        print(f"WebSocket error for {stock}: {e}")
        import traceback
        print(f"WebSocket error traceback: {traceback.format_exc()}")
    finally:
        unregister_ws(stock, websocket)
        print(f"WebSocket cleanup completed for {stock}")
