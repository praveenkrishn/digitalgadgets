import { useEffect, useState } from "react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { categories, formatCurrency } from "../utils/format.js";

const emptyForm = {
  title: "",
  price: "",
  description: "",
  image: "",
  category: "Mobiles",
  rating: 4.5,
  stock: 1,
  brand: "",
  discountPercent: 0,
  featured: false,
  trending: false,
  specifications: ""
};

function AdminDashboardPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [{ data: summaryData }, { data: productData }, { data: orderData }, { data: userData }] =
        await Promise.all([
          api.get("/admin/summary"),
          api.get("/products", { params: { limit: 50 } }),
          api.get("/orders"),
          api.get("/admin/users")
        ]);

      setSummary(summaryData);
      setProducts(productData.products);
      setOrders(orderData.orders);
      setUsers(userData.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setImageFile(null);
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    try {
      let image = form.image;

      if (imageFile) {
        const payload = new FormData();
        payload.append("image", imageFile);
        const { data } = await api.post("/uploads/product-image", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        image = data.image;
      }

      const productPayload = {
        ...form,
        image,
        images: image ? [image] : [],
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating),
        discountPercent: Number(form.discountPercent),
        specifications: form.specifications
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, productPayload);
        pushToast("Product updated successfully");
      } else {
        await api.post("/products", productPayload);
        pushToast("Product added successfully");
      }

      resetForm();
      await loadDashboard();
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to save product", "error");
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      discountPercent: product.discountPercent || 0,
      featured: Boolean(product.featured),
      trending: Boolean(product.trending),
      specifications: (product.specifications || []).join("\n")
    });
  };

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      pushToast("Product deleted");
      await loadDashboard();
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to delete product", "error");
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const currentUser = users.find((item) => item._id === userId);
      await api.put(`/admin/users/${userId}`, {
        name: currentUser.name,
        email: currentUser.email,
        role
      });
      pushToast("User updated");
      await loadDashboard();
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to update user", "error");
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      pushToast("Order status updated");
      await loadDashboard();
    } catch (error) {
      pushToast(error.response?.data?.message || "Unable to update order", "error");
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-copy">Manage products, users, orders, and storefront highlights.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Users", summary?.summary?.usersCount || 0],
          ["Products", summary?.summary?.productsCount || 0],
          ["Orders", summary?.summary?.ordersCount || 0],
          ["Revenue", formatCurrency(summary?.summary?.revenue || 0)]
        ].map(([label, value]) => (
          <div key={label} className="glass-panel p-5">
            <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
            <h2 className="mt-3 font-display text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleProductSubmit} className="glass-panel space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">
              {editingId ? "Edit product" : "Add product"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
          <input className="field" placeholder="Product title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="field" placeholder="Price" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
            <input className="field" placeholder="Stock" type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select className="field" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {categories.slice(1).map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <input className="field" placeholder="Brand" value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="field" placeholder="Discount %" type="number" value={form.discountPercent} onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))} />
            <input className="field" placeholder="Rating" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} />
          </div>
          <input className="field" placeholder="Image URL (optional if uploading file)" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
          <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="field py-3" />
          <textarea className="min-h-28 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-slate-700 dark:bg-slate-900" placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <textarea className="min-h-28 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-slate-700 dark:bg-slate-900" placeholder="Specifications (one per line)" value={form.specifications} onChange={(event) => setForm((current) => ({ ...current, specifications: event.target.value }))} />
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.trending} onChange={(event) => setForm((current) => ({ ...current, trending: event.target.checked }))} />
              Trending
            </label>
          </div>
          <button type="submit" className="btn-primary w-full">
            {editingId ? "Update product" : "Add product"}
          </button>
        </form>

        <div className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-2xl font-bold">Product inventory</h2>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.title} className="h-16 w-16 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {product.category} • {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => editProduct(product)} className="btn-secondary">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteProduct(product._id)} className="btn-primary">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-2xl font-bold">Manage users</h2>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{user.email}</p>
                </div>
                <select
                  value={user.role}
                  onChange={(event) => updateUserRole(user._id, event.target.value)}
                  className="field max-w-36"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-2xl font-bold">Orders</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {order.user?.name || "Customer"} • {formatCurrency(order.totalPrice)}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {order.paymentMethod} • Payment: {order.paymentStatus || "Pending"} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order._id, event.target.value)}
                    className="field max-w-40"
                  >
                    {["Pending", "Shipped", "Delivered"].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
