// =============================================
// FATARCO - Admin JavaScript
// =============================================

// Toggle publicar/despublicar noticia
async function togglePublicada(id) {
  try {
    const res = await fetch(`/api/noticias/${id}/toggle-publicada`, { method: 'POST' });
    const data = await res.json();
    if (data.publicada !== undefined) {
      location.reload();
    }
  } catch (err) {
    alert('Error al cambiar el estado');
  }
}

// Toggle destacar noticia
async function toggleDestacada(id) {
  if (!confirm('¿Querés destacar esta noticia en el hero del sitio?')) return;
  try {
    const res = await fetch(`/api/noticias/${id}/toggle-destacada`, { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
      location.reload();
    }
  } catch (err) {
    alert('Error al destacar');
  }
}

// Auto-dismiss alerts
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s';
      setTimeout(() => alert.remove(), 500);
    }, 4000);
  });
});
