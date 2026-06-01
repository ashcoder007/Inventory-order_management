import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Alert from "../components/Alert.jsx";
import Loading from "../components/Loading.jsx";
import api, { getApiError } from "../api/client.js";

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  quantity: ""
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => Object.assign({}, current, { [name]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: String(product.quantity)
    });
    setSuccess("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      sku: form.sku,
      price: Number(form.price),
      quantity: Number(form.quantity)
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setSuccess("Product updated successfully");
      } else {
        await api.post("/products", payload);
        setSuccess("Product added successfully");
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setSuccess("Product deleted successfully");
      await loadProducts();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Add products, adjust stock, and maintain SKU records.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadProducts}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="split-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
            {editingId && (
              <button className="icon-button" type="button" onClick={resetForm} aria-label="Cancel editing">
                <X size={18} />
              </button>
            )}
          </div>

          <label>
            Product name
            <input name="name" value={form.name} onChange={handleChange} required maxLength="120" />
          </label>
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} required maxLength="80" />
          </label>
          <label>
            Price
            <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} required />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={16} />
            {saving ? "Saving" : editingId ? "Update Product" : "Add Product"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Product List</h2>
          </div>
          {loading ? (
            <Loading label="Loading products" />
          ) : products.length === 0 ? (
            <p className="empty-text">No products found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>₹{Number(product.price).toFixed(2)}</td>
                      <td>
                        <span className={product.quantity <= 5 ? "status danger" : "status ok"}>{product.quantity}</span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button className="icon-button" type="button" onClick={() => startEdit(product)} aria-label="Edit product">
                            <Pencil size={16} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deleteProduct(product.id)} aria-label="Delete product">
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
    </section>
  );
}
