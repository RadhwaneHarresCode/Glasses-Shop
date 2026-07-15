// server.js — Optica Glasses Store Backend

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: false // disabled for development
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Optica API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── Stats ────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const { products, orders } = require('./data/db');
  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0).toFixed(2),
      categories: [...new Set(products.map(p => p.category))].length
    }
  });
});

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ██████╗ ██████╗ ████████╗██╗ ██████╗ █████╗ `);
  console.log(`  ██╔═══██╗██╔══██╗╚══██╔══╝██║██╔════╝██╔══██╗`);
  console.log(`  ██║   ██║██████╔╝   ██║   ██║██║     ███████║`);
  console.log(`  ██║   ██║██╔═══╝    ██║   ██║██║     ██╔══██║`);
  console.log(`  ╚██████╔╝██║        ██║   ██║╚██████╗██║  ██║`);
  console.log(`   ╚═════╝ ╚═╝        ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝`);
  console.log(`\n  🕶  Server running at http://localhost:${PORT}`);
  console.log(`  📦 API available at http://localhost:${PORT}/api`);
  console.log(`  🌐 Frontend at http://localhost:${PORT}\n`);
});

module.exports = app;
