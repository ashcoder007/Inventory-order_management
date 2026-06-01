import { useEffect, useMemo, useState } from "react";
import { Eye, Plus, RefreshCw, Trash2 } from "lucide-react";
import Alert from "../components/Alert.jsx";
import Loading from "../components/Loading.jsx";
import api, { getApiError } from "../api/client.js";

const emptyForm = {
  customer_id: "",
  product_id: "",
  quantity: ""
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [orderRes, productRes, customerRes] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
        api.get("/customers")
      ]);
      setOrders(orderRes.data);
      setProducts(productRes.data);
      setCustomers(customerRes.data);
      setError("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const estimatedTotal = useMemo(() => {
    if (!selectedProduct || !form.quantity) {
      return 0;
    }
    return Number(selectedProduct.price) * Number(form.quantity);
  }, [selectedProduct, form.quantity]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => Object.assign({}, current, { [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/orders", {
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity)
      });
      setForm(emptyForm);
      setSuccess("Order created successfully");
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder(orderId) {
    const confirmed = window.confirm("Delete this order?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      setSelectedOrder(null);
      setSuccess("Order deleted successfully");
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Create orders, verify totals, and view order details.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="split-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Create Order</h2>
          </div>
          <label>
            Customer
            <select name="customer_id" value={form.customer_id} onChange={handleChange} required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product
            <select name="product_id" value={form.product_id} onChange={handleChange} required>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.quantity} in stock)
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={handleChange} required />
          </label>
          <div className="estimate">
            <span>Estimated total</span>
            <strong>₹{estimatedTotal.toFixed(2)}</strong>
          </div>
          <button className="primary-button" type="submit" disabled={saving || products.length === 0 || customers.length === 0}>
            <Plus size={16} />
            {saving ? "Saving" : "Create Order"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Order List</h2>
          </div>
          {loading ? (
            <Loading label="Loading orders" />
          ) : orders.length === 0 ? (
            <p className="empty-text">No orders found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer.full_name}</td>
                      <td>{order.product.name}</td>
                      <td>{order.quantity}</td>
                      <td>₹{Number(order.total_amount).toFixed(2)}</td>
                      <td>
                        <div className="action-row">
                          <button className="icon-button" type="button" onClick={() => setSelectedOrder(order)} aria-label="View order">
                            <Eye size={16} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deleteOrder(order.id)} aria-label="Delete order">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedOrder(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="icon-button" type="button" onClick={() => setSelectedOrder(null)} aria-label="Close order details">
                ×
              </button>
            </div>
            <dl className="detail-list">
              <div>
                <dt>Customer</dt>
                <dd>{selectedOrder.customer.full_name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selectedOrder.customer.email}</dd>
              </div>
              <div>
                <dt>Product</dt>
                <dd>{selectedOrder.product.name}</dd>
              </div>
              <div>
                <dt>SKU</dt>
                <dd>{selectedOrder.product.sku}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{selectedOrder.quantity}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>₹{Number(selectedOrder.total_amount).toFixed(2)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(selectedOrder.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
