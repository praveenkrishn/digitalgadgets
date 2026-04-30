import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { pushToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };

    if (!payload.name || !payload.email || !payload.password) {
      pushToast("Name, email, and password are required", "error");
      return;
    }

    if (payload.password.length < 6) {
      pushToast("Password must be at least 6 characters", "error");
      return;
    }

    if (payload.password !== formData.confirmPassword) {
      pushToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      await register(payload);
      pushToast("Account created successfully");
      navigate("/");
    } catch (error) {
      pushToast(error.response?.data?.message || error.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-8 sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">Get started</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink dark:text-white">Register</h1>
        </div>
        <input
          className="field"
          type="text"
          placeholder="Username"
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
        />
        <input
          className="field"
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(event) =>
            setFormData((current) => ({ ...current, confirmPassword: event.target.value }))
          }
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-aqua">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
