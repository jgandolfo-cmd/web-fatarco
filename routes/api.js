// =============================================
// FATARCO - Rutas API (AJAX)
// =============================================
const express = require('express');
const router = express.Router();
const { getDB } = require('../db/setup');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload de imagen desde el editor Quill
router.post('/upload-imagen', authRequired, upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }
  res.json({ url: '/uploads/' + req.file.filename });
});

// Búsqueda de noticias (para el buscador público)
router.get('/buscar', (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 3) {
    return res.json([]);
  }
  
  const db = getDB();
  const results = db.prepare(`
    SELECT id, titulo, slug, extracto, imagen, created_at 
    FROM noticias 
    WHERE publicada = 1 AND (titulo LIKE ? OR extracto LIKE ? OR contenido LIKE ?)
    ORDER BY created_at DESC LIMIT 10
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);

  res.json(results);
});

// Toggle publicar/despublicar noticia
router.post('/noticias/:id/toggle-publicada', authRequired, (req, res) => {
  const db = getDB();
  const noticia = db.prepare('SELECT publicada FROM noticias WHERE id = ?').get(req.params.id);
  if (!noticia) return res.status(404).json({ error: 'No encontrada' });

  db.prepare('UPDATE noticias SET publicada = ? WHERE id = ?').run(noticia.publicada ? 0 : 1, req.params.id);
  res.json({ publicada: !noticia.publicada });
});

// Toggle destacar noticia
router.post('/noticias/:id/toggle-destacada', authRequired, (req, res) => {
  const db = getDB();
  // Solo una puede ser destacada
  db.prepare('UPDATE noticias SET destacada = 0').run();
  db.prepare('UPDATE noticias SET destacada = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
