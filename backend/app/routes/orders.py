from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderDetail
from app.services import order_service


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderDetail, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderDetail:
    return order_service.create_order(db, payload)


@router.get("", response_model=list[OrderDetail])
def list_orders(db: Session = Depends(get_db)) -> list[OrderDetail]:
    return order_service.list_orders(db)


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderDetail:
    return order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> Response:
    order_service.delete_order(db, order_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
