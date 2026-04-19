import express from 'express';
import cors from 'cors';

const app = express();

// مهم جداً لRailway
const PORT = process.env.PORT || 8080;

// مهم
app.use(cors());
app.use(express.json());

// route رئيسي (هذا اللي ناقصك 🔥)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// 🔥 أهم سطر
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
