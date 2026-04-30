import express from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  verifyRazorpayPayment,
  validateCouponCode
} from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/validate-coupon", protect, validateCouponCode);
router.post("/", protect, createOrder);
router.post("/:id/verify-payment", protect, verifyRazorpayPayment);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, authorize("admin"), getAllOrders);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

export default router;
