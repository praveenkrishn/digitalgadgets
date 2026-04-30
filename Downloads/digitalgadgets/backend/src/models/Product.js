import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Mobiles",
        "Laptops",
        "Headphones",
        "Smart Watches",
        "Accessories"
      ]
    },
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 90
    },
    specifications: {
      type: [String],
      default: []
    },
    brand: {
      type: String,
      default: "Digital Gadgets"
    },
    featured: {
      type: Boolean,
      default: false
    },
    trending: {
      type: Boolean,
      default: false
    },
    reviews: [reviewSchema]
  },
  {
    timestamps: true
  }
);

productSchema.virtual("finalPrice").get(function getFinalPrice() {
  return Number((this.price * (1 - this.discountPercent / 100)).toFixed(2));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
