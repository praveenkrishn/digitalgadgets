import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildProductFilters = ({ category, search }) => {
  const filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } }
    ];
  }

  return filter;
};

const getSortOrder = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "rating":
      return { rating: -1, numReviews: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 9);
  const filter = buildProductFilters(req.query);

  const [products, totalProducts, categories] = await Promise.all([
    Product.find(filter)
      .sort(getSortOrder(req.query.sort))
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
    Product.distinct("category")
  ]);

  res.json({
    success: true,
    products,
    categories,
    pagination: {
      page,
      pages: Math.ceil(totalProducts / limit),
      totalProducts
    }
  });
});

export const getHomeCollections = asyncHandler(async (_req, res) => {
  const [featured, trending, discountDeals] = await Promise.all([
    Product.find({ featured: true }).sort({ createdAt: -1 }).limit(4),
    Product.find({ trending: true }).sort({ rating: -1 }).limit(4),
    Product.find({ discountPercent: { $gt: 0 } })
      .sort({ discountPercent: -1 })
      .limit(4)
  ]);

  res.json({
    success: true,
    featured,
    trending,
    discountDeals
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    product
  });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const currentProduct = await Product.findById(req.params.id);

  if (!currentProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const products = await Product.find({
    _id: { $ne: currentProduct._id },
    category: currentProduct.category
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(4);

  res.json({
    success: true,
    products
  });
});

export const createProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const rating = Number(req.body.rating);
  const comment = req.body.comment?.trim();

  if (!rating || !comment) {
    const error = new Error("Rating and comment are required");
    error.statusCode = 400;
    throw error;
  }

  const existingReview = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.name = req.user.name;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment
    });
  }

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review submitted successfully"
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(product, req.body);
  await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    product
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted successfully"
  });
});
