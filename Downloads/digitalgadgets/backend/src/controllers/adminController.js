import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAdminSummary = asyncHandler(async (_req, res) => {
  const [usersCount, productsCount, ordersCount, recentOrders, recentUsers, allOrders] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Order.find().select("totalPrice")
    ]);

  const revenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.json({
    success: true,
    summary: {
      usersCount,
      productsCount,
      ordersCount,
      revenue: Number(revenue.toFixed(2))
    },
    recentOrders,
    recentUsers
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    users
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  await user.save();

  res.json({
    success: true,
    message: "User updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
