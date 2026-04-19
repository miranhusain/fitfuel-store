import express from 'express';
import cors from 'cors';

const app = express();

// 🔥 مهم جداً
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// root route (Railway يحتاجه)
app.get('/', (req, res) => {
  res.send('Server is alive 🚀');
});

// health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// 🔥 هذا أهم شي
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});
