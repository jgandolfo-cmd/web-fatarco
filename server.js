// =============================================
// FATARCO - Servidor Principal v2
// =============================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- SEGURIDAD ----
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.quilljs.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.'
});
app.use('/admin', limiter);

// ---- MIDDLEWARE ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.siteName = 'FATARCO';
  res.locals.siteDescription = 'Federación Argentina de Tiro con Arco — Sitio oficial';
  next();
});

// ---- RUTAS ----
app.use('/', require('./routes/public'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// ---- ERROR HANDLING ----
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada — FATARCO' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', { 
    title: 'Error — FATARCO',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal. Intentá de nuevo más tarde.'
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  🏹 FATARCO — Servidor corriendo        ║
  ║  Sitio:  http://localhost:${PORT}           ║
  ║  Admin:  http://localhost:${PORT}/admin      ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
