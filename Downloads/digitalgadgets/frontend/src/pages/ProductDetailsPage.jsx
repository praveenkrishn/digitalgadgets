import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, getDiscountedPrice } from "../utils/format.js";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useStore();
  const { pushToast } = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const [{ data: productData }, { data: relatedData }] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/related`)
        ]);

        setProduct(productData.product);
        setSelectedImage(productData.product.image);
        setRelatedProducts(relatedData.products);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleCart = async (goToCheckout = false) => {
    if (!user) {
      pushToast("Please login to continue", "error");
      navigate("/login");
      return;
    }

    await addToCart(product._id, quantity);

    if (goToCheckout) {
      navigate("/checkout");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      pushToast("Please login to submit a review", "error");
      navigate("/login");
      return;
    }

    await api.post(`/products/${product._id}/reviews`, reviewForm);
    pushToast("Review submitted successfully");
    const { data } = await api.get(`/products/${id}`);
    setProduct(data.product);
    setReviewForm({ rating: 5, comment: "" });
  };

  if (loading || !product) {
    return <LoadingSpinner label="Loading product details..." />;
  }

  const gallery = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="glass-panel overflow-hidden">
            <img src={selectedImage} alt={product.title} className="h-[420px] w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {gallery.slice(0, 4).map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`overflow-hidden rounded-2xl border-2 ${
                  selectedImage === image ? "border-aqua" : "border-transparent"
                }`}
              >
                <img src={image} alt={product.title} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">
              {product.category}
            </p>
            <h1 className="font-display text-4xl font-bold text-ink dark:text-white">
              {product.title}
            </h1>
            <RatingStars value={product.rating || 0} reviews={product.numReviews || 0} />
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-ink dark:text-white">
              {formatCurrency(getDiscountedPrice(product))}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-300">{product.description}</p>
          <div className="rounded-[24px] bg-slate-50 p-5 dark:bg-slate-800/70">
            <h2 className="font-display text-xl font-semibold text-ink dark:text-white">
              Specifications
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {(product.specifications || []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Quantity</label>
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="field max-w-24"
            >
              {Array.from({ length: Math.min(product.stock, 8) || 1 }).map((_, index) => (
                <option key={index + 1}>{index + 1}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {product.stock} in stock
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={() => handleCart(false)} className="btn-primary">
              Add to cart
            </button>
            <button type="button" onClick={() => handleCart(true)} className="btn-secondary">
              Buy now
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">
            Ratings & Reviews
          </h2>
          <div className="mt-6 space-y-4">
            {(product.reviews || []).length ? (
              product.reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <strong>{review.name}</strong>
                    <RatingStars value={review.rating} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">No reviews yet.</p>
            )}
          </div>
        </div>

        <form onSubmit={submitReview} className="glass-panel space-y-4 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">
            Write a Review
          </h2>
          <select
            value={reviewForm.rating}
            onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
            className="field"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <textarea
            value={reviewForm.comment}
            onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder="Share your experience with this gadget"
            className="min-h-32 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-slate-700 dark:bg-slate-900"
          />
          <button type="submit" className="btn-primary w-full">
            Submit review
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="section-title">Related products</h2>
          <p className="section-copy">More gadgets from the same category that pair well with this pick.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetailsPage;
