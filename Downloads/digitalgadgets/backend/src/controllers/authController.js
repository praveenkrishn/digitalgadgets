import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const buildAuthResponse = (user) => ({
  token: generateToken(user),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    wishlistCount: user.wishlist.length,
    cartCount: user.cart.reduce((sum, item) => sum + item.quantity, 0)
  }
});

export const registerUser = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password || "";

  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    ...buildAuthResponse(user)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await user.matchPassword(password || ""))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  res.json({
    success: true,
    message: "Login successful",
    ...buildAuthResponse(user)
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "title image");

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlistCount: user.wishlist.length,
      cartCount: user.cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  });
});
