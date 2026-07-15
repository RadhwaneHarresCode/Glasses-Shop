// controllers/orderController.js

const { orders, products, uuidv4 } = require('../data/db');

// POST /api/orders
const createOrder = (req, res) => {
  try {
    const { items, customer, shipping } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: lineTotal
      };
    });

    const tax = subtotal * 0.08;
    const shippingCost = subtotal > 150 ? 0 : 9.99;
    const total = subtotal + tax + shippingCost;

    const order = {
      id: uuidv4(),
      orderNumber: `OPT-${Date.now().toString().slice(-6)}`,
      items: orderItems,
      customer,
      shipping,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shippingCost,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      createdAt: new Date()
    };

    orders.push(order);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/orders
const getAllOrders = (req, res) => {
  res.json({ success: true, data: orders });
};

// GET /api/orders/:id
const getOrderById = (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: order });
};

// PUT /api/orders/:id/status
const updateOrderStatus = (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(req.body.status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  order.status = req.body.status;
  order.updatedAt = new Date();
  res.json({ success: true, data: order });
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
