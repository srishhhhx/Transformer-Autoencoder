from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.model import load_model_and_scaler
from app.websocket import router as websocket_router
from app.rest import router as rest_router
from contextlib import asynccontextmanager

# --- Lifespan Context ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_and_scaler()
    print("Model and Scaler loaded.")
    print("Backend ready to receive connections.")
    yield
    print("Shutting down...")

# --- App Init ---
app = FastAPI(title="Real-Time Anomaly Detection API", version="1.0", lifespan=lifespan)

# --- CORS Setup for React Frontend ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routes ---
app.include_router(websocket_router)
app.include_router(rest_router, prefix="/api")
