import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { categories } from "../utils/format.js";

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ products: [], categories: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const deferredSearch = useDeferredValue(searchText);

  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (deferredSearch) {
      params.set("search", deferredSearch);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    setSearchParams(params, { replace: true });
  }, [deferredSearch]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products", {
          params: Object.fromEntries(searchParams.entries())
        });
        setResult(data);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key === "page") {
      params.set("page", value);
    } else {
      params.set("page", "1");
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-8">
      <section className="glass-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search products"
            className="field"
          />
          <select value={category} onChange={(event) => updateParam("category", event.target.value)} className="field">
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="field">
            <option value="">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner label="Loading products..." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Products</h1>
              <p className="section-copy">
                Browse gadgets by category, search keyword, discount, and rating.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium shadow-card dark:bg-slate-900/70">
              {result.pagination?.totalProducts || 0} items found
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {result.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: result.pagination?.pages || 1 }).map((_, index) => {
              const nextPage = index + 1;
              return (
                <button
                  key={nextPage}
                  type="button"
                  onClick={() => updateParam("page", String(nextPage))}
                  className={`h-11 w-11 rounded-2xl text-sm font-semibold ${
                    page === nextPage
                      ? "bg-ink text-white dark:bg-aqua dark:text-ink"
                      : "glass-panel"
                  }`}
                >
                  {nextPage}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsPage;
