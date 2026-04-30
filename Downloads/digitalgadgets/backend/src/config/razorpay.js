import Razorpay from "razorpay";

const hasRazorpayConfig =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

const razorpay = hasRazorpayConfig
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

export const isRazorpayConfigured = Boolean(hasRazorpayConfig);
export default razorpay;
