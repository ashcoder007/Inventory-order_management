import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import Alert from "../components/Alert.jsx";
import Loading from "../components/Loading.jsx";
import api, { getApiError } from "../api/client.js";

const emptyForm = {
  full_name: "",
  email: "",
  phone: ""
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setCustomers(response.data);
      setError("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

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
      await api.post("/customers", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null
      });
      setForm(emptyForm);
      setSuccess("Customer added successfully");
      await loadCustomers();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customerId) {
    const confirmed = window.confirm("Delete this customer?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/customers/${customerId}`);
      setSuccess("Customer deleted successfully");
      await loadCustomers();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer contact records for orders.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadCustomers}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="split-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Add Customer</h2>
          </div>
          <label>
            Full name
            <input name="full_name" value={form.full_name} onChange={handleChange} required maxLength="160" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required maxLength="255" />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} maxLength="40" />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={16} />
            {saving ? "Saving" : "Add Customer"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Customer List</h2>
          </div>
          {loading ? (
            <Loading label="Loading customers" />
          ) : customers.length === 0 ? (
            <p className="empty-text">No customers found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || "Not provided"}</td>
                      <td>
                        <button className="icon-button danger" type="button" onClick={() => deleteCustomer(customer.id)} aria-label="Delete customer">
                          <Trash2 size={16} />
                        </button>
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
