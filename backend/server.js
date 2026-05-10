const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Rise of Swarajya API is running', port: PORT });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log('Rise of Swarajya - Backend Server');
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`API Base:   http://localhost:${PORT}/api`);
  console.log(`Health:     http://localhost:${PORT}/health`);
  console.log('----------------------------------------');
});
