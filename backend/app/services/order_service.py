from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.utils.exceptions import bad_request, not_found


def list_orders(db: Session) -> list[Order]:
    query = (
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.product))
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(db.scalars(query).all())


def get_order(db: Session, order_id: int) -> Order:
    query = (
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.product))
        .where(Order.id == order_id)
    )
    order = db.scalar(query)
    if order is None:
        raise not_found("Order")
    return order


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise not_found("Customer")

    product = db.get(Product, payload.product_id)
    if product is None:
        raise not_found("Product")

    if product.quantity < payload.quantity:
        raise bad_request("Insufficient stock for this product")

    order = Order(
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        total_amount=product.price * payload.quantity,
    )
    product.quantity -= payload.quantity
    db.add(order)
    db.commit()
    db.refresh(order)
    return get_order(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    order = get_order(db, order_id)
    db.delete(order)
    db.commit()
