// =============================================
// FATARCO - JavaScript Principal v2
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile navigation ---
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('active');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // --- Live search ---
  const searchInput = document.getElementById('headerSearch');
  const searchResults = document.getElementById('searchResults');
  let searchTimeout;

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim();
      if (q.length < 3) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }
      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch('/api/buscar?q=' + encodeURIComponent(q));
          const data = await res.json();
          if (data.length === 0) {
            searchResults.innerHTML = '<div style="padding:1rem;color:#888;font-size:0.9rem">No se encontraron resultados</div>';
          } else {
            searchResults.innerHTML = data.map(n => 
              '<a href="/noticia/' + n.slug + '" class="search-result-item" role="option">' +
              '<strong>' + n.titulo + '</strong>' +
              '<small>' + new Date(n.created_at).toLocaleDateString('es-AR') + '</small>' +
              '</a>'
            ).join('');
          }
          searchResults.classList.add('active');
        } catch (err) {
          console.error('Search error:', err);
        }
      }, 300);
    });

    // Close search on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        searchInput.blur();
      }
    });
  }

  // --- Scroll animations ---
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.card, .evento-row, .gov-card, .value-card, .club-card').forEach(el => {
      observer.observe(el);
    });
  }

  // --- Active nav link ---
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
      link.setAttribute('aria-current', 'page');
    }
  });

});
