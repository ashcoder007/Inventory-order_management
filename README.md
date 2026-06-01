# Inventory & Order Management System

A complete full-stack inventory and order management system built with FastAPI, React, PostgreSQL, SQLAlchemy, Docker, and Docker Compose.

## Project Structure

```text
SE_assessment/
  backend/
    app/
      core/
        config.py
      database/
        base.py
        session.py
      models/
        customer.py
        order.py
        product.py
      routes/
        customers.py
        orders.py
        products.py
      schemas/
        customer.py
        order.py
        product.py
      services/
        customer_service.py
        order_service.py
        product_service.py
      utils/
        exceptions.py
      main.py
    Dockerfile
    requirements.txt
    .env.example
  frontend/
    src/
      api/
        client.js
      components/
        Alert.jsx
        Layout.jsx
        Loading.jsx
        StatCard.jsx
      pages/
        CustomersPage.jsx
        DashboardPage.jsx
        OrdersPage.jsx
        ProductsPage.jsx
      App.jsx
      main.jsx
      styles.css
    Dockerfile
    index.html
    nginx.conf
    package.json
    .env.example
  docker-compose.yml
  .env.example
  .gitignore
  README.md
```

## Features

- Product CRUD with unique SKU validation and non-negative quantity validation
- Customer create, list, detail, and delete with unique email validation
- Order create, list, detail, and delete
- Automatic stock reduction when an order is created
- Automatic total amount calculation from product price and order quantity
- Insufficient stock protection
- Responsive React dashboard with low stock visibility
- Dockerized frontend, backend, and PostgreSQL services

## Live Deployment

- Frontend: `https://inventory-order-management-cyan.vercel.app`
- Backend API: `https://inventory-backend-ff3f.onrender.com`
- API health check: `https://inventory-backend-ff3f.onrender.com/health`
- API docs: `https://inventory-backend-ff3f.onrender.com/docs`

The deployed frontend is configured to call the Render backend through:

```env
VITE_API_URL=https://inventory-backend-ff3f.onrender.com
```

The deployed backend must allow the Vercel frontend origin:

```env
FRONTEND_ORIGIN=https://inventory-order-management-cyan.vercel.app
```

## Run With Docker Compose

1. Create the environment file:

```bash
cp .env.example .env
```

2. Update `POSTGRES_PASSWORD` in `.env`.

3. Start the stack:

```bash
docker compose up --build
```

4. Open the app:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Run Locally Without Docker

Start PostgreSQL and create a database named `inventory_db`.

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Environment Variables

Root `.env` for Docker Compose:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=inventory_db
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:8000
DEBUG=false
```

Backend `.env` for local development:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/inventory_db
FRONTEND_ORIGIN=http://localhost:5173
DEBUG=false
```

Frontend `.env` for local development:

```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints

Products:

- `POST /products`
- `GET /products`
- `GET /products/{product_id}`
- `PUT /products/{product_id}`
- `DELETE /products/{product_id}`

Customers:

- `POST /customers`
- `GET /customers`
- `GET /customers/{customer_id}`
- `DELETE /customers/{customer_id}`

Orders:

- `POST /orders`
- `GET /orders`
- `GET /orders/{order_id}`
- `DELETE /orders/{order_id}`

Health:

- `GET /health`

## Sample API Requests

Create a product:

```bash
curl -X POST http://localhost:8000/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Laptop\",\"sku\":\"LAP-001\",\"price\":999.99,\"quantity\":20}"
```

Create a customer:

```bash
curl -X POST http://localhost:8000/customers ^
  -H "Content-Type: application/json" ^
  -d "{\"full_name\":\"Avery Stone\",\"email\":\"avery@example.com\",\"phone\":\"555-0101\"}"
```

Create an order:

```bash
curl -X POST http://localhost:8000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customer_id\":1,\"product_id\":1,\"quantity\":2}"
```

List orders:

```bash
curl http://localhost:8000/orders
```

## Deployment Notes

Recommended deployment order:

1. Create the hosted PostgreSQL database.
2. Deploy the backend on Render.
3. Test the backend health endpoint.
4. Deploy the frontend on Vercel.
5. Confirm the frontend URL is configured in backend CORS.

Backend on Render:

- Set `DATABASE_URL` to the external PostgreSQL URL.
- Set `FRONTEND_ORIGIN` to `https://inventory-order-management-cyan.vercel.app`.
- Set `DEBUG=false`.
- If deploying with the included Dockerfile, set Render's port/env to `PORT=8000` because the Dockerfile binds Gunicorn to port `8000`.
- Use this start command: `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
- Set the root directory to `backend` when the platform supports monorepo configuration.

Frontend on Vercel:

- Set the root directory to `frontend`.
- Set `VITE_API_URL` to `https://inventory-backend-ff3f.onrender.com`.
- Build command: `npm run build`
- Output directory: `dist`
- Redeploy the frontend after changing `VITE_API_URL` because Vite reads this value during build time.

Database on Neon PostgreSQL:

- Create a Neon project and database.
- Copy the pooled or direct PostgreSQL connection string.
- Use that value as `DATABASE_URL` for the backend.

## Database Access

You can view and query the PostgreSQL tables from whichever database provider is used for `DATABASE_URL`.

If using Render PostgreSQL:

1. Open the Render dashboard.
2. Go to the PostgreSQL database service.
3. Use the provider's connection details or internal/external database URL.
4. Connect with a PostgreSQL client such as DBeaver, pgAdmin, TablePlus, or `psql`.

If using Neon PostgreSQL:

1. Open the Neon dashboard.
2. Select the project and database.
3. Open the SQL Editor.
4. Run SQL queries directly in the browser.

Useful SQL queries:

```sql
SELECT * FROM products;
SELECT * FROM customers;
SELECT * FROM orders;
```

To inspect tables from a terminal with `psql`:

```bash
psql "your_database_connection_string"
```

Then run:

```sql
\dt
SELECT * FROM products;
SELECT * FROM customers;
SELECT * FROM orders;
```

Do not commit the real database connection string to git. Keep it only in Render environment variables or your local `.env` file.

## Notes

The backend creates database tables automatically on startup. This keeps the project beginner-friendly and easy to run. For larger production systems, use Alembic migrations before deploying schema changes.
