import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, getDiscountedPrice } from "../utils/format.js";
import RatingStars from "./RatingStars.jsx";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { pushToast } = useToast();

  const handleAddToCart = async () => {
    if (!user) {
      pushToast("Please login to add items to your cart", "error");
      navigate("/login");
      return;
    }

    await addToCart(product._id, 1);
  };

  const handleWishlist = async () => {
    if (!user) {
      pushToast("Please login to manage your wishlist", "error");
      navigate("/login");
      return;
    }

    await toggleWishlist(product._id);
  };

  const discountedPrice = getDiscountedPrice(product);

  return (
    <article className="group glass-panel animate-fadeUp overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.discountPercent > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white">
            {product.discountPercent}% OFF
          </span>
        )}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-4 top-4 rounded-full px-3 py-2 text-sm shadow-lg transition ${
            isWishlisted(product._id)
              ? "bg-ink text-white dark:bg-aqua dark:text-ink"
              : "bg-white/90 text-slate-700"
          }`}
        >
          {isWishlisted(product._id) ? "♥" : "♡"}
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">
            {product.category}
          </p>
          <h3 className="font-display text-xl font-semibold text-ink dark:text-white">
            {product.title}
          </h3>
          <RatingStars value={product.rating || 0} reviews={product.numReviews || 0} />
        </div>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold text-ink dark:text-white">
            {formatCurrency(discountedPrice)}
          </span>
          {product.discountPercent > 0 && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleAddToCart} className="btn-primary flex-1">
            Add to cart
          </button>
          <Link to={`/products/${product._id}`} className="btn-secondary flex-1">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
