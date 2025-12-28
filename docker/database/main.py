from fastapi import FastAPI
from sqlalchemy import text
from db import SessionLocal, engine, Base

app = FastAPI(title="Cloud Ninjas DB Service")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        return {"db": "up"}
    except Exception as e:
        return {"db": "down", "error": str(e)}
    finally:
        db.close()

