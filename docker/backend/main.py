from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Item
from schemas import ItemCreate, ItemResponse
import redis, os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cloud Ninjas API")

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
cache = redis.Redis(host=REDIS_HOST, port=6379, decode_responses=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/items", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    obj = Item(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    cache.delete("items")
    return obj

@app.get("/items")
def list_items(db: Session = Depends(get_db)):
    cached = cache.get("items")
    if cached:
        return eval(cached)

    items = db.query(Item).all()
    data = [{"id": i.id, "name": i.name, "price": i.price} for i in items]
    cache.set("items", str(data), ex=60)
    return data

