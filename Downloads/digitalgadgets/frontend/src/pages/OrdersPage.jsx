import { useEffect, useState } from "react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { formatCurrency } from "../utils/format.js";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.orders);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your orders..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Order history</h1>
        <p className="section-copy">Track recent purchases and delivery status updates.</p>
      </div>
      <div className="space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <article key={order._id} className="glass-panel space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Order #{order._id.slice(-6)}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-aqua dark:text-ink">
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Payment: {order.paymentStatus || "Pending"}
              </p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {order.products.map((item) => (
                  <div key={item.product} className="flex items-center justify-between gap-4">
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 font-semibold dark:border-slate-700">
                <span>{order.paymentMethod}</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </article>
          ))
        ) : (
          <div className="glass-panel p-10 text-center text-slate-600 dark:text-slate-300">
            You have not placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
