import crypto from 'crypto';
import { getSetting } from '../lib/db.js';

const sessions = new Map();
const SESSION_TTL = 1000 * 60 * 60 * 8;

export function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const ts = sessions.get(token);
  if (!ts || Date.now() - ts > SESSION_TTL) { sessions.delete(token); return res.status(401).json({ error: 'Session expired' }); }
  next();
}

export async function loginHandler(req, res) {
  const { password } = req.body;
  const correct = await getSetting('admin_password') ?? 'admin123';
  if (!password || password !== correct) return res.status(401).json({ error: 'Invalid password' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now());
  res.json({ token });
}

export function logoutHandler(req, res) {
  const token = req.headers['x-admin-token'];
  if (token) sessions.delete(token);
  res.json({ ok: true });
}
