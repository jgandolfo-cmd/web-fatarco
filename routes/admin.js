// =============================================
// FATARCO - Rutas de Administración
// =============================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const { getDB } = require('../db/setup');
const { authRequired, adminRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- LOGIN ---
router.get('/login', (req, res) => {
  if (req.cookies.fatarco_token) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Iniciar Sesión - Admin FATARCO', error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND activo = 1').get(email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('admin/login', { 
      title: 'Iniciar Sesión - Admin FATARCO', 
      error: 'Email o contraseña incorrectos' 
    });
  }

  const token = jwt.sign(
    { userId: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.cookie('fatarco_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
  });

  res.redirect('/admin');
});

router.get('/logout', (req, res) => {
  res.clearCookie('fatarco_token');
  res.redirect('/admin/login');
});

// --- DASHBOARD ---
router.get('/', authRequired, (req, res) => {
  const db = getDB();
  const stats = {
    noticias: db.prepare('SELECT COUNT(*) as count FROM noticias').get().count,
    eventos: db.prepare('SELECT COUNT(*) as count FROM eventos WHERE activo = 1').get().count,
    clubes: db.prepare('SELECT COUNT(*) as count FROM clubes WHERE activo = 1').get().count,
    visitas: db.prepare('SELECT SUM(views) as total FROM noticias').get().total || 0
  };
  
  const ultimasNoticias = db.prepare(
    'SELECT id, titulo, publicada, views, created_at FROM noticias ORDER BY created_at DESC LIMIT 10'
  ).all();

  res.render('admin/dashboard', { 
    title: 'Panel de Administración - FATARCO',
    stats,
    ultimasNoticias
  });
});

// --- NOTICIAS CRUD ---

// Listar noticias
router.get('/noticias', authRequired, (req, res) => {
  const db = getDB();
  const noticias = db.prepare(`
    SELECT n.*, u.nombre as autor 
    FROM noticias n LEFT JOIN users u ON n.autor_id = u.id 
    ORDER BY n.created_at DESC
  `).all();

  res.render('admin/noticias-lista', { 
    title: 'Gestión de Noticias - FATARCO',
    noticias,
    mensaje: req.query.msg || null
  });
});

// Formulario nueva noticia
router.get('/noticias/nueva', authRequired, (req, res) => {
  res.render('admin/noticia-editor', { 
    title: 'Nueva Noticia - FATARCO',
    noticia: null,
    error: null
  });
});

// Crear noticia
router.post('/noticias/nueva', authRequired, upload.single('imagen'), (req, res) => {
  const { titulo, extracto, contenido, categoria, destacada, publicada } = req.body;
  const db = getDB();
  
  let slug = slugify(titulo, { lower: true, strict: true, locale: 'es' });
  
  // Verificar slug único
  const existing = db.prepare('SELECT id FROM noticias WHERE slug = ?').get(slug);
  if (existing) {
    slug += '-' + Date.now().toString(36);
  }

  const imagen = req.file ? '/uploads/' + req.file.filename : null;

  try {
    db.prepare(`
      INSERT INTO noticias (titulo, slug, extracto, contenido, imagen, categoria, destacada, publicada, autor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      titulo, slug, extracto, contenido, imagen,
      categoria || 'Noticias',
      destacada ? 1 : 0,
      publicada ? 1 : 0,
      req.user.id
    );

    res.redirect('/admin/noticias?msg=Noticia creada exitosamente');
  } catch (err) {
    res.render('admin/noticia-editor', {
      title: 'Nueva Noticia - FATARCO',
      noticia: req.body,
      error: 'Error al crear la noticia: ' + err.message
    });
  }
});

// Formulario editar noticia
router.get('/noticias/editar/:id', authRequired, (req, res) => {
  const db = getDB();
  const noticia = db.prepare('SELECT * FROM noticias WHERE id = ?').get(req.params.id);
  
  if (!noticia) {
    return res.redirect('/admin/noticias?msg=Noticia no encontrada');
  }

  res.render('admin/noticia-editor', { 
    title: 'Editar Noticia - FATARCO',
    noticia,
    error: null
  });
});

// Actualizar noticia
router.post('/noticias/editar/:id', authRequired, upload.single('imagen'), (req, res) => {
  const { titulo, extracto, contenido, categoria, destacada, publicada } = req.body;
  const db = getDB();
  
  const existing = db.prepare('SELECT * FROM noticias WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.redirect('/admin/noticias?msg=Noticia no encontrada');
  }

  const imagen = req.file ? '/uploads/' + req.file.filename : existing.imagen;

  try {
    db.prepare(`
      UPDATE noticias SET titulo = ?, extracto = ?, contenido = ?, imagen = ?, 
      categoria = ?, destacada = ?, publicada = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      titulo, extracto, contenido, imagen,
      categoria || 'Noticias',
      destacada ? 1 : 0,
      publicada ? 1 : 0,
      req.params.id
    );

    res.redirect('/admin/noticias?msg=Noticia actualizada exitosamente');
  } catch (err) {
    res.render('admin/noticia-editor', {
      title: 'Editar Noticia - FATARCO',
      noticia: { ...existing, ...req.body },
      error: 'Error al actualizar: ' + err.message
    });
  }
});

// Eliminar noticia
router.post('/noticias/eliminar/:id', authRequired, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM noticias WHERE id = ?').run(req.params.id);
  res.redirect('/admin/noticias?msg=Noticia eliminada');
});

// --- EVENTOS CRUD ---
router.get('/eventos', authRequired, (req, res) => {
  const db = getDB();
  const eventos = db.prepare('SELECT * FROM eventos ORDER BY fecha_inicio DESC').all();
  res.render('admin/eventos-lista', {
    title: 'Gestión de Eventos - FATARCO',
    eventos,
    mensaje: req.query.msg || null
  });
});

router.get('/eventos/nuevo', authRequired, (req, res) => {
  res.render('admin/evento-editor', {
    title: 'Nuevo Evento - FATARCO',
    evento: null, error: null
  });
});

router.post('/eventos/nuevo', authRequired, (req, res) => {
  const { titulo, descripcion, tipo, sede, localidad, provincia, fecha_inicio, fecha_fin } = req.body;
  const db = getDB();
  try {
    db.prepare(`
      INSERT INTO eventos (titulo, descripcion, tipo, sede, localidad, provincia, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(titulo, descripcion, tipo, sede, localidad, provincia, fecha_inicio, fecha_fin || null);
    res.redirect('/admin/eventos?msg=Evento creado');
  } catch (err) {
    res.render('admin/evento-editor', {
      title: 'Nuevo Evento - FATARCO', evento: req.body, error: err.message
    });
  }
});

router.post('/eventos/eliminar/:id', authRequired, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM eventos WHERE id = ?').run(req.params.id);
  res.redirect('/admin/eventos?msg=Evento eliminado');
});

module.exports = router;
