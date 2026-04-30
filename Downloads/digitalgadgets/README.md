# Digital Gadgets

Full-stack e-commerce website built with React (Vite), Tailwind CSS, Node.js, Express, MongoDB, JWT authentication, and Multer/Cloudinary image upload support.

## Tech stack

- Frontend: React.js + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Authentication: JWT
- Images: Multer + optional Cloudinary upload

## Run locally

1. Install dependencies from the repo root:

```bash
npm install
```

2. Configure environment variables:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Seed sample data:

```bash
npm run seed
```

4. Start the app:

```bash
npm run dev
```

5. Open the app:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/health`

## Demo credentials

- Admin: `admin@digitalgadgets.com` / `Admin@123`
- User: `shopper@digitalgadgets.com` / `Shopper@123`

## Features

- Modern responsive storefront with dark mode
- Product search, category filters, sorting, pagination
- Product details, ratings, reviews, related products
- JWT auth, protected cart, wishlist, checkout, and orders
- Coupon validation and order placement
- Admin dashboard for products, users, images, and order status
