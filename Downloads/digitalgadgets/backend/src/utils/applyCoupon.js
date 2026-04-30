import Coupon from "../models/Coupon.js";

export const calculateDiscount = async (code, subtotal) => {
  if (!code) {
    return {
      coupon: null,
      discountAmount: 0
    };
  }

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    const error = new Error("Coupon code is invalid");
    error.statusCode = 404;
    throw error;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    const error = new Error("Coupon code has expired");
    error.statusCode = 400;
    throw error;
  }

  if (subtotal < coupon.minOrderAmount) {
    const error = new Error(
      `Coupon is available for orders above Rs. ${coupon.minOrderAmount}`
    );
    error.statusCode = 400;
    throw error;
  }

  const rawDiscount =
    coupon.discountType === "percent"
      ? subtotal * (coupon.value / 100)
      : coupon.value;

  return {
    coupon,
    discountAmount: Number(Math.min(rawDiscount, subtotal).toFixed(2))
  };
};
