import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      pushToast("Welcome back");
      navigate(location.state?.from?.pathname || "/");
    } catch (error) {
      pushToast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-8 sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">Account access</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink dark:text-white">Login</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Sign in to manage orders, wishlist, and checkout faster.
          </p>
        </div>
        <input
          className="field"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
        />
        <div className="space-y-3">
          <input
            className="field"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, rememberMe: event.target.checked }))
                }
              />
              Remember me
            </label>
            <button type="button" onClick={() => setShowPassword((current) => !current)}>
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => pushToast("Please contact support@digitalgadgets.com to reset your password")}
            className="text-sm font-medium text-aqua"
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          New here?{" "}
          <Link to="/register" className="font-semibold text-aqua">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
