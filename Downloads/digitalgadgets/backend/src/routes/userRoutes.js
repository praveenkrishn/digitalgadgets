import express from "express";

import {
  addToCart,
  getCart,
  getWishlist,
  removeCartItem,
  toggleWishlist,
  updateCartItem
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:productId", updateCartItem);
router.delete("/cart/:productId", removeCartItem);
router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", toggleWishlist);

export default router;
