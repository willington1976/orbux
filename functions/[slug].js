// ============================================================
// ORBUX · functions/[slug].js
// Cloudflare Pages Function — rutas dinámicas de micrositios
// ============================================================

const API = 'https://orbux-backend.onrender.com/api';

export async function onRequest({ request, env, next, params }) {
  const slug = params.slug;

  // Rutas del sistema — dejar pasar sin interceptar
  const BYPASS = [
    'admin', 'proyecto', 'catalogo', 'index',
    'favicon', 'robots', 'sitemap', 'js', 'css',
    'functions', 'theme',
  ];
  if (BYPASS.some(r => slug.startsWith(r))) return next();

  // Archivos con extensión — dejar pasar
  if (/\.\w+$/.test(slug)) return next();

  try {
    // Verificar slug en la DB
    const check = await fetch(`${API}/proyectos/slug/${slug}`, {
      cf: { cacheTtl: 60 },
    });

    if (!check.ok) {
      return new Response('Micrositio no encontrado', {
        status: 404,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      });
    }

    // Servir proyecto.html — URL se mantiene limpia
    const html = await fetch(new URL('/proyecto.html', request.url));
    return new Response(html.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-store',
      },
    });

  } catch {
    return next();
  }
}

