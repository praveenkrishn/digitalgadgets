import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="glass-panel mx-auto max-w-2xl p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aqua">404</p>
      <h1 className="mt-3 font-display text-5xl font-bold">Page not found</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        The gadget you are looking for may have been moved or removed.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Return home
      </Link>
    </div>
  );
}

export default NotFoundPage;
