// ============================================================
// ORBUX · ui/secciones.js
// Fase 4+5 — constructores de DOM puros, sin innerHTML masivo
// Cada función recibe datos y devuelve un Node listo para montar
// ============================================================

import { AMENIDADES_INFO } from '../data.js';

const WA_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.625a.75.75 0 00.918.918l5.771-1.476A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.807-.536-5.393-1.471l-.385-.229-3.99 1.021 1.023-3.877-.247-.396A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
</svg>`;

// ─── HELPERS INTERNOS ─────────────────────────────────────────

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls)  e.className   = cls;
  if (text) e.textContent = text;
  return e;
}

function eyebrow(text) {
  return el('span', 'eyebrow', text);
}

function secTitle(html) {
  const h = document.createElement('div');
  h.className   = 'sec-title';
  h.innerHTML   = html; // solo para títulos con <em> — datos internos controlados
  return h;
}

// ─── HERO ─────────────────────────────────────────────────────
export function buildHero({ p, cp, heroTitle, heroBg, heroVideoHtml }) {
  const hero = el('div', 'hero');

  const bg = el('div', 'hero-bg');
  bg.style.cssText = heroBg;
  if (heroVideoHtml) bg.innerHTML = heroVideoHtml;

  const overlay = el('div', 'hero-overlay');

  const content = el('div', 'hero-content');

  const tag = el('div', 'hero-tag');
  tag.textContent = `${p.ubicacion || 'Colombia'} · ${p.tipo_lugar || ''}`;

  const h1 = document.createElement('h1');
  h1.innerHTML = heroTitle;

  const desc = el('p', 'hero-desc');
  desc.textContent = p.tagline || p.descripcion || cp.heroTagDef || '';

  const btns = el('div', 'hero-btns');

  const btn1 = document.createElement('a');
  btn1.href      = '#galeria';
  btn1.className = 'btn-ac';
  btn1.textContent = cp.heroBtn1;

  const btn2 = document.createElement('a');
  btn2.href      = '#contacto';
  btn2.className = 'btn-ow';
  btn2.textContent = cp.heroBtn2;

  btns.append(btn1, btn2);
  content.append(tag, h1, desc, btns);
  hero.append(bg, overlay, content);
  return hero;
}

// ─── INTRO ────────────────────────────────────────────────────
export function buildIntro({ p, cp, statsData, fotoSecundaria }) {
  const bg = el('div', 'intro-bg');
  const inner = el('div', 'intro-inner');

  // Texto
  const txt = el('div', 'intro-text');
  txt.appendChild(eyebrow(cp.introEyebrow));
  txt.appendChild(secTitle(p.nombre));

  const p1 = el('p');
  p1.textContent = p.descripcion || cp.heroTagDef || '';
  const p2 = el('p');
  p2.textContent = cp.introDesc2;
  txt.append(p1, p2);

  const stats = el('div', 'intro-stats');
  statsData.forEach(s => {
    const stat = el('div', 'stat');
    const num  = el('div', 'stat-num', s.num);
    const lbl  = el('div', 'stat-lbl', s.lbl);
    stat.append(num, lbl);
    stats.appendChild(stat);
  });
  txt.appendChild(stats);

  // Imagen
  const imgWrap = el('div', 'intro-img');
  const img = document.createElement('img');
  img.src = fotoSecundaria || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80';
  img.alt = p.nombre;

  const badge = el('div', 'intro-badge');
  badge.textContent = `"${p.tagline || cp.footerTag || ''}"`;

  imgWrap.append(img, badge);
  inner.append(txt, imgWrap);
  bg.appendChild(inner);
  return bg;
}

// ─── GALERÍA ──────────────────────────────────────────────────
export function buildGaleria(cats) {
  const section = document.createElement('section');
  section.id = 'galeria';

  section.appendChild(eyebrow('Galería'));
  section.appendChild(secTitle('Descubre cada rincón'));

  const tabs = el('div', 'galeria-tabs');

  const btnTodas = el('button', 'gtab active');
  btnTodas.dataset.cat = 'todas';
  btnTodas.textContent = 'Todas';
  tabs.appendChild(btnTodas);

  cats.forEach(cat => {
    const btn = el('button', 'gtab');
    btn.dataset.cat  = cat;
    btn.textContent  = cat.replace('_', ' ');
    tabs.appendChild(btn);
  });

  const grid = el('div', 'galeria-grid');
  grid.id = 'galeriaGrid';

  section.append(tabs, grid);
  return section;
}

// ─── AMENIDADES ───────────────────────────────────────────────
export function buildAmenidades({ amenidades, fotosPorCategoria }) {
  const bg = el('div', 'amenidades-bg');
  const inner = el('div', 'amenidades-inner');

  inner.appendChild(eyebrow('¿Qué puedes disfrutar aquí?'));
  inner.appendChild(secTitle('Experiencias para <em>recordar</em>'));

  const grid = el('div', 'amenidades-grid');
  grid.id = 'amenidadesGrid';

  amenidades.forEach(a => {
    const info       = AMENIDADES_INFO[a] || { label: a, desc: '' };
    const tieneFotos = fotosPorCategoria[a]?.length > 0;

    const card = el('div', `amenidad${tieneFotos ? ' amenidad-clickeable' : ''}`);
    card.dataset.cat = a;

    const icon = el('span', `amenidad-icon-emoji icon-${a}`);
    const h3   = el('h3', null, info.label);
    const p    = el('p',  null, info.desc);

    card.append(icon, h3, p);

    if (tieneFotos) {
      const ver = el('span');
      ver.style.cssText = 'font-size:10px;color:var(--ac);letter-spacing:1px;margin-top:8px;display:block;';
      ver.textContent = 'Ver fotos →';
      card.appendChild(ver);
    }

    grid.appendChild(card);
  });

  inner.appendChild(grid);
  bg.appendChild(inner);
  return bg;
}

// ─── ALOJAMIENTO ──────────────────────────────────────────────
export function buildAlojamiento({ alojamientos, todasFotos }) {
  const section = document.createElement('section');

  section.appendChild(eyebrow('Dónde dormir'));
  section.appendChild(secTitle('Espacios de <em>descanso</em>'));

  const grid = el('div', 'aloj-grid');

  alojamientos.forEach((a, i) => {
    const card = el('div', 'aloj-card');

    const imgWrap = el('div', 'aloj-card-img');
    if (todasFotos[i]) {
      const img = document.createElement('img');
      img.src   = todasFotos[i];
      img.alt   = a.nombre;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      imgWrap.appendChild(img);
    } else {
      imgWrap.textContent = 'foto próximamente';
    }

    const body = el('div', 'aloj-body');
    const h3   = el('h3', null, a.nombre);
    h3.style.fontFamily = "'Playfair Display', serif";
    const p    = el('p',  null, 'Espacio cómodo y bien equipado para tu estadía perfecta.');
    const tag  = el('span', 'aloj-tag', a.capacidad || 'consultar');

    body.append(h3, p, tag);
    card.append(imgWrap, body);
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

// ─── VIDEO 360 ────────────────────────────────────────────────
export function buildVideo360() {
  const bg = el('div', 'video360-bg');
  bg.id = 'video360';

  const inner = el('div', 'video-inner');
  inner.appendChild(eyebrow('Recorrido virtual'));
  inner.appendChild(secTitle('Explora como si <em>ya estuvieras aquí</em>'));

  const p = el('p');
  p.textContent = 'Recorre cada rincón en 360°. Capturado con Insta360 X5 para vivir la experiencia antes de llegar.';

  const container = el('div', 'video-container');
  container.id = 'videoContainer';

  const placeholder = el('div', 'video-placeholder');
  placeholder.id = 'videoPlaceholder';

  const overlay = el('div', 'video-overlay');

  const playBtn = el('div', 'play-btn');
  playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--negro)">
    <polygon points="5,3 19,12 5,21"/>
  </svg>`;

  placeholder.append(overlay, playBtn);
  container.appendChild(placeholder);
  inner.append(p, container);
  bg.appendChild(inner);
  return bg;
}

// ─── MAPA ─────────────────────────────────────────────────────
export function buildMapa({ p, cp }) {
  const bg    = el('div', 'mapa-bg');
  const inner = el('div', 'mapa-inner');

  // ── Texto ──
  const txt = el('div', 'mapa-text');
  txt.appendChild(eyebrow(cp.mapaEyebrow));
  txt.appendChild(secTitle(cp.mapaTitulo));

  const loc = el('p');
  loc.textContent = p.ubicacion || 'Colombia';

  const ul = el('ul', 'mapa-puntos');
  (cp.mapaPuntos || []).forEach(pt => {
    const li = el('li', null, pt);
    ul.appendChild(li);
  });

  // ── Botones de navegación ──
  const destino   = p.ubicacion_mapa || p.ubicacion || 'Colombia';
  const esCoords  = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(destino.trim());
  const encodedQ  = encodeURIComponent(destino);
  const [lat, lng] = esCoords
    ? destino.split(',').map(s => s.trim())
    : [null, null];

  const gmUrl = esCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodedQ}`;

  const wazeUrl = esCoords
    ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodedQ}&navigate=yes`;

  const navBtns = el('div', 'mapa-nav-btns');

  const btnGm = document.createElement('a');
  btnGm.href      = gmUrl;
  btnGm.target    = '_blank';
  btnGm.rel       = 'noopener noreferrer';
  btnGm.className = 'mapa-nav-btn';
  btnGm.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
  </svg> Google Maps`;

  const btnWaze = document.createElement('a');
  btnWaze.href      = wazeUrl;
  btnWaze.target    = '_blank';
  btnWaze.rel       = 'noopener noreferrer';
  btnWaze.className = 'mapa-nav-btn mapa-nav-btn--waze';
  btnWaze.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm3.5 14c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-7 0c-.8 0-1.5-.7-1.5-1.5S7.7 12 8.5 12s1.5.7 1.5 1.5S9.3 15.5 8.5 15.5zm7-5c-.4 0-.8-.1-1.1-.4-.3.3-.7.4-1.1.4-.8 0-1.5-.6-1.5-1.4 0-.5.3-1 .7-1.2-.1-.2-.1-.5-.1-.7 0-1.1.9-2 2-2s2 .9 2 2c0 .3-.1.5-.1.7.4.3.7.7.7 1.2 0 .8-.7 1.4-1.5 1.4z"/>
  </svg> Waze`;

  navBtns.append(btnGm, btnWaze);
  txt.append(loc, ul, navBtns);

  // ── Mapa embed ──
  const mapDiv = el('div', 'mapa-embed');
  const query  = encodeURIComponent(destino);
  const iframe = document.createElement('iframe');
  iframe.src   = `https://maps.google.com/maps?q=${query}&output=embed`;
  iframe.loading = 'lazy';
  iframe.setAttribute('allowfullscreen', '');
  mapDiv.appendChild(iframe);

  inner.append(txt, mapDiv);
  bg.appendChild(inner);
  return bg;
}

// ─── SHARE STRIP ─────────────────────────────────────────────
export function buildShareStrip({ cp }) {
  const strip = el('div', 'share-strip');

  const lbl = el('p', null, 'Compartir');

  const btnCopiar = el('button', 'share-btn');
  btnCopiar.id          = 'btnCopiarLink';
  btnCopiar.textContent = 'Copiar link';

  const shareMsg = encodeURIComponent((cp.shareMsg || 'Mira esto: ') + window.location.href);
  const btnWa = document.createElement('a');
  btnWa.className   = 'share-btn';
  btnWa.href        = `https://wa.me/?text=${shareMsg}`;
  btnWa.target      = '_blank';
  btnWa.textContent = 'WhatsApp';

  strip.append(lbl, btnCopiar, btnWa);
  return strip;
}

// ─── CTA FINAL ───────────────────────────────────────────────
export function buildCTA({ p, cp, waUrl }) {
  const bg = el('div', 'cta-bg');
  bg.id = 'contacto';

  bg.appendChild(eyebrow(cp.ctaEyebrow));

  const h2 = document.createElement('h2');
  h2.innerHTML = cp.ctaH2;

  const sub = el('p', 'cta-sub');
  sub.textContent = cp.ctaSub;

  const micro = el('p', 'cta-microcopy');
  micro.textContent = cp.ctaMicro;

  const btns = el('div', 'cta-btns');

  const btnWa = document.createElement('a');
  btnWa.className = 'btn-wa';
  btnWa.href      = waUrl;
  btnWa.target    = '_blank';
  btnWa.innerHTML = WA_SVG;
  const waText = document.createTextNode(` ${cp.ctaWa}`);
  btnWa.appendChild(waText);

  const btnCompartir = el('button', 'btn-ac');
  btnCompartir.id          = 'btnCompartir';
  btnCompartir.textContent = 'Compartir este micrositio';

  btns.append(btnWa, btnCompartir);
  bg.append(h2, sub, micro, btns);
  return bg;
}

// ─── FOOTER ──────────────────────────────────────────────────
export function buildFooter({ p, cp }) {
  const footer = document.createElement('footer');

  const tagline = el('p', 'footer-tagline');
  tagline.textContent = `"${p.tagline || cp.footerTag || ''}"`;

  const info = el('p');
  info.textContent = `${p.nombre} · ${p.ubicacion || 'Colombia'}`;

  const orbux = el('p');
  orbux.style.cssText = 'margin-top:0.75rem;font-size:10px;letter-spacing:2px;color:rgba(245,242,235,0.2);';
  orbux.innerHTML = 'Micrositio producido por <a href="https://orbux.site" target="_blank" style="color:var(--ac);">ORBUX</a> · Fotografía aérea profesional';

  footer.append(tagline, info, orbux);
  return footer;
}
