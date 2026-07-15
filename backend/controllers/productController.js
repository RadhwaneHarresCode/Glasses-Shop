// controllers/productController.js

const { products, reviews } = require('../data/db');

// GET /api/products
const getAllProducts = (req, res) => {
  try {
    let result = [...products];

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      result = result.filter(p => p.category === req.query.category);
    }

    // Filter by gender
    if (req.query.gender && req.query.gender !== 'all') {
      result = result.filter(p => p.gender === req.query.gender || p.gender === 'unisex');
    }

    // Filter by price range
    if (req.query.minPrice) {
      result = result.filter(p => p.price >= parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      result = result.filter(p => p.price <= parseFloat(req.query.maxPrice));
    }

    // Filter by search query
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }

    // Filter featured
    if (req.query.featured === 'true') {
      result = result.filter(p => p.featured);
    }

    // Filter new
    if (req.query.new === 'true') {
      result = result.filter(p => p.new);
    }

    // Sort
    const sort = req.query.sort || 'default';
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = result.slice(startIndex, endIndex);

    res.json({
      success: true,
      total: result.length,
      page,
      pages: Math.ceil(result.length / limit),
      data: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/products/:id
const getProductById = (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const productReviews = reviews.filter(r => r.productId === req.params.id);
  res.json({ success: true, data: { ...product, reviews: productReviews } });
};

// GET /api/products/featured
const getFeaturedProducts = (req, res) => {
  const featured = products.filter(p => p.featured).slice(0, 4);
  res.json({ success: true, data: featured });
};

// GET /api/products/categories
const getCategories = (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const counts = {};
  categories.forEach(c => {
    counts[c] = products.filter(p => p.category === c).length;
  });
  res.json({ success: true, data: { categories, counts } });
};

// POST /api/products (add product - for development)
const createProduct = (req, res) => {
  const { uuidv4 } = require('../data/db');
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    rating: 0,
    reviews: 0,
    stock: req.body.stock || 0,
    createdAt: new Date()
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
};

// PUT /api/products/:id
const updateProduct = (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  res.json({ success: true, data: products[idx] });
};

// DELETE /api/products/:id
const deleteProduct = (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

  products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted' });
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};


