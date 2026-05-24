// =============================================
// FATARCO - Base de Datos SQLite
// =============================================
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'fatarco.db');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDatabase() {
  const db = getDB();

  // Tabla de usuarios (admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT DEFAULT 'editor' CHECK(rol IN ('admin', 'editor')),
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de noticias
  db.exec(`
    CREATE TABLE IF NOT EXISTS noticias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      extracto TEXT,
      contenido TEXT NOT NULL,
      imagen TEXT,
      categoria TEXT DEFAULT 'Noticias',
      destacada INTEGER DEFAULT 0,
      publicada INTEGER DEFAULT 1,
      autor_id INTEGER,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (autor_id) REFERENCES users(id)
    )
  `);

  // Tabla de eventos/calendario
  db.exec(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      tipo TEXT DEFAULT 'AL',
      sede TEXT,
      localidad TEXT,
      provincia TEXT,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE,
      inscripcion_url TEXT,
      info_url TEXT,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de clubes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      localidad TEXT,
      provincia TEXT,
      contacto TEXT,
      email TEXT,
      telefono TEXT,
      web TEXT,
      logo TEXT,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de sponsors
  db.exec(`
    CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      logo TEXT,
      url TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1
    )
  `);

  // Índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_noticias_slug ON noticias(slug);
    CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
    CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_inicio);
  `);

  // Crear admin por defecto si no existe
  const adminExists = db.prepare('SELECT id FROM users WHERE rol = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('fatarco2026', 10);
    db.prepare(`
      INSERT INTO users (nombre, email, password, rol) 
      VALUES (?, ?, ?, ?)
    `).run('Administrador', 'admin@fatarco.org.ar', hashedPassword, 'admin');
    console.log('✅ Usuario admin creado: admin@fatarco.org.ar / fatarco2026');
  }

  // Insertar noticias de ejemplo
  const noticiasCount = db.prepare('SELECT COUNT(*) as count FROM noticias').get();
  if (noticiasCount.count === 0) {
    const insertNoticia = db.prepare(`
      INSERT INTO noticias (titulo, slug, extracto, contenido, categoria, destacada, autor_id)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    insertNoticia.run(
      'Preparativos para la Final Nacional de Aire Libre',
      'preparativos-final-nacional-aire-libre',
      'Tiro Federal de Tucumán comienza con las tareas de organización de la Final Nacional de Aire Libre.',
      '<p>La Federación Argentina de Tiro con Arco informa que el <strong>Tiro Federal de Tucumán</strong> ya comenzó con los preparativos para la gran Final Nacional de Aire Libre que se disputará en San Miguel de Tucumán.</p><p>El evento congregará a los mejores arqueros del país en una jornada que promete ser histórica para el deporte nacional.</p><p>Las inscripciones estarán abiertas próximamente a través de los canales oficiales de FATARCO.</p>',
      'Actualidad', 1
    );

    insertNoticia.run(
      'Panamericanos de Campo: Se completó la clasificación',
      'panamericanos-campo-clasificacion',
      'Se completó la etapa de clasificación para los Panamericanos de Campo con excelentes resultados.',
      '<p>Los Panamericanos de Campo han completado su fase de clasificación con resultados destacados para la delegación argentina.</p><p>Nuestros arqueros demostraron un alto nivel competitivo en todas las categorías, posicionando a Argentina como una potencia regional en esta modalidad.</p>',
      'Noticias', 0
    );

    insertNoticia.run(
      'La CEFE cumple tres años: Entrevistamos a Rodrigo Loguercio',
      'cefe-tres-anos-rodrigo-loguercio',
      'Conversamos con Rodrigo Loguercio a propósito del tercer aniversario de la CEFE.',
      '<p>En el marco del tercer aniversario de la CEFE (Centro de Entrenamiento de la Federación), conversamos con <strong>Rodrigo Loguercio</strong> quien nos contó sobre los logros alcanzados y los desafíos futuros.</p><p>"El crecimiento que hemos visto en estos tres años es extraordinario. Cada vez más jóvenes se acercan al tiro con arco buscando un deporte que les brinde disciplina y concentración", expresó Loguercio.</p>',
      'Clubes', 0
    );

    console.log('✅ Noticias de ejemplo insertadas');
  }

  // Insertar eventos de ejemplo
  const eventosCount = db.prepare('SELECT COUNT(*) as count FROM eventos').get();
  if (eventosCount.count === 0) {
    const insertEvento = db.prepare(`
      INSERT INTO eventos (titulo, tipo, sede, localidad, provincia, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvento.run('Escuela de Arquería Villa María', 'AL', 'Villa María Asoc. Civil', 'Villa María', 'Córdoba', '2026-03-09', '2026-03-09');
    insertEvento.run('Club Social y Dep. Obras Sanitarias', 'AL', 'Obras Sanitarias', 'Esperanza', 'Santa Fe', '2026-03-09', '2026-03-09');
    insertEvento.run('Andina Tiro con Arco', 'C', 'Andina', 'Bariloche', 'Río Negro', '2026-03-16', '2026-03-16');
    insertEvento.run('Círculo Bahiense de Arquería', '3D', 'Círculo Bahiense', 'Bahía Blanca', 'Buenos Aires', '2026-03-23', '2026-03-24');
    insertEvento.run('Club El Palomar', 'AL', 'El Palomar', 'Ushuaia', 'Tierra del Fuego', '2026-03-29', '2026-03-29');

    console.log('✅ Eventos de ejemplo insertados');
  }

  console.log('✅ Base de datos inicializada correctamente');
  return db;
}

// Ejecutar si se corre directamente: node db/setup.js
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  initDatabase();
  console.log('🏹 Base de datos FATARCO lista');
}

module.exports = { getDB, initDatabase };
