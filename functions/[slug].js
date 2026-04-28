// ============================================================
// ORBUX · functions/[slug].js
// Cloudflare Pages Function — rutas dinámicas de micrositios
// Intercepta /cualquier-slug, verifica en backend, sirve proyecto.html
// ============================================================

const API = 'https://orbux-backend.onrender.com/api';

export async function onRequest({ request, env, next, params }) {
  const slug = params.slug;

  // Rutas del sistema — dejar pasar sin interceptar
  const BYPASS = [
    'admin', 'proyecto', 'catalogo', 'index',
    'favicon', 'robots', 'sitemap',
  ];
  if (BYPASS.some(r => slug.startsWith(r))) {
    return next();
  }

  // Extensiones de archivo — dejar pasar
  if (/\.\w+$/.test(slug)) {
    return next();
  }

  try {
    // Verificar que el slug existe en la DB
    const res = await fetch(`${API}/proyectos/slug/${slug}`, {
      headers: { 'Content-Type': 'application/json' },
      cf: { cacheTtl: 60 }, // cache 60s en el edge
    });

    if (!res.ok) {
      // Slug no existe → 404 limpio
      return new Response('Micrositio no encontrado', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Slug válido → servir proyecto.html
    const htmlRes = await fetch(new URL('/proyecto.html', request.url));
    const html    = await htmlRes.text();

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });

  } catch (err) {
    // Error de red → dejar pasar (failsafe)
    return next();
  }
}
