# 🏹 FATARCO - Sitio Web Oficial

**Federación Argentina de Tiro con Arco**

---

## 📋 ¿Qué incluye esta Parte 1?

✅ Sitio web completo con diseño deportivo profesional  
✅ Sistema de noticias con editor visual (Quill.js)  
✅ Panel de administración protegido con contraseña  
✅ Calendario de eventos  
✅ Sección de clubes  
✅ Páginas institucionales (El Deporte, Institucional, Contacto)  
✅ Diseño responsive (se ve bien en celular y PC)  
✅ Seguridad: contraseñas encriptadas, JWT, rate limiting, helmet  
✅ SEO básico con meta tags  
✅ Botones de compartir en redes sociales  

---

## 🚀 Cómo instalar y correr en tu notebook

### Paso 1: Instalar Node.js

Descargá Node.js desde: **https://nodejs.org**  
(Elegí la versión LTS - es la más estable)

Verificá que se instaló correctamente abriendo la terminal (CMD en Windows) y escribiendo:
```
node --version
npm --version
```

### Paso 2: Copiar el proyecto

Copiá toda la carpeta `fatarco` a tu escritorio o donde quieras.

### Paso 3: Instalar dependencias

Abrí una terminal en la carpeta del proyecto y ejecutá:
```
cd fatarco
npm install
```

### Paso 4: Iniciar el servidor

```
npm start
```

Vas a ver un mensaje como este:
```
============================================
 FATARCO - Servidor corriendo
 http://localhost:3000
 Admin: http://localhost:3000/admin
============================================
```

### Paso 5: ¡Listo!

- **Sitio web:** http://localhost:3000
- **Panel admin:** http://localhost:3000/admin

---

## 🔐 Acceso al Panel de Administración

**Email:** admin@fatarco.org.ar  
**Contraseña:** fatarco2026

⚠️ **IMPORTANTE:** Cambiá la contraseña antes de subir a producción.

### Desde el panel podés:

- **Crear noticias** con el editor visual (negritas, títulos, imágenes, links)
- **Editar y eliminar** noticias existentes
- **Destacar** una noticia para que aparezca grande en el home
- **Publicar/despublicar** noticias (borradores)
- **Crear eventos** con fecha, tipo, sede y provincia
- **Ver estadísticas** de lecturas

---

## 📁 Estructura del proyecto

```
fatarco/
├── server.js              ← Servidor principal
├── package.json           ← Dependencias
├── .env                   ← Variables de entorno (secretos)
├── db/
│   ├── setup.js           ← Creación de base de datos
│   └── fatarco.db         ← Base de datos (se crea automática)
├── middleware/
│   ├── auth.js            ← Autenticación
│   └── upload.js          ← Subida de imágenes
├── routes/
│   ├── public.js          ← Rutas del sitio público
│   ├── admin.js           ← Rutas del panel admin
│   └── api.js             ← API para AJAX
├── views/
│   ├── index.ejs          ← Página principal
│   ├── noticias.ejs       ← Listado de noticias
│   ├── noticia-detalle.ejs← Noticia individual
│   ├── eventos.ejs        ← Calendario
│   ├── clubes.ejs         ← Clubes
│   ├── partials/          ← Componentes reutilizables
│   └── admin/             ← Vistas del admin
└── public/
    ├── css/               ← Estilos
    ├── js/                ← JavaScript
    ├── images/            ← Imágenes del sitio
    └── uploads/           ← Imágenes subidas por admin
```

---

## 🔒 Seguridad implementada

- Contraseñas encriptadas con **bcrypt** (10 rounds)
- Sesiones con **JWT** (tokens seguros de 24h)
- Cookies **httpOnly** y **sameSite: strict**
- **Helmet** para headers de seguridad
- **Rate limiting** en rutas de admin (100 req/15min)
- Validación de archivos (solo imágenes, máx 5MB)
- Nombres de archivo aleatorios para evitar ataques

---

## 🌐 Para subir a producción (hosting)

1. Cambiá el `JWT_SECRET` en `.env` por algo largo y aleatorio
2. Poné `NODE_ENV=production` en `.env`
3. Cambiá la contraseña del admin
4. Subí todo al hosting (excepto `node_modules`)
5. Ejecutá `npm install` en el servidor
6. Usá PM2 para mantener el servidor corriendo:
   ```
   npm install pm2 -g
   pm2 start server.js --name fatarco
   pm2 save
   ```

---

## 📌 Próximas partes (a desarrollar)

- **Parte 2:** Sección de atletas, estadísticas, rankings
- **Parte 3:** Galería de fotos, integración con redes sociales
- **Parte 4:** Sistema de inscripción online a eventos
- **Parte 5:** Zona de descarga de documentos, reglamentos
- **Parte 6:** Newsletter y notificaciones

---

¿Dudas? ¡Consultame! 🏹
