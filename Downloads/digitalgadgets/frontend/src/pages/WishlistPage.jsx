import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/StoreContext.jsx";

function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Wishlist</h1>
        <p className="section-copy">Save gadgets for later and revisit them anytime.</p>
      </div>
      {wishlist.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center">
          <p className="text-slate-600 dark:text-slate-300">Your wishlist is empty right now.</p>
          <Link to="/products" className="btn-primary mt-6">
            Explore products
          </Link>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
