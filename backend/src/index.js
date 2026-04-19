import express from 'express';
import cors from 'cors';

const app = express();

// مهم جدًا لـ Railway
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.send('Backend working 🚀');
});

app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
