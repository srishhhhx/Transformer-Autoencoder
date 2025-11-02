import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/anomaly_db")

# --- Connection Pool ---
pool = None

async def connect_db():
    global pool
    if not pool:
        try:
            print(f"Connecting to database: {DATABASE_URL}")
            pool = await asyncpg.create_pool(DATABASE_URL)
            print("Database connection pool created successfully")
        except Exception as e:
            print(f"!!! Database connection failed: {e}")
            raise

# --- Save Anomaly ---
async def save_anomaly(stock: str, timestamp, score):
    try:
        await connect_db()
        query = """
        INSERT INTO anomalies (stock, timestamp, score)
        VALUES ($1, $2, $3)
        """
        async with pool.acquire() as conn:
            await conn.execute(query, stock, timestamp, score)
    except Exception as e:
        print(f"!!! Error saving anomaly to database: {e}")
        # Don't re-raise to avoid crashing the stream
        pass

# --- Fetch Last 15 Anomalies ---
async def fetch_last_anomalies(stock: str):
    try:
        await connect_db()
        query = """
        SELECT timestamp, score
        FROM anomalies
        WHERE stock = $1
        ORDER BY timestamp DESC
        LIMIT 15
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, stock)
        return [{"timestamp": str(row["timestamp"]), "score": row["score"]} for row in rows]
    except Exception as e:
        print(f"!!! Error fetching anomalies from database: {e}")
        return []

# --- Truncate Anomalies for a Stock ---
async def truncate_anomalies(stock: str):
    try:
        await connect_db()
        query = "DELETE FROM anomalies WHERE stock = $1"
        async with pool.acquire() as conn:
            await conn.execute(query, stock)
    except Exception as e:
        print(f"!!! Error truncating anomalies from database: {e}")
        # Don't re-raise to avoid crashing the stream
        pass
