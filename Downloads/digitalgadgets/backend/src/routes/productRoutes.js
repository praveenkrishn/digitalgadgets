import express from "express";

import {
  createProduct,
  createProductReview,
  deleteProduct,
  getHomeCollections,
  getProductById,
  getProducts,
  getRelatedProducts,
  updateProduct
} from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/home/collections", getHomeCollections);
router.get("/:id/related", getRelatedProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, createProductReview);
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
