// =============================================
// FATARCO - Rutas Públicas v2
// =============================================
const express = require('express');
const router = express.Router();
const { getDB, initDatabase } = require('../db/setup');

initDatabase();

// --- HOME ---
router.get('/', (req, res) => {
  const db = getDB();
  const destacada = db.prepare('SELECT * FROM noticias WHERE publicada = 1 AND destacada = 1 ORDER BY created_at DESC LIMIT 1').get();
  const noticias = db.prepare('SELECT * FROM noticias WHERE publicada = 1 ORDER BY created_at DESC LIMIT 6').all();
  const eventos = db.prepare("SELECT * FROM eventos WHERE activo = 1 AND fecha_inicio >= date('now', '-7 days') ORDER BY fecha_inicio ASC LIMIT 10").all();
  const sponsors = db.prepare('SELECT * FROM sponsors WHERE activo = 1 ORDER BY orden ASC').all();
  res.render('index', { title: 'FATARCO — Federación Argentina de Tiro con Arco', destacada, noticias, eventos, sponsors });
});

// --- NOTICIAS ---
router.get('/noticias', (req, res) => {
  const db = getDB();
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;
  const categoria = req.query.categoria || null;
  let query = 'SELECT * FROM noticias WHERE publicada = 1';
  let countQuery = 'SELECT COUNT(*) as total FROM noticias WHERE publicada = 1';
  const params = [];
  if (categoria) { query += ' AND categoria = ?'; countQuery += ' AND categoria = ?'; params.push(categoria); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const total = db.prepare(countQuery).get(...params).total;
  const noticias = db.prepare(query).all(...params, limit, offset);
  const totalPages = Math.ceil(total / limit);
  const categorias = db.prepare('SELECT DISTINCT categoria FROM noticias WHERE publicada = 1 ORDER BY categoria').all().map(c => c.categoria);
  res.render('noticias', { title: 'Noticias — FATARCO', noticias, page, totalPages, categoria, categorias });
});

// --- NOTICIA INDIVIDUAL ---
router.get('/noticia/:slug', (req, res) => {
  const db = getDB();
  const noticia = db.prepare('SELECT * FROM noticias WHERE slug = ? AND publicada = 1').get(req.params.slug);
  if (!noticia) return res.status(404).render('404', { title: 'Noticia no encontrada' });
  db.prepare('UPDATE noticias SET views = views + 1 WHERE id = ?').run(noticia.id);
  const relacionadas = db.prepare('SELECT * FROM noticias WHERE publicada = 1 AND id != ? AND categoria = ? ORDER BY created_at DESC LIMIT 3').all(noticia.id, noticia.categoria);
  res.render('noticia-detalle', { title: `${noticia.titulo} — FATARCO`, noticia, relacionadas });
});

// --- EVENTOS ---
router.get('/eventos', (req, res) => {
  const db = getDB();
  const eventos = db.prepare('SELECT * FROM eventos WHERE activo = 1 ORDER BY fecha_inicio ASC').all();
  res.render('eventos', { title: 'Calendario de Eventos — FATARCO', eventos });
});

// --- CLUBES ---
router.get('/clubes', (req, res) => {
  const db = getDB();
  const clubes = db.prepare('SELECT * FROM clubes WHERE activo = 1 ORDER BY provincia, nombre').all();
  res.render('clubes', { title: 'Clubes Afiliados — FATARCO', clubes });
});

// --- PÁGINAS ESTÁTICAS ---
router.get('/el-deporte', (req, res) => res.render('deporte', { title: 'El Deporte — FATARCO' }));
router.get('/institucional', (req, res) => res.render('institucional', { title: 'Institucional — FATARCO' }));
router.get('/gobernanza', (req, res) => res.render('gobernanza', { title: 'Gobernanza y Transparencia — FATARCO' }));
router.get('/contacto', (req, res) => res.render('contacto', { title: 'Contacto — FATARCO' }));

module.exports = router;
