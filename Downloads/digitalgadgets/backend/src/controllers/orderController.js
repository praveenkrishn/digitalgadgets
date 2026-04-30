import crypto from "crypto";

import razorpay, { isRazorpayConfigured } from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { calculateDiscount } from "../utils/applyCoupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const completeOrderItems = async (order, userId) => {
  await Promise.all(
    order.products.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      })
    )
  );

  await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
};

const settlePaidOrder = async (order, userId) => {
  if (order.paymentStatus === "Paid") {
    return;
  }

  await completeOrderItems(order, userId);

  order.paymentStatus = "Paid";
  order.paidAt = new Date();
};

export const validateCouponCode = asyncHandler(async (req, res) => {
  const subtotal = Number(req.body.subtotal || 0);
  const { coupon, discountAmount } = await calculateDiscount(
    req.body.code,
    subtotal
  );

  res.json({
    success: true,
    coupon: coupon
      ? {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          discountAmount
        }
      : null
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { address, paymentMethod, couponCode } = req.body;

  if (!address || !paymentMethod) {
    const error = new Error("Shipping address and payment method are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user._id).populate(
    "cart.product",
    "title image price discountPercent stock"
  );

  const validCartItems = user.cart.filter((item) => item.product);
  if (!validCartItems.length) {
    const error = new Error("Your cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const products = validCartItems.map((item) => ({
    product: item.product._id,
    title: item.product.title,
    image: item.product.image,
    price: Number(
      (item.product.price * (1 - item.product.discountPercent / 100)).toFixed(2)
    ),
    quantity: item.quantity
  }));

  const itemsPrice = Number(
    products.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const shippingPrice = itemsPrice > 5000 ? 0 : 199;
  const { coupon, discountAmount } = await calculateDiscount(couponCode, itemsPrice);
  const totalPrice = Number(
    (itemsPrice + shippingPrice - discountAmount).toFixed(2)
  );

  if (paymentMethod === "Razorpay" && !isRazorpayConfigured) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 500;
    throw error;
  }

  const order = await Order.create({
    user: user._id,
    products,
    totalPrice,
    address,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discountAmount,
    couponCode: coupon?.code || ""
  });

  if (paymentMethod === "Razorpay") {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        appOrderId: order._id.toString(),
        userId: user._id.toString()
      }
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "Razorpay order created",
      order,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
    return;
  }

  await completeOrderItems(order, user._id);

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error("Razorpay payment details are required");
    error.statusCode = 400;
    throw error;
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 500;
    throw error;
  }

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
    razorpayOrderId: razorpay_order_id
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    order.paymentStatus = "Failed";
    await order.save();

    const error = new Error("Payment verification failed");
    error.statusCode = 400;
    throw error;
  }

  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await settlePaidOrder(order, req.user._id);
  await order.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    order
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    orders
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    const error = new Error("Not authorized to view this order");
    error.statusCode = 403;
    throw error;
  }

  res.json({
    success: true,
    order
  });
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  order.status = req.body.status || order.status;
  if (order.status === "Delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.json({
    success: true,
    message: "Order status updated successfully",
    order
  });
});
