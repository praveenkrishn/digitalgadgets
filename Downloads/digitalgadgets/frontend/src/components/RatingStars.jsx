function RatingStars({ value = 0, reviews }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>{index < Math.round(value) ? "★" : "☆"}</span>
        ))}
      </div>
      <span className="text-slate-500 dark:text-slate-300">
        {value.toFixed(1)}
        {typeof reviews === "number" ? ` (${reviews} reviews)` : ""}
      </span>
    </div>
  );
}

export default RatingStars;
