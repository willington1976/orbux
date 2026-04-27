// ============================================================
// ORBUX · proyecto.js  (ES Module)
// Fase 4+5 — lógica de negocio separada del DOM
//            constructores de DOM sin innerHTML masivo
// ============================================================

import { getProyectos, getProyectoPorSlug } from './api.js';
import { parseJSON, getTipoGrupo, getParam, buildWaUrl, copyToClipboard } from './utils.js';
import { TEMAS, COPY } from './data.js';
import { WA_DEFAULT } from './config.js';
import {
  buildHero, buildIntro, buildGaleria, buildAmenidades,
  buildAlojamiento, buildVideo360, buildMapa,
  buildShareStrip, buildCTA, buildFooter,
} from './ui/secciones.js';

// ─── ESTADO ──────────────────────────────────────────────────
let todasFotos        = [];
let fotosPorCategoria = {};
let videoUrl          = '';

// ─── BOOT ────────────────────────────────────────────────────
const proyectoId  = getParam('id');
const proyectoSlug = getParam('slug');

if (proyectoId || proyectoSlug) {
  cargarProyecto();
} else {
  renderEjemplo();
}
bindEventosEstaticos();

// ─── EVENTOS ESTÁTICOS ───────────────────────────────────────
function bindEventosEstaticos() {
  document.getElementById('lightboxClose')
    ?.addEventListener('click', cerrarLightbox);
  document.getElementById('lightbox')
    ?.addEventListener('click', e => {
      if (e.target === e.currentTarget) cerrarLightbox();
    });
}

// ─── CARGA ───────────────────────────────────────────────────
async function cargarProyecto() {
  try {
    let p;

    if (proyectoSlug) {
      // URL amigable: /hotel-luna-roja
      p = await getProyectoPorSlug(proyectoSlug);
    } else {
      // URL clásica: /proyecto.html?id=2
      const proyectos = await getProyectos();
      p = proyectos.find(x => x.id == proyectoId);
    }

    if (!p) { renderEjemplo(); return; }

    // --- Lógica de negocio pura (sin DOM) ---
    aplicarTema(p.color_acento || 'dorado');
    document.title = `${p.nombre} · ORBUX`;
    document.getElementById('navLogo').textContent = p.nombre;

    const fotos = p.fotos || [];
    todasFotos = fotos.map(f => f.url);

    // Organizar fotos por categoría — lógica pura
    fotosPorCategoria = organizarFotosPorCategoria(fotos);

    videoUrl = p.video360 || '';
    const wa    = p.whatsapp || WA_DEFAULT;
    const waMsg = `Hola, vi el micrositio de ${p.nombre} y me interesa más información`;
    const waUrl = buildWaUrl(wa, waMsg);

    document.getElementById('waFloat').href = waUrl;
    montarSecciones(p, waUrl);
  } catch {
    renderEjemplo();
  }
}

// ─── LÓGICA DE NEGOCIO PURA ──────────────────────────────────

/** Organiza fotos en un mapa {categoria: [urls]} — sin efectos de DOM */
function organizarFotosPorCategoria(fotos) {
  const mapa = { todas: fotos.map(f => f.url) };
  fotos.forEach(f => {
    const cat = f.categoria || 'general';
    if (!mapa[cat]) mapa[cat] = [];
    mapa[cat].push(f.url);
  });
  return mapa;
}

/** Calcula qué tabs mostrar — lógica pura */
function calcularTabsExtras() {
  return Object.keys(fotosPorCategoria)
    .filter(c => c !== 'todas' && fotosPorCategoria[c].length > 0);
}

/** Calcula los stats a mostrar — lógica pura */
function calcularStats(p, cp) {
  const stats = parseJSON(p.stats, []);
  return stats.length > 0 ? stats : (cp.statsDef || cp.statsDefault || []);
}

/** Calcula el heroTitle con formato — lógica pura */
function calcularHeroTitle(nombre) {
  const partes = nombre.split(' ');
  return partes.length > 1
    ? `${partes[0]}<br><em>${partes.slice(1).join(' ')}</em>`
    : nombre;
}

// ─── MONTAR SECCIONES (solo orquesta, no construye DOM) ───────
function montarSecciones(p, waUrl) {
  const grupo  = getTipoGrupo(p.tipo_lugar || 'finca');
  const cp     = COPY[grupo] || COPY.turismo;
  const modulos = parseJSON(p.modulos, ['galeria','amenidades','alojamiento','video360','mapa','contacto']);
  const amenidades   = parseJSON(p.amenidades, []);
  const alojamientos = parseJSON(p.alojamientos, []);

  // Nav CTA
  const navCta = document.getElementById('navCta');
  if (navCta) navCta.textContent = cp.navCta;

  const contenido = document.getElementById('contenido');
  contenido.innerHTML = '';

  // Hero
  const heroBg = p.hero_foto
    ? `background-image:url('${p.hero_foto}')`
    : `background-image:url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80')`;
  const heroVideoHtml = p.hero_tipo === 'video' && p.hero_video
    ? `<video autoplay muted loop playsinline><source src="${p.hero_video}" type="video/mp4"></video>`
    : '';

  contenido.appendChild(buildHero({
    p, cp,
    heroTitle: calcularHeroTitle(p.nombre),
    heroBg,
    heroVideoHtml,
  }));

  // Intro
  contenido.appendChild(buildIntro({
    p, cp,
    statsData:       calcularStats(p, cp),
    fotoSecundaria:  todasFotos[1] || '',
  }));

  // Secciones dinámicas
  modulos.forEach(mod => {
    switch (mod) {
      case 'galeria': {
        const tabs = calcularTabsExtras();
        const seccion = buildGaleria(tabs);
        contenido.appendChild(seccion);
        break;
      }
      case 'amenidades':
        if (amenidades.length) {
          contenido.appendChild(buildAmenidades({ amenidades, fotosPorCategoria }));
        }
        break;
      case 'alojamiento':
        if (alojamientos.length) {
          contenido.appendChild(buildAlojamiento({ alojamientos, todasFotos }));
        }
        break;
      case 'video360':
        contenido.appendChild(buildVideo360());
        break;
      case 'mapa':
        contenido.appendChild(buildMapa({ p, cp }));
        break;
      case 'contacto':
        contenido.appendChild(buildShareStrip({ cp }));
        contenido.appendChild(buildCTA({ p, cp, waUrl }));
        contenido.appendChild(buildFooter({ p, cp }));
        break;
    }
  });

  // Bind eventos dinámicos después de montar
  bindEventosDinamicos();
  if (todasFotos.length) renderGaleria(todasFotos);
}

// ─── EVENTOS DINÁMICOS ────────────────────────────────────────
function bindEventosDinamicos() {
  document.querySelectorAll('.gtab').forEach(btn =>
    btn.addEventListener('click', () => filtrar(btn.dataset.cat, btn)));

  document.querySelectorAll('.amenidad-clickeable').forEach(el =>
    el.addEventListener('click', () => filtrarDesdeAmenidad(el.dataset.cat)));

  document.getElementById('videoPlaceholder')
    ?.addEventListener('click', cargarVideo);

  document.getElementById('btnCopiarLink')
    ?.addEventListener('click', handleCopiarLink);

  document.getElementById('btnCompartir')
    ?.addEventListener('click', handleCopiarLink);
}

// ─── GALERÍA ─────────────────────────────────────────────────
function renderGaleria(urls) {
  const g = document.getElementById('galeriaGrid');
  if (!g) return;

  g.innerHTML = '';

  if (!urls?.length) {
    const msg = document.createElement('p');
    msg.className   = 'galeria-empty-msg';
    msg.textContent = 'Fotos próximamente';
    g.appendChild(msg);
    return;
  }

  const n = urls.length;
  g.style.gridTemplateColumns =
    n === 1 ? '1fr' :
    n === 2 ? '1fr 1fr' :
    'repeat(3,minmax(0,1fr))';

  urls.forEach((url, i) => {
    const img = document.createElement('img');
    img.src     = url;
    img.alt     = `Foto ${i + 1}`;
    img.loading = 'lazy';
    if (i === 0 && n >= 3) {
      img.style.gridColumn  = 'span 2';
      img.style.aspectRatio = '16/9';
    } else if (n === 1) {
      img.style.aspectRatio = '16/9';
    }
    img.addEventListener('click', () => abrirLightbox(url));
    g.appendChild(img);
  });
}

function filtrar(cat, btn) {
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtradas = cat === 'todas' ? todasFotos : fotosPorCategoria[cat];
  renderGaleria(filtradas?.length ? filtradas : todasFotos);
}

function filtrarDesdeAmenidad(cat) {
  document.getElementById('galeria')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    const tab = document.querySelector(`.gtab[data-cat="${cat}"]`);
    filtrar(cat, tab);
  }, 600);
}

// ─── VIDEO ────────────────────────────────────────────────────
function cargarVideo() {
  if (!videoUrl) { alert('Video 360° próximamente'); return; }
  const ytId = videoUrl.match(/(?:youtu\.be\/|v=)([^&?]+)/)?.[1];
  const c    = document.getElementById('videoContainer');
  if (c && ytId) {
    c.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${ytId}?autoplay=1"
      allowfullscreen allow="autoplay">
    </iframe>`;
  }
}

// ─── LIGHTBOX ────────────────────────────────────────────────
function abrirLightbox(url) {
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightbox').classList.add('open');
}

function cerrarLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

// ─── TEMA ─────────────────────────────────────────────────────
function aplicarTema(color) {
  document.body.classList.remove(...Object.values(TEMAS));
  if (TEMAS[color]) document.body.classList.add(TEMAS[color]);
}

// ─── SHARE ───────────────────────────────────────────────────
async function handleCopiarLink() {
  await copyToClipboard(window.location.href);
  alert('Link copiado: ' + window.location.href);
}

// ─── EJEMPLO ─────────────────────────────────────────────────
function renderEjemplo() {
  const p = {
    nombre: 'Finca Villa Rica', tipo_lugar: 'finca',
    ubicacion: 'Yopal, Casanare', whatsapp: WA_DEFAULT,
    tagline: 'Escápate a la tranquilidad del llano',
    descripcion: 'Un refugio campestre con piscina, cabañas y todo lo que necesitas.',
    color_acento: 'dorado', hero_tipo: 'imagen',
    hero_foto: '', video360: '', ubicacion_mapa: 'Yopal Casanare',
    modulos: ['galeria','amenidades','alojamiento','video360','mapa','contacto'],
    amenidades: ['piscina','zonas_verdes','bbq','wifi','parking','eventos'],
    alojamientos: [
      { nombre: 'Cabaña privada',    capacidad: '2-4 personas' },
      { nombre: 'Habitación doble',  capacidad: '2 personas'   },
    ],
    fotos: [], stats: [],
  };

  aplicarTema('dorado');
  document.title = 'Finca Villa Rica · ORBUX';
  document.getElementById('navLogo').textContent = 'Finca Villa Rica';

  todasFotos = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  ];

  fotosPorCategoria = {
    todas:       todasFotos,
    aerea:       todasFotos.slice(0, 2),
    espacios:    todasFotos.slice(2, 4),
    naturaleza:  todasFotos.slice(4),
    piscina:     [todasFotos[1]],
    zonas_verdes:[todasFotos[2], todasFotos[3]],
  };

  const waUrl = buildWaUrl(WA_DEFAULT, 'Hola, vi el micrositio y me interesa más información');
  document.getElementById('waFloat').href = waUrl;
  montarSecciones(p, waUrl);
}
