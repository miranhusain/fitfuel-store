import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { products as db, logs } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const IMAGE_RE = /^https?:\/\/.{5,}/i;

function validateProduct(body) {
  const { name, price, images } = body;
  if (!name?.en?.trim()) return 'name.en is required';
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) return 'price must be a positive number';
  if (!Array.isArray(images) || images.length === 0) return 'At least one image URL is required';
  if (!images.some(u => IMAGE_RE.test(u?.trim()))) return 'Images must be valid HTTP URLs';
  return null;
}

function cleanProduct(body) {
  const { name, shortDescription, fullDescription, price, category, brand, stock, images, weights } = body;
  return {
    name: { en: name.en.trim(), ar: (name.ar || name.en).trim() },
    shortDescription: { en: (shortDescription?.en || '').trim(), ar: (shortDescription?.ar || shortDescription?.en || '').trim() },
    fullDescription:  { en: (fullDescription?.en  || '').trim(), ar: (fullDescription?.ar  || fullDescription?.en  || '').trim() },
    price:    Number(price),
    category: (category || '').trim(),
    brand:    (brand || '').trim(),
    stock:    Number(stock) || 0,
    images:   images.filter(u => IMAGE_RE.test(u?.trim())).map(u => u.trim()),
    weights:  Array.isArray(weights)
      ? weights.filter(w => w?.label).map(w => ({ label: w.label.trim(), priceDelta: Number(w.priceDelta) || 0 }))
      : [],
  };
}

router.get('/', async (req, res) => {
  const { category, brand, minPrice, maxPrice, weight, search, sort, page = 1, limit = 50 } = req.query;
  let query = {};
  if (category) query.category = category;
  if (brand)    query.brand    = brand;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (weight)  query['weights.label'] = weight;
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ 'name.en': re }, { 'name.ar': re }, { brand: re }, { category: re }];
  }
  let sortObj = { createdAt: -1 };
  if (sort === 'price_asc')  sortObj = { price: 1 };
  if (sort === 'price_desc') sortObj = { price: -1 };

  const allDocs   = await db.findAsync(query).sort(sortObj);
  const total     = allDocs.length;
  const pageNum   = Number(page);
  const limitNum  = Number(limit);
  const paginated = allDocs.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  res.json({ products: paginated.map(p => ({...p, id: p._id})), total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.get('/meta', async (req, res) => {
  const all = await db.findAsync({});
  const categories = [...new Set(all.map(p => p.category).filter(Boolean))].sort();
  const brands     = [...new Set(all.map(p => p.brand).filter(Boolean))].sort();
  const weights    = [...new Set(all.flatMap(p => p.weights?.map(w => w.label) ?? []))].sort();
  const prices     = all.map(p => p.price);
  res.json({ categories, brands, weights, priceRange: { min: Math.min(0, ...prices), max: Math.max(0, ...prices) } });
});

router.get('/:id', async (req, res) => {
  const p = await db.findOneAsync({ _id: req.params.id });
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...p, id: p._id });
});

router.post('/', requireAuth, async (req, res) => {
  const err = validateProduct(req.body);
  if (err) return res.status(400).json({ error: err });
  const doc = { ...cleanProduct(req.body), createdAt: new Date().toISOString() };
  const inserted = await db.insertAsync(doc);
  await logs.insertAsync({ action: 'create', productId: inserted._id, productName: inserted.name.en, createdAt: new Date().toISOString() });
  res.status(201).json({ ...inserted, id: inserted._id });
});

router.put('/:id', requireAuth, async (req, res) => {
  const existing = await db.findOneAsync({ _id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const err = validateProduct(req.body);
  if (err) return res.status(400).json({ error: err });
  const update = { ...cleanProduct(req.body), updatedAt: new Date().toISOString() };
  await db.updateAsync({ _id: req.params.id }, { $set: update });
  const updated = await db.findOneAsync({ _id: req.params.id });
  await logs.insertAsync({ action: 'update', productId: updated._id, productName: updated.name.en, createdAt: new Date().toISOString() });
  res.json({ ...updated, id: updated._id });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const p = await db.findOneAsync({ _id: req.params.id });
  if (!p) return res.status(404).json({ error: 'Product not found' });
  await db.removeAsync({ _id: req.params.id }, {});
  await logs.insertAsync({ action: 'delete', productId: p._id, productName: p.name.en, createdAt: new Date().toISOString() });
  res.json({ ok: true });
});

export default router;
