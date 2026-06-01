from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer import CustomerRead
from app.schemas.product import ProductRead


class OrderCreate(BaseModel):
    customer_id: int = Field(gt=0)
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderRead(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDetail(OrderRead):
    customer: CustomerRead
    product: ProductRead
