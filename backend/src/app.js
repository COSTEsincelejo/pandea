const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/config/whatsapp', (req, res) => {
  return res.json({ number: process.env.WHATSAPP_NUMBER || '573017056143' });
});

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', service: 'Pandea API', version: '1.0.0' });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ Pandea API corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
