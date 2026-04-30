function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-aqua/20 border-t-aqua" />
      <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
