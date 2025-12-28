from pydantic import BaseModel

class ItemCreate(BaseModel):
    name: str
    price: int

class ItemResponse(ItemCreate):
    id: int

    class Config:
        orm_mode = True

