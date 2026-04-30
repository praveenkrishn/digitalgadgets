import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, paymentMethods } from "../utils/format.js";

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, refreshCart } = useStore();
  const { pushToast } = useToast();
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    paymentMethod: "Cash on delivery"
  });

  const shipping = cart.subtotal > 5000 ? 0 : 199;
  const total = Math.max(cart.subtotal + shipping - (couponState?.discountAmount || 0), 0);

  const validateCoupon = async () => {
    try {
      const { data } = await api.post("/orders/validate-coupon", {
        code: coupon,
        subtotal: cart.subtotal
      });
      setCouponState(data.coupon);
      pushToast(data.coupon ? "Coupon applied successfully" : "Coupon cleared");
    } catch (error) {
      setCouponState(null);
      pushToast(error.response?.data?.message || "Unable to apply coupon", "error");
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        address: {
          fullName: formData.fullName,
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        couponCode: couponState?.code || coupon
      };

      const { data } = await api.post("/orders", payload);

      if (formData.paymentMethod === "Razorpay") {
        await loadRazorpayCheckout();

        await new Promise((resolve, reject) => {
          let settled = false;
          const checkout = new window.Razorpay({
            key: data.razorpay.keyId,
            amount: data.razorpay.amount,
            currency: data.razorpay.currency,
            name: "Digital Gadgets",
            description: `Order #${data.order._id.slice(-6)}`,
            order_id: data.razorpay.orderId,
            prefill: {
              name: formData.fullName || user?.name || "",
              email: user?.email || "",
              contact: formData.phone
            },
            handler: async (response) => {
              try {
                await api.post(`/orders/${data.order._id}/verify-payment`, response);
                settled = true;
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: {
              ondismiss: () => {
                if (!settled) {
                  reject(new Error("Payment was cancelled"));
                }
              }
            },
            theme: {
              color: "#0f172a"
            }
          });

          checkout.open();
        });
      }

      await refreshCart();
      pushToast("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      pushToast(error.response?.data?.message || error.message || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="section-title">Checkout</h1>
          <p className="section-copy">Fill in your delivery details and choose a payment method.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field" placeholder="Full name" value={formData.fullName} onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))} />
          <input className="field" placeholder="Phone number" value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
        </div>
        <input className="field" placeholder="Shipping address" value={formData.addressLine} onChange={(event) => setFormData((current) => ({ ...current, addressLine: event.target.value }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field" placeholder="City" value={formData.city} onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))} />
          <input className="field" placeholder="State" value={formData.state} onChange={(event) => setFormData((current) => ({ ...current, state: event.target.value }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field" placeholder="Postal code" value={formData.postalCode} onChange={(event) => setFormData((current) => ({ ...current, postalCode: event.target.value }))} />
          <input className="field" placeholder="Country" value={formData.country} onChange={(event) => setFormData((current) => ({ ...current, country: event.target.value }))} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-aqua">Payment method</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((method) => (
              <label key={method} className="glass-panel flex cursor-pointer items-center gap-3 px-4 py-3">
                <input
                  type="radio"
                  checked={formData.paymentMethod === method}
                  onChange={() => setFormData((current) => ({ ...current, paymentMethod: method }))}
                />
                <span className="text-sm font-medium">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <aside className="glass-panel h-fit space-y-5 p-6">
        <h2 className="font-display text-2xl font-bold">Order summary</h2>
        <div className="space-y-3">
          {cart.items.map(({ product, quantity }) => (
            <div key={product._id} className="flex items-center justify-between gap-4 text-sm">
              <span>
                {product.title} x {quantity}
              </span>
              <span>{formatCurrency(product.price * (1 - product.discountPercent / 100) * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input className="field" placeholder="Discount coupon" value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} />
          <button type="button" onClick={validateCoupon} className="btn-secondary">
            Apply
          </button>
        </div>
        {couponState && (
          <p className="text-sm text-emerald-600 dark:text-emerald-300">
            {couponState.code} applied: -{formatCurrency(couponState.discountAmount)}
          </p>
        )}
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Discount</span>
            <span>-{formatCurrency(couponState?.discountAmount || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <button type="submit" disabled={loading || !cart.items.length} className="btn-primary w-full">
          {loading ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </form>
  );
}

export default CheckoutPage;
