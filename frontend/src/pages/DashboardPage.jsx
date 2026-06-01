import { useEffect, useMemo, useState } from "react";
import Alert from "../components/Alert.jsx";
import Loading from "../components/Loading.jsx";
import StatCard from "../components/StatCard.jsx";
import api, { getApiError } from "../api/client.js";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [productRes, customerRes, orderRes] = await Promise.all([
          api.get("/products"),
          api.get("/customers"),
          api.get("/orders")
        ]);
        setProducts(productRes.data);
        setCustomers(customerRes.data);
        setOrders(orderRes.data);
        setError("");
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const lowStockProducts = useMemo(() => products.filter((product) => product.quantity <= 5), [products]);
  const inventoryValue = useMemo(
    () => products.reduce((total, product) => total + Number(product.price) * product.quantity, 0),
    [products]
  );

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Track inventory health, customers, and order activity.</p>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />

      {loading ? (
        <Loading label="Loading dashboard" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total Products" value={products.length} />
            <StatCard label="Total Customers" value={customers.length} tone="warm" />
            <StatCard label="Total Orders" value={orders.length} tone="blue" />
            <StatCard label="Low Stock" value={lowStockProducts.length} tone="danger" />
          </div>

          <div className="content-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Low Stock Products</h2>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="empty-text">No low stock products.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Inventory Value</h2>
              </div>
              <div className="big-number">₹{inventoryValue.toFixed(2)}</div>
              <p className="empty-text">Calculated from product price and current stock.</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
