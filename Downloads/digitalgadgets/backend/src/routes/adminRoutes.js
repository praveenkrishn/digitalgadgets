import express from "express";

import {
  getAdminSummary,
  getUsers,
  updateUser
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/summary", getAdminSummary);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);

export default router;
