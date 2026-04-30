import dotenv from "dotenv";

import { connectDatabase } from "../config/db.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@digitalgadgets.com",
    password: "Admin@123",
    role: "admin"
  },
  {
    name: "Demo Shopper",
    email: "shopper@digitalgadgets.com",
    password: "Shopper@123",
    role: "user"
  }
];

const products = [
  {
    title: "Nebula X Pro 5G",
    price: 69999,
    description:
      "Flagship Android phone with AI camera tools, high-refresh AMOLED display, and all-day battery backup.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Mobiles",
    rating: 4.8,
    numReviews: 18,
    stock: 25,
    discountPercent: 12,
    specifications: [
      "6.7-inch AMOLED 120Hz display",
      "50MP triple rear camera",
      "512GB storage and 12GB RAM",
      "5000mAh battery with 80W fast charging"
    ],
    brand: "Nebula",
    featured: true,
    trending: true
  },
  {
    title: "VoltBook Air 14",
    price: 84999,
    description:
      "Thin-and-light productivity laptop with a vivid 2.8K display and powerful all-day performance.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Laptops",
    rating: 4.7,
    numReviews: 24,
    stock: 14,
    discountPercent: 15,
    specifications: [
      "14-inch 2.8K IPS display",
      "Intel Core Ultra processor",
      "16GB RAM with 1TB SSD",
      "15-hour battery life"
    ],
    brand: "VoltBook",
    featured: true,
    trending: true
  },
  {
    title: "PulseBeat Max",
    price: 12999,
    description:
      "Wireless noise-cancelling headphones with deep bass tuning and ultra-comfort ear cushions.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Headphones",
    rating: 4.5,
    numReviews: 31,
    stock: 40,
    discountPercent: 18,
    specifications: [
      "Active noise cancellation",
      "40-hour playback",
      "Bluetooth 5.4 low-latency mode",
      "Fast charge: 10 mins for 5 hours"
    ],
    brand: "PulseBeat",
    featured: true,
    trending: false
  },
  {
    title: "AeroFit Watch 3",
    price: 18999,
    description:
      "Premium smartwatch with AMOLED dial, GPS workouts, and advanced sleep tracking.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Smart Watches",
    rating: 4.6,
    numReviews: 22,
    stock: 32,
    discountPercent: 10,
    specifications: [
      "1.9-inch AMOLED display",
      "Built-in GPS and heart rate tracking",
      "7-day battery life",
      "IP68 water resistance"
    ],
    brand: "AeroFit",
    featured: false,
    trending: true
  },
  {
    title: "HyperCharge Dock 7-in-1",
    price: 4999,
    description:
      "Compact charging hub with USB-C power delivery, HDMI, and multi-device desktop docking.",
    image:
      "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Accessories",
    rating: 4.3,
    numReviews: 12,
    stock: 60,
    discountPercent: 20,
    specifications: [
      "100W USB-C charging",
      "4K HDMI output",
      "SD card and ethernet support",
      "Aluminum travel-friendly design"
    ],
    brand: "HyperCharge",
    featured: false,
    trending: true
  },
  {
    title: "Photon Pad Mini",
    price: 32999,
    description:
      "Portable entertainment tablet built for reading, streaming, video calls, and note-taking.",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80"
    ],
    category: "Accessories",
    rating: 4.4,
    numReviews: 16,
    stock: 28,
    discountPercent: 8,
    specifications: [
      "11-inch display",
      "256GB storage",
      "Stylus support",
      "Quad speaker setup"
    ],
    brand: "Photon",
    featured: true,
    trending: false
  }
];

const coupons = [
  {
    code: "GADGET10",
    discountType: "percent",
    value: 10,
    minOrderAmount: 5000
  },
  {
    code: "SAVE1500",
    discountType: "fixed",
    value: 1500,
    minOrderAmount: 25000
  }
];

const seedData = async () => {
  await connectDatabase();

  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany()
  ]);

  await User.create(users);
  await Product.create(products);
  await Coupon.create(coupons);

  console.log("Digital Gadgets seed data inserted successfully");
  process.exit(0);
};

seedData().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
