export const categories = [
  "All",
  "Mobiles",
  "Laptops",
  "Headphones",
  "Smart Watches",
  "Accessories"
];

export const paymentMethods = ["Cash on delivery", "Razorpay"];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

export const getDiscountedPrice = (product) =>
  Number((product.price * (1 - (product.discountPercent || 0) / 100)).toFixed(2));
