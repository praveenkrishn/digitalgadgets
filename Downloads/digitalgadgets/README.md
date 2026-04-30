# Digital Gadgets

Digital Gadgets is a full-stack e-commerce web application for browsing electronics, managing carts and wishlists, placing orders, and administering products through a protected dashboard.

## Overview

This project is built as a monorepo with separate `frontend` and `backend` apps:

- `frontend`: React + Vite + Tailwind CSS
- `backend`: Node.js + Express + MongoDB

The app includes authentication, product browsing, order management, image upload support, and admin controls for store management.

## Features

- User registration and login with JWT authentication
- Product catalog with categories, search, sorting, and filtering
- Product details, ratings, and review support
- Shopping cart and wishlist flows
- Checkout and order placement
- Orders page for users
- Admin dashboard for managing products, users, uploads, and order status
- Multer + Cloudinary-ready image upload support
- Razorpay configuration support in the backend
- Responsive frontend built with Tailwind CSS

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs
- express-validator
- Multer
- Cloudinary
- Razorpay

## Project Structure

```text
digitalgadgets/
|- backend/
|  |- src/
|  |- .env.example
|  \- package.json
|- frontend/
|  |- src/
|  |- .env.example
|  \- package.json
|- package.json
\- README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/praveenkrishn/digitalgadgets.git
cd digitalgadgets
```

### 2. Install dependencies

Install all workspace dependencies from the root:

```bash
npm install
```

If needed, you can also use:

```bash
npm run install:all
```

### 3. Set up environment variables

Create environment files from the examples:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

#### Backend environment variables

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
MONGODB_URI_DIRECT=
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

#### Frontend environment variables

```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Seed sample data

To populate the database with sample records:

```bash
npm run seed
```

### 5. Start the development servers

Run both frontend and backend together from the root:

```bash
npm run dev
```

### 6. Open the app

- Frontend: `http://localhost:3000`
- Backend health/API base: `http://localhost:8000/api`

## Available Scripts

From the project root:

- `npm run dev` - starts backend and frontend together
- `npm run seed` - seeds the database from the backend workspace
- `npm run build` - builds the frontend for production
- `npm run start` - starts the backend in production mode

## Demo Credentials

Use these accounts after seeding the database:

- Admin: `admin@digitalgadgets.com` / `Admin@123`
- User: `shopper@digitalgadgets.com` / `Shopper@123`

## Deployment Notes

### Frontend

The frontend can be deployed to Vercel. Set:

- Build command: `npm run build`
- Output directory: `frontend/dist`

You will also need to set:

```env
VITE_API_URL=your_deployed_backend_api_url
```

### Backend

The backend can be deployed to platforms such as Render, Railway, or another Node.js hosting provider. Make sure these are configured in production:

- MongoDB connection string
- JWT secret
- Client URL
- Cloudinary credentials if uploads are used
- Razorpay keys if payments are enabled

## Future Improvements

- Add product screenshots to this README
- Add automated tests for frontend and backend
- Add CI/CD for build and deployment checks
- Add payment flow documentation

## Author

Praveen Krishna Gandi
