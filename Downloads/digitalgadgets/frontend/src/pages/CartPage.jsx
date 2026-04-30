import { Link, useNavigate } from "react-router-dom";

import { useStore } from "../context/StoreContext.jsx";
import { formatCurrency } from "../utils/format.js";

function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeCartItem } = useStore();

  if (!cart.items.length) {
    return (
      <div className="glass-panel p-10 text-center">
        <h1 className="font-display text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Add something exciting from the latest gadget collections.
        </p>
        <Link to="/products" className="btn-primary mt-6">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {cart.items.map(({ product, quantity, lineTotal }) => (
          <article key={product._id} className="glass-panel grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
            <img src={product.image} alt={product.title} className="h-40 w-full rounded-3xl object-cover" />
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">
                  {product.category}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{product.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Total: {formatCurrency(lineTotal)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={quantity}
                  onChange={(event) => updateCartItem(product._id, Number(event.target.value))}
                  className="field max-w-24"
                >
                  {Array.from({ length: Math.min(product.stock, 8) || 1 }).map((_, index) => (
                    <option key={index + 1}>{index + 1}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeCartItem(product._id)} className="btn-secondary">
                  Remove item
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="glass-panel h-fit space-y-4 p-6">
        <h2 className="font-display text-2xl font-bold">Cart summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span>Items</span>
          <span>{cart.count}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold dark:border-slate-700">
          <span>Grand total</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <button type="button" onClick={() => navigate("/checkout")} className="btn-primary w-full">
          Checkout
        </button>
      </aside>
    </div>
  );
}

export default CartPage;
