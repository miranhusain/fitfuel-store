import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import './lib/db.js';
import productsRouter  from './routes/products.js';
import analyticsRouter from './routes/analytics.js';
import { loginHandler, logoutHandler } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.post('/api/auth/login',  loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.use('/api/products',  productsRouter);
app.use('/api/analytics', analyticsRouter);
app.get('/api/healthz', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve built frontend
const FRONTEND = path.resolve(__dirname, '../public');
if (fs.existsSync(FRONTEND)) {
  app.use(express.static(FRONTEND));
  app.get('*', (_, res) => res.sendFile(path.join(FRONTEND, 'index.html')));
  console.log('[APP] Serving frontend ✅');
}

app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
  console.log(`   API:   http://localhost:${PORT}/api/healthz\n`);
});
