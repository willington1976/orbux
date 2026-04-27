// ============================================================
// ORBUX · proyecto.js  (ES Module)
// Fase 3 — micrositio desacoplado del HTML
// ============================================================

import { getProyectos } from './api.js';
import { parseJSON, getTipoGrupo, getParam, buildWaUrl, copyToClipboard } from './utils.js';
import { TEMAS, AMENIDADES_INFO, COPY } from './data.js';
import { WA_DEFAULT } from './config.js';

// ─── ESTADO ──────────────────────────────────────────────────
let todasFotos       = [];
let fotosPorCategoria = {};
let videoUrl         = '';
let p                = null;

// ─── BOOT ────────────────────────────────────────────────────
const proyectoId = getParam('id');
if (proyectoId) {
  cargarProyecto();
} else {
  renderEjemplo();
}

bindEventosEstaticos();

// ─── EVENTOS ESTÁTICOS (lightbox, share) ─────────────────────
function bindEventosEstaticos() {
  const closeBtn = document.getElementById('lightboxClose');
  const lightbox  = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', cerrarLightbox);
  if (lightbox)  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) cerrarLightbox();
  });
}

// ─── CARGA DATOS ─────────────────────────────────────────────
async function cargarProyecto() {
  try {
    const proyectos = await getProyectos();
    p = proyectos.find(x => x.id == proyectoId);
    if (!p) { renderEjemplo(); return; }

    aplicarTema(p.color_acento || 'dorado');
    document.title = `${p.nombre} · ORBUX`;
    document.getElementById('navLogo').textContent = p.nombre;

    const fotos = p.fotos || [];
    todasFotos = fotos.map(f => f.url);
    fotosPorCategoria = { todas: todasFotos };
    fotos.forEach(f => {
      const cat = f.categoria || 'general';
      if (!fotosPorCategoria[cat]) fotosPorCategoria[cat] = [];
      fotosPorCategoria[cat].push(f.url);
    });

    videoUrl = p.video360 || '';
    const wa     = p.whatsapp || WA_DEFAULT;
    const waMsg  = `Hola, vi el micrositio de ${p.nombre} y me interesa más información`;
    const waUrl  = buildWaUrl(wa, waMsg);

    document.getElementById('waFloat').href = waUrl;
    renderSecciones(p, waUrl);
  } catch {
    renderEjemplo();
  }
}

// ─── TEMA ─────────────────────────────────────────────────────
function aplicarTema(color) {
  const clases = Object.values(TEMAS);
  document.body.classList.remove(...clases);
  if (TEMAS[color]) document.body.classList.add(TEMAS[color]);
}

// ─── RENDER SECCIONES ────────────────────────────────────────
function renderSecciones(proyecto, waUrl) {
  const grupo      = getTipoGrupo(proyecto.tipo_lugar || 'finca');
  const cp         = COPY[grupo] || COPY.turismo;
  const modulos    = parseJSON(proyecto.modulos, ['galeria','amenidades','alojamiento','video360','mapa','contacto']);
  const amenidades = parseJSON(proyecto.amenidades, []);
  const alojamientos = parseJSON(proyecto.alojamientos, []);

  // Nav CTA
  const navCta = document.getElementById('navCta');
  if (navCta) navCta.textContent = cp.navCta;

  const statsData = parseJSON(proyecto.stats, []).length > 0
    ? parseJSON(proyecto.stats, [])
    : cp.statsDef || cp.statsDefault || [];

  // Hero title — primera palabra normal, resto en itálica
  const partes    = proyecto.nombre.split(' ');
  const heroTitle = partes.length > 1
    ? `${partes[0]}<br><em>${partes.slice(1).join(' ')}</em>`
    : proyecto.nombre;

  const heroBg = proyecto.hero_foto
    ? `background-image:url('${proyecto.hero_foto}')`
    : `background-image:url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80')`;

  const heroVideoHtml = proyecto.hero_tipo === 'video' && proyecto.hero_video
    ? `<video autoplay muted loop playsinline><source src="${proyecto.hero_video}" type="video/mp4"></video>`
    : '';

  let html = `
  <div class="hero">
    <div class="hero-bg" style="${heroBg}">${heroVideoHtml}</div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-tag">${proyecto.ubicacion || 'Colombia'} · ${proyecto.tipo_lugar || ''}</div>
      <h1>${heroTitle}</h1>
      <p class="hero-desc">${proyecto.tagline || proyecto.descripcion || cp.heroTagDef || cp.heroTagDefault || ''}</p>
      <div class="hero-btns">
        <a href="#galeria" class="btn-ac">${cp.heroBtn1}</a>
        <a href="#contacto" class="btn-ow">${cp.heroBtn2}</a>
      </div>
    </div>
  </div>

  <div class="intro-bg">
    <div class="intro-inner">
      <div class="intro-text">
        <span class="eyebrow">${cp.introEyebrow}</span>
        <div class="sec-title">${proyecto.nombre}</div>
        <p>${proyecto.descripcion || (cp.heroTagDef || cp.heroTagDefault || '')}</p>
        <p>${cp.introDesc2}</p>
        <div class="intro-stats">
          ${statsData.map(s =>
            `<div class="stat">
              <div class="stat-num">${s.num}</div>
              <div class="stat-lbl">${s.lbl}</div>
            </div>`
          ).join('')}
        </div>
      </div>
      <div class="intro-img">
        ${todasFotos.length > 1
          ? `<img src="${todasFotos[1]}" alt="${proyecto.nombre}">`
          : `<img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" alt="${proyecto.nombre}">`
        }
        <div class="intro-badge">"${proyecto.tagline || (cp.footerTag || '')}"</div>
      </div>
    </div>
  </div>`;

  modulos.forEach(mod => {
    if (mod === 'galeria') {
      const cats = Object.keys(fotosPorCategoria)
        .filter(c => c !== 'todas' && fotosPorCategoria[c].length > 0);
      const tabsExtra = cats.map(c =>
        `<button class="gtab" data-cat="${c}">${c.replace('_', ' ')}</button>`
      ).join('');
      html += `
      <section id="galeria">
        <span class="eyebrow">Galería</span>
        <div class="sec-title">Descubre cada rincón</div>
        <div class="galeria-tabs">
          <button class="gtab active" data-cat="todas">Todas</button>
          ${tabsExtra}
        </div>
        <div class="galeria-grid" id="galeriaGrid"></div>
      </section>`;
    }

    if (mod === 'amenidades' && amenidades.length) {
      const aItems = amenidades.map(a => {
        const info       = AMENIDADES_INFO[a] || { label: a, desc: '' };
        const tieneFotos = fotosPorCategoria[a]?.length > 0;
        const claseExtra = tieneFotos ? ' amenidad-clickeable' : '';
        const verFotos   = tieneFotos
          ? '<span style="font-size:10px;color:var(--ac);letter-spacing:1px;margin-top:8px;display:block;">Ver fotos →</span>'
          : '';
        return `<div class="amenidad${claseExtra}" data-cat="${a}">
          <span class="amenidad-icon-emoji icon-${a}"></span>
          <h3>${info.label}</h3>
          <p>${info.desc}</p>
          ${verFotos}
        </div>`;
      }).join('');
      html += `
      <div class="amenidades-bg">
        <div class="amenidades-inner">
          <span class="eyebrow">¿Qué puedes disfrutar aquí?</span>
          <div class="sec-title">Experiencias para <em>recordar</em></div>
          <div class="amenidades-grid" id="amenidadesGrid">${aItems}</div>
        </div>
      </div>`;
    }

    if (mod === 'alojamiento' && alojamientos.length) {
      const alojItems = alojamientos.map((a, i) => `
        <div class="aloj-card">
          <div class="aloj-card-img">
            ${todasFotos[i]
              ? `<img src="${todasFotos[i]}" alt="${a.nombre}" style="width:100%;height:100%;object-fit:cover;">`
              : `<span>foto próximamente</span>`}
          </div>
          <div class="aloj-body">
            <h3>${a.nombre}</h3>
            <p>Espacio cómodo y bien equipado para tu estadía perfecta.</p>
            <span class="aloj-tag">${a.capacidad || 'consultar'}</span>
          </div>
        </div>`).join('');
      html += `
      <section>
        <span class="eyebrow">Dónde dormir</span>
        <div class="sec-title">Espacios de <em>descanso</em></div>
        <div class="aloj-grid">${alojItems}</div>
      </section>`;
    }

    if (mod === 'video360') {
      html += `
      <div class="video360-bg" id="video360">
        <div class="video-inner">
          <span class="eyebrow">Recorrido virtual</span>
          <div class="sec-title">Explora como si <em>ya estuvieras aquí</em></div>
          <p>Recorre cada rincón en 360°. Capturado con Insta360 X5 para vivir la experiencia antes de llegar.</p>
          <div class="video-container" id="videoContainer">
            <div class="video-placeholder" id="videoPlaceholder">
              <div class="video-overlay"></div>
              <div class="play-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--negro)">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    if (mod === 'mapa') {
      const mapaQuery = proyecto.ubicacion_mapa || proyecto.ubicacion || 'Yopal Casanare Colombia';
      html += `
      <div class="mapa-bg">
        <div class="mapa-inner">
          <div class="mapa-text">
            <span class="eyebrow">${cp.mapaEyebrow}</span>
            <div class="sec-title">${cp.mapaTitulo}</div>
            <p>${proyecto.ubicacion || 'Colombia'}</p>
            <ul class="mapa-puntos">
              ${(cp.mapaPuntos || []).map(pt => `<li>${pt}</li>`).join('')}
            </ul>
            <a href="#contacto" class="btn-ac" style="margin-top:2rem;">${cp.mapaBtn}</a>
          </div>
          <div class="mapa-embed">
            <iframe
              src="https://maps.google.com/maps?q=${encodeURIComponent(mapaQuery)}&output=embed"
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>`;
    }

    if (mod === 'contacto') {
      const shareMsg = encodeURIComponent((cp.shareMsg || 'Mira esto: ') + window.location.href);
      html += `
      <div class="share-strip">
        <p>Compartir</p>
        <button class="share-btn" id="btnCopiarLink">Copiar link</button>
        <a class="share-btn" href="https://wa.me/?text=${shareMsg}" target="_blank">WhatsApp</a>
      </div>
      <div class="cta-bg" id="contacto">
        <span class="eyebrow">${cp.ctaEyebrow}</span>
        <h2>${cp.ctaH2}</h2>
        <p class="cta-sub">${cp.ctaSub}</p>
        <p class="cta-microcopy">${cp.ctaMicro}</p>
        <div class="cta-btns">
          <a class="btn-wa" href="${waUrl}" target="_blank">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.625a.75.75 0 00.918.918l5.771-1.476A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.807-.536-5.393-1.471l-.385-.229-3.99 1.021 1.023-3.877-.247-.396A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            ${cp.ctaWa}
          </a>
          <button class="btn-ac" id="btnCompartir">Compartir este micrositio</button>
        </div>
      </div>
      <footer>
        <p class="footer-tagline">"${proyecto.tagline || (cp.footerTag || '')}"</p>
        <p>${proyecto.nombre} · ${proyecto.ubicacion || 'Colombia'}</p>
        <p style="margin-top:0.75rem;font-size:10px;letter-spacing:2px;color:rgba(245,242,235,0.2);">
          Micrositio producido por
          <a href="https://orbux.site" target="_blank">ORBUX</a> · Fotografía aérea profesional
        </p>
      </footer>`;
    }
  });

  document.getElementById('contenido').innerHTML = html;

  // Bind eventos dinámicos — después de insertar el HTML
  bindEventosDinamicos();

  if (todasFotos.length) renderGaleria(todasFotos);
}

// ─── EVENTOS DINÁMICOS (se crean junto al HTML) ───────────────
function bindEventosDinamicos() {
  // Tabs de galería
  document.querySelectorAll('.gtab').forEach(btn => {
    btn.addEventListener('click', () => filtrar(btn.dataset.cat, btn));
  });

  // Amenidades clickeables
  document.querySelectorAll('.amenidad-clickeable').forEach(el => {
    el.addEventListener('click', () => filtrarDesdeAmenidad(el.dataset.cat));
  });

  // Video placeholder
  const placeholder = document.getElementById('videoPlaceholder');
  if (placeholder) placeholder.addEventListener('click', cargarVideo);

  // Copiar link
  const btnCopiar = document.getElementById('btnCopiarLink');
  if (btnCopiar) btnCopiar.addEventListener('click', handleCopiarLink);

  const btnCompartir = document.getElementById('btnCompartir');
  if (btnCompartir) btnCompartir.addEventListener('click', handleCopiarLink);
}

// ─── GALERÍA ─────────────────────────────────────────────────
function renderGaleria(urls) {
  const g = document.getElementById('galeriaGrid');
  if (!g) return;

  if (!urls?.length) {
    g.innerHTML = '<p class="galeria-empty-msg">Fotos próximamente</p>';
    g.style.display = 'block';
    return;
  }

  const n = urls.length;
  if (n === 1)      g.style.gridTemplateColumns = '1fr';
  else if (n === 2) g.style.gridTemplateColumns = '1fr 1fr';
  else              g.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))';

  g.innerHTML = '';
  urls.forEach((url, i) => {
    const img = document.createElement('img');
    img.src         = url;
    img.alt         = `Foto ${i + 1}`;
    img.loading     = 'lazy';
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

  if (cat === 'todas') { renderGaleria(todasFotos); return; }
  const filtradas = fotosPorCategoria[cat];
  renderGaleria(filtradas?.length ? filtradas : todasFotos);
}

function filtrarDesdeAmenidad(cat) {
  const galeria = document.getElementById('galeria');
  if (galeria) galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ─── SHARE ───────────────────────────────────────────────────
async function handleCopiarLink() {
  const ok = await copyToClipboard(window.location.href);
  if (ok) alert('Link copiado: ' + window.location.href);
}

// ─── EJEMPLO (sin ID en URL) ──────────────────────────────────
function renderEjemplo() {
  const ejemploP = {
    nombre: 'Finca Villa Rica', tipo_lugar: 'finca',
    ubicacion: 'Yopal, Casanare', whatsapp: WA_DEFAULT,
    tagline: 'Escápate a la tranquilidad del llano',
    descripcion: 'Un refugio campestre con piscina, cabañas y todo lo que necesitas.',
    color_acento: 'dorado', hero_tipo: 'imagen',
    hero_foto: '', video360: '', ubicacion_mapa: 'Yopal Casanare',
    modulos: ['galeria','amenidades','alojamiento','video360','mapa','contacto'],
    amenidades: ['piscina','zonas_verdes','bbq','wifi','parking','eventos'],
    alojamientos: [
      { nombre: 'Cabaña privada', capacidad: '2-4 personas' },
      { nombre: 'Habitación doble', capacidad: '2 personas' },
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
    todas: todasFotos,
    aerea: todasFotos.slice(0, 2),
    espacios: todasFotos.slice(2, 4),
    naturaleza: todasFotos.slice(4),
    piscina: [todasFotos[1]],
    zonas_verdes: [todasFotos[2], todasFotos[3]],
  };

  const waUrl = buildWaUrl(WA_DEFAULT, 'Hola, vi el micrositio y me interesa más información');
  document.getElementById('waFloat').href = waUrl;
  renderSecciones(ejemploP, waUrl);
}
