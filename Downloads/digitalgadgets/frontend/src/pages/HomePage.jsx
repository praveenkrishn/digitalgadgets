import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { categories } from "../utils/format.js";

function ProductSection({ title, copy, products }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-copy">{copy}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const { data } = await api.get("/products/home/collections");
        setCollections(data);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading hero collections..." />;
  }

  return (
    <div className="space-y-12">
      <section className="glass-panel relative overflow-hidden p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-slate-900 to-aqua opacity-95" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-ember/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-aqua/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="max-w-2xl space-y-6 text-white">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em]">
              Smart Deals • New Launches
            </span>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl">
              Upgrade your setup with the best digital gadgets of the season.
            </h1>
            <p className="max-w-xl text-lg text-slate-200">
              Explore premium phones, laptops, headphones, smart watches, and accessories with
              launch offers, express shipping, and curated bundles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary bg-white text-ink hover:bg-slate-200">
                Shop now
              </Link>
              <Link to="/products?sort=rating" className="btn-secondary border-white/20 bg-white/10 text-white">
                Top rated picks
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white/10 p-6 text-white backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Offer</p>
              <h3 className="mt-3 font-display text-3xl font-bold">Up to 20% off</h3>
              <p className="mt-3 text-sm text-slate-200">Limited-time discounts on accessories and audio.</p>
            </div>
            <div className="rounded-[28px] bg-white/10 p-6 text-white backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Support</p>
              <h3 className="mt-3 font-display text-3xl font-bold">Secure checkout</h3>
              <p className="mt-3 text-sm text-slate-200">Card, UPI, and cash on delivery options available.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {categories.slice(1).map((category) => (
          <Link
            key={category}
            to={`/products?category=${encodeURIComponent(category)}`}
            className="glass-panel group flex min-h-32 items-end overflow-hidden p-5 transition hover:-translate-y-1"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-aqua">Category</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-ink group-hover:text-aqua dark:text-white">
                {category}
              </h3>
            </div>
          </Link>
        ))}
      </section>

      <ProductSection
        title="Featured Products"
        copy="Staff-selected flagship devices with premium specs and impressive value."
        products={collections?.featured || []}
      />

      <ProductSection
        title="Trending Gadgets"
        copy="The most loved gadgets shoppers are adding to cart right now."
        products={collections?.trending || []}
      />

      <ProductSection
        title="Discount Spotlight"
        copy="Grab deal-driven gadgets before the current offer window closes."
        products={collections?.discountDeals || []}
      />
    </div>
  );
}

export default HomePage;
