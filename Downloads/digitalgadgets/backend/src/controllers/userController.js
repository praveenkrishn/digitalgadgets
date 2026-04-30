import Product from "../models/Product.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateUserCart = async (userId) =>
  User.findById(userId)
    .populate("cart.product", "title image price discountPercent stock category rating")
    .populate("wishlist", "title image price discountPercent rating category");

const formatCartResponse = (user) => {
  const items = user.cart
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: Number(
        (
          item.quantity *
          item.product.price *
          (1 - item.product.discountPercent / 100)
        ).toFixed(2)
      )
    }));

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );

  return {
    items,
    subtotal,
    count: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

export const getCart = asyncHandler(async (req, res) => {
  const user = await populateUserCart(req.user._id);

  res.json({
    success: true,
    cart: formatCartResponse(user)
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.stock < 1) {
    const error = new Error("This product is currently out of stock");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + Number(quantity), product.stock);
  } else {
    user.cart.push({
      product: productId,
      quantity: Math.min(Number(quantity), product.stock || 1)
    });
  }

  await user.save();

  const updatedUser = await populateUserCart(req.user._id);
  res.status(201).json({
    success: true,
    message: "Product added to cart",
    cart: formatCartResponse(updatedUser)
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const user = await User.findById(req.user._id);
  const cartItem = user.cart.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!cartItem) {
    const error = new Error("Cart item not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(req.params.productId);
  cartItem.quantity = Math.max(1, Math.min(Number(quantity), product?.stock || Number(quantity)));
  await user.save();

  const updatedUser = await populateUserCart(req.user._id);
  res.json({
    success: true,
    message: "Cart updated successfully",
    cart: formatCartResponse(updatedUser)
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(
    (item) => item.product.toString() !== req.params.productId
  );
  await user.save();

  const updatedUser = await populateUserCart(req.user._id);
  res.json({
    success: true,
    message: "Item removed from cart",
    cart: formatCartResponse(updatedUser)
  });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await populateUserCart(req.user._id);

  res.json({
    success: true,
    wishlist: user.wishlist
  });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const product = await Product.findById(req.params.productId);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const isWishlisted = user.wishlist.some(
    (item) => item.toString() === req.params.productId
  );

  if (isWishlisted) {
    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== req.params.productId
    );
  } else {
    user.wishlist.push(req.params.productId);
  }

  await user.save();

  const updatedUser = await populateUserCart(req.user._id);
  res.json({
    success: true,
    message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
    wishlist: updatedUser.wishlist
  });
});
