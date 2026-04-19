import { Router } from 'express';
import { analytics as db, logs, getSetting, setSetting } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { products } from '../lib/db.js';

const router = Router();

router.post('/event', async (req, res) => {
  const { type, productId } = req.body;
  if (!['visitor','product_view','whatsapp_click'].includes(type)) return res.status(400).json({ error: 'Unknown event' });
  await db.insertAsync({ type, productId: productId ?? null, createdAt: new Date().toISOString() });
  res.json({ ok: true });
});

router.get('/stats', requireAuth, async (req, res) => {
  const multiplier = Number(await getSetting('visitor_multiplier') ?? 10);
  const all = await db.findAsync({});
  const visitors = all.filter(e => e.type === 'visitor').length;
  const whatsapp = all.filter(e => e.type === 'whatsapp_click').length;
  const views = all.filter(e => e.type === 'product_view' && e.productId);
  const viewMap = {};
  views.forEach(e => { viewMap[e.productId] = (viewMap[e.productId] || 0) + 1; });
  const topEntry = Object.entries(viewMap).sort((a,b) => b[1]-a[1])[0];
  const topProduct = topEntry ? await (async () => {
    const p = await products.findOneAsync({ _id: topEntry[0] });
    return { id: topEntry[0], name: p?.name?.en ?? topEntry[0], views: topEntry[1] };
  })() : null;
  const lastVisit = all.filter(e => e.type === 'visitor').sort((a,b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt ?? null;
  res.json({ visitors: visitors * multiplier, visitorsRaw: visitors, whatsappClicks: whatsapp, topProduct, lastVisit });
});

router.get('/logs', requireAuth, async (req, res) => {
  const all = await logs.findAsync({}).sort({ createdAt: -1 });
  res.json(all.slice(0, 200).map(l => ({ id: l._id, action: l.action, productId: l.productId, productName: l.productName, timestamp: l.createdAt })));
});

router.get('/system', requireAuth, async (req, res) => {
  const count = (await products.findAsync({})).length;
  res.json({ productCount: count, storageType: 'NeDB (persistent)', persistentStorage: true, uptime: Math.floor(process.uptime()), nodeVersion: process.version, memoryUsageMb: Math.round(process.memoryUsage().rss/1024/1024), serverTime: new Date().toISOString() });
});

router.get('/settings', requireAuth, async (req, res) => {
  res.json({
    whatsappNumber: await getSetting('whatsapp_number') ?? '',
    storeNameEn: await getSetting('store_name_en') ?? 'FitFuel Store',
    storeNameAr: await getSetting('store_name_ar') ?? 'متجر فيت فيول',
    visitorMultiplier: Number(await getSetting('visitor_multiplier') ?? 10),
  });
});

router.put('/settings', requireAuth, async (req, res) => {
  const { whatsappNumber, storeNameEn, storeNameAr, visitorMultiplier, adminPassword } = req.body;
  if (whatsappNumber !== undefined) await setSetting('whatsapp_number', String(whatsappNumber).trim());
  if (storeNameEn !== undefined)    await setSetting('store_name_en', String(storeNameEn).trim());
  if (storeNameAr !== undefined)    await setSetting('store_name_ar', String(storeNameAr).trim());
  if (visitorMultiplier !== undefined) await setSetting('visitor_multiplier', String(Number(visitorMultiplier)));
  if (adminPassword?.trim())        await setSetting('admin_password', String(adminPassword).trim());
  res.json({ ok: true });
});

export default router;
