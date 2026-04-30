import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { categories } from "../utils/format.js";

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, wishlist } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");

  const navigateToProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    navigate(query ? `/products?${query}` : "/products");
  };

  const onSearch = (event) => {
    event.preventDefault();
    navigateToProducts(search ? { search } : {});
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-night/80">
        <div className="container-shell flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="font-display text-2xl font-bold text-ink dark:text-white">
                Digital <span className="text-aqua">Gadgets</span>
              </NavLink>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
            <form onSubmit={onSearch} className="flex flex-1 items-center gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search mobiles, laptops, headphones..."
                className="field flex-1"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <NavLink to="/wishlist" className="btn-secondary">
                Wishlist ({wishlist.length})
              </NavLink>
              <NavLink to="/cart" className="btn-secondary">
                Cart ({cart.count})
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/orders" className="btn-secondary">
                    Orders
                  </NavLink>
                  {user.role === "admin" && (
                    <NavLink to="/admin" className="btn-secondary">
                      Admin
                    </NavLink>
                  )}
                  <button type="button" onClick={logout} className="btn-primary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn-secondary">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="btn-primary">
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <nav className="flex flex-wrap gap-3 overflow-x-auto pb-1">
            {categories.slice(1).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => navigateToProducts({ category })}
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="container-shell py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/20 bg-ink text-white dark:border-white/10 dark:bg-slate-950">
        <div className="container-shell grid gap-6 py-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-semibold">Digital Gadgets</h3>
            <p className="mt-3 text-sm text-slate-300">
              Premium devices, fast delivery, trusted support, and curated offers for every
              digital lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Categories</h4>
            <p className="mt-3 text-sm text-slate-300">
              Mobiles, Laptops, Headphones, Smart Watches, Accessories
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Contact</h4>
            <p className="mt-3 text-sm text-slate-300">support@digitalgadgets.com</p>
            <p className="text-sm text-slate-300">+91 90000 12345</p>
            <p className="text-sm text-slate-300">Open daily, 9:00 AM to 9:00 PM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
