from fastapi import APIRouter, HTTPException
from app.simulator import simulate_stream
from app.state import get_streaming_flag, set_streaming_flag
from app.db import fetch_last_anomalies, truncate_anomalies
import asyncio

router = APIRouter()
running_tasks = {}

@router.post("/start/{stock}")
async def start_stream(stock: str):
    if get_streaming_flag(stock):
        raise HTTPException(status_code=400, detail="Stream already running.")
    
    # Truncate previous anomalies for this stock
    await truncate_anomalies(stock)

    # Start streaming
    task = asyncio.create_task(simulate_stream(stock))
    running_tasks[stock] = task
    return {"message": f"Stream started for {stock}"}

@router.post("/stop/{stock}")
async def stop_stream(stock: str):
    if not get_streaming_flag(stock):
        raise HTTPException(status_code=400, detail="No active stream to stop.")

    set_streaming_flag(stock, False)
    if stock in running_tasks:
        task = running_tasks.pop(stock)
        task.cancel()
        try:
            await task  # Await the task to ensure it's cancelled and cleaned up
        except asyncio.CancelledError:
            pass # Task was successfully cancelled
    return {"message": f"Stream stopped for {stock}"}

@router.get("/anomalies/{stock}")
async def get_anomalies(stock: str):
    records = await fetch_last_anomalies(stock)
    return {"anomalies": records}

@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is healthy"}
