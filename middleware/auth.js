// =============================================
// FATARCO - Middleware de Autenticación
// =============================================
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/setup');

function authRequired(req, res, next) {
  const token = req.cookies.fatarco_token;
  
  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = db.prepare('SELECT id, nombre, email, rol FROM users WHERE id = ? AND activo = 1').get(decoded.userId);
    
    if (!user) {
      res.clearCookie('fatarco_token');
      return res.redirect('/admin/login');
    }
    
    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    res.clearCookie('fatarco_token');
    return res.redirect('/admin/login');
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.rol !== 'admin') {
      return res.status(403).render('error', { 
        title: 'Acceso denegado', 
        message: 'No tenés permisos para acceder a esta sección.' 
      });
    }
    next();
  });
}

module.exports = { authRequired, adminRequired };
