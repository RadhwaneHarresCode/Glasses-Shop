# 🕶 OPTICA — Glasses Store Full-Stack Project

> Premium eyewear e-commerce platform. Node.js backend + Native HTML/CSS/JS frontend.  
> Theme: **Black & White · 3D Effects · Dynamic Vision**

---

## 📁 Project Structure

```
glasses-project/
├── backend/
│   ├── server.js              ← Express app entry point
│   ├── package.json
│   ├── data/
│   │   └── db.js              ← In-memory database (products, orders, users)
│   ├── controllers/
│   │   ├── productController.js
│   │   └── orderController.js
│   └── routes/
│       ├── products.js
│       └── orders.js
│
└── frontend/
    ├── index.html             ← Main SPA page
    ├── css/
    │   └── main.css           ← Full design system
    └── js/
        └── app.js             ← App logic + API client
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Open in browser
```
http://localhost:3000
```
The backend serves the frontend automatically.

---

## 🔌 API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products (with filtering/sorting/pagination) |
| GET | `/api/products/:id` | Single product |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/categories` | Categories + counts |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Query Parameters (GET /api/products)
```
?category=sunglasses   → filter by category
?gender=women          → filter by gender
?minPrice=100          → minimum price
?maxPrice=300          → maximum price
?search=aviator        → text search
?featured=true         → featured only
?sort=price-asc        → sort (price-asc, price-desc, rating, newest)
?page=1&limit=12       → pagination
```

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | All orders |
| GET | `/api/orders/:id` | Single order |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update order status |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Store statistics |

---

## 🛠 Development Guide

### Adding Products
Edit `backend/data/db.js` and add to the `products` array:
```js
{
  id: '9',
  name: 'Your Frame Name',
  category: 'eyeglasses',           // eyeglasses | sunglasses | sport
  price: 199.99,
  originalPrice: null,              // null or original price (for sale badge)
  description: 'Short description',
  longDescription: 'Full detail...',
  material: 'Material type',
  frameShape: 'Rectangle',         // Rectangle | Round | Aviator | Cat-Eye | Hexagon | Wrap | Square
  gender: 'unisex',                 // unisex | men | women
  colors: ['Black', 'White'],
  sizes: ['Small', 'Medium', 'Large'],
  stock: 50,
  rating: 4.5,
  reviews: 0,
  badge: null,                      // null | 'Bestseller' | 'New' | 'Sale' | 'Limited'
  featured: false,
  new: true,
  tags: ['your', 'tags'],
  createdAt: new Date()
}
```

### Connecting a Real Database
Replace `backend/data/db.js` with MongoDB or PostgreSQL:

```bash
# MongoDB
npm install mongoose

# PostgreSQL
npm install pg sequelize
```

### Adding Authentication
```bash
npm install jsonwebtoken bcryptjs
```
Create `backend/middleware/auth.js` and protect routes.

### Environment Variables
Create `backend/.env`:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DB_URI=mongodb://localhost:27017/optica
```

---

## 🎨 Frontend Customization

### Design Tokens (`frontend/css/main.css`)
```css
:root {
  --black: #000000;
  --white: #ffffff;
  --font-display: 'Bebas Neue', sans-serif;
  --font-serif: 'Cormorant Garamond', serif;
  --font-mono: 'DM Mono', monospace;
}
```

### Adding New Frame Shapes
In `frontend/js/app.js`, add to the `shapes` object in `glasssSVG()`:
```js
const shapes = {
  // ...existing shapes...
  yourshape: `<svg>...</svg>`
};
```

Then add to the shape map:
```js
function getGlassShape(product) {
  const map = {
    'YourShape': 'yourshape',
    // ...
  };
}
```

### Pages to Add
- `/pages/product.html` — Full product detail page
- `/pages/checkout.html` — Full checkout flow
- `/pages/account.html` — User account
- `/pages/admin.html` — Admin dashboard

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | In-memory (→ MongoDB/PostgreSQL) |
| CORS | cors |
| Security | helmet |
| Logging | morgan |
| Frontend | Vanilla HTML/CSS/JS |
| Fonts | Google Fonts (Bebas Neue, Cormorant Garamond, DM Mono) |
| Icons | Inline SVG |

---

## 🔜 Recommended Next Steps

1. **Database** — Replace in-memory store with MongoDB Atlas (free tier)
2. **Auth** — Add JWT authentication for user accounts
3. **Payments** — Integrate Stripe for checkout
4. **Images** — Add real product photography (Cloudinary recommended)
5. **Admin** — Build an admin dashboard at `/pages/admin.html`
6. **Email** — Add order confirmation emails via Nodemailer
7. **Deploy** — Deploy to Railway, Render, or Vercel

---

*OPTICA — Vision Redefined*
