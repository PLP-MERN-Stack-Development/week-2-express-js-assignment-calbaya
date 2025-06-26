// expressjs_api_server/index.js

const express = require('express');
const app = express();
const PORT = 3000;
const products = [];
const { v4: uuidv4 } = require('uuid');

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET all products with optional filtering and pagination
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, page = 1, limit = 10 } = req.query;

  if (category) {
    result = result.filter(p => p.category === category);
  }

  const start = (page - 1) * limit;
  const end = start + +limit;
  res.json(result.slice(start, end));
});

// GET a single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'NotFoundError: Product not found' });
  res.json(product);
});

// POST create new product
app.post('/api/products', validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', validateProduct, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NotFoundError: Product not found' });
  products[index] = { id: req.params.id, ...req.body };
  res.json(products[index]);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NotFoundError: Product not found' });
  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

// Search products by name
app.get('/api/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'ValidationError: Name query required' });
  const result = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  res.json(result);
});

// Product statistics: count by category
app.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'InternalServerError: Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
