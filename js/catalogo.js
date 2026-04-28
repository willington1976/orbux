// ============================================================
// ORBUX · catalogo.js  (ES Module)
// Fase 3 — catálogo desacoplado del HTML
// ============================================================

import { getProyectos } from './api.js';
import { parseJSON, getParam, getPrecio, getAnio, getArea, getKm, formatPrice } from './utils.js';
import { TIPOS_INMO, TIPOS_VEH } from './data.js';
import { WA_DEFAULT } from './config.js';

// ─── ESTADO ──────────────────────────────────────────────────
let todosProyectos    = [];
let proyectosFiltrados = [];
let modo              = 'inmobiliaria';

const clienteSlug = getParam('cliente');
const modoParam   = getParam('modo');

// ─── BOOT ────────────────────────────────────────────────────
init();
bindEventos();

// ─── BIND EVENTOS (elimina todos los oninput/onchange/onclick) ─
function bindEventos() {
  document.getElementById('filtroTipo')
    .addEventListener('change', aplicarFiltros);
  document.getElementById('filtroUbicacion')
    .addEventListener('input', aplicarFiltros);
  document.getElementById('filtroPrecioMin')
    .addEventListener('input', aplicarFiltros);
  document.getElementById('filtroPrecioMax')
    .addEventListener('input', aplicarFiltros);
  document.getElementById('filtroAnio')
    .addEventListener('change', aplicarFiltros);
  document.getElementById('btnLimpiar')
    .addEventListener('click', limpiarFiltros);
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  try {
    const todos = await getProyectos();

    // Detectar modo
    if (modoParam) {
      modo = modoParam;
    } else {
      const nVeh = todos.filter(p => TIPOS_VEH.includes(p.tipo_lugar)).length;
      const nInm = todos.filter(p => TIPOS_INMO.includes(p.tipo_lugar)).length;
      if (nVeh > nInm) modo = 'vehiculos';
    }

    // Filtrar por cliente o por modo
    todosProyectos = clienteSlug
      ? todos.filter(p =>
          p.nombre.toLowerCase().includes(clienteSlug.toLowerCase()) ||
          p.ubicacion?.toLowerCase().includes(clienteSlug.toLowerCase()))
      : todos.filter(p =>
          modo === 'vehiculos'
            ? TIPOS_VEH.includes(p.tipo_lugar)
            : TIPOS_INMO.includes(p.tipo_lugar));

    configurarUI();
    proyectosFiltrados = [...todosProyectos];
    renderCatalogo();
  } catch {
    document.getElementById('catalogoGrid').innerHTML =
      '<div class="loading-state">Error cargando el catálogo</div>';
  }
}

// ─── UI DINÁMICA ──────────────────────────────────────────────
function configurarUI() {
  const esVeh = modo === 'vehiculos';

  document.getElementById('heroEyebrow').textContent =
    esVeh ? 'concesionaria · inventario' : 'inmobiliaria · propiedades';
  document.getElementById('heroTitle').innerHTML =
    esVeh ? 'Encuentra tu próximo <em>vehículo</em>' : 'Encuentra tu próxima <em>propiedad</em>';
  document.getElementById('heroDesc').textContent =
    esVeh
      ? 'Explora nuestro inventario de vehículos. Haz clic en cualquier ítem para ver todos los detalles y fotos.'
      : 'Explora todas las propiedades disponibles. Haz clic para ver fotos aéreas, ubicación y detalles completos.';
  document.getElementById('navSub').textContent = esVeh ? 'Vehículos' : 'Propiedades';

  // Llenar select tipos
  const tipos = esVeh ? TIPOS_VEH : TIPOS_INMO;
  const selTipo = document.getElementById('filtroTipo');
  tipos.forEach(t => {
    const opt = document.createElement('option');
    opt.value       = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    selTipo.appendChild(opt);
  });

  // Filtro año — solo vehículos
  if (esVeh) {
    document.getElementById('filtroAnio').style.display = 'block';
    const anios = [...new Set(todosProyectos.map(p => getAnio(p)).filter(Boolean))].sort().reverse();
    const selAnio = document.getElementById('filtroAnio');
    anios.forEach(a => {
      const o = document.createElement('option');
      o.value = a; o.textContent = a;
      selAnio.appendChild(o);
    });
  }

  // WhatsApp del primer proyecto o default
  if (todosProyectos.length && todosProyectos[0].whatsapp) {
    document.getElementById('waFloat').href =
      `https://wa.me/${todosProyectos[0].whatsapp}`;
  }
}

// ─── FILTROS ─────────────────────────────────────────────────
function aplicarFiltros() {
  const tipo      = document.getElementById('filtroTipo').value.toLowerCase();
  const ubicacion = document.getElementById('filtroUbicacion').value.toLowerCase();
  const precioMin = formatPrice(document.getElementById('filtroPrecioMin').value) || 0;
  const precioMax = formatPrice(document.getElementById('filtroPrecioMax').value) || Infinity;
  const anio      = document.getElementById('filtroAnio').value;

  proyectosFiltrados = todosProyectos.filter(p => {
    if (tipo     && p.tipo_lugar !== tipo) return false;
    if (ubicacion && !p.ubicacion?.toLowerCase().includes(ubicacion)) return false;
    if (anio     && getAnio(p) !== anio) return false;
    const precio = formatPrice(getPrecio(p));
    if (precio && (precio < precioMin || precio > precioMax)) return false;
    return true;
  });

  renderCatalogo();
}

function limpiarFiltros() {
  ['filtroTipo','filtroUbicacion','filtroPrecioMin','filtroPrecioMax','filtroAnio']
    .forEach(id => { document.getElementById(id).value = ''; });
  proyectosFiltrados = [...todosProyectos];
  renderCatalogo();
}

// ─── RENDER ───────────────────────────────────────────────────
function renderCatalogo() {
  const grid = document.getElementById('catalogoGrid');
  const count = document.getElementById('filtrosCount');
  count.textContent = `${proyectosFiltrados.length} resultado${proyectosFiltrados.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';

  if (!proyectosFiltrados.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<h3>Sin resultados</h3><p>Intenta con otros filtros o consulta directamente por WhatsApp.</p>';
    grid.appendChild(empty);
    return;
  }

  proyectosFiltrados.forEach(p => {
    grid.appendChild(crearCard(p));
  });
}

function crearCard(p) {
  const esVeh      = modo === 'vehiculos';
  const fotos      = p.fotos || [];
  const fotoPortada = p.hero_foto || (fotos.length ? fotos[0].url : '');
  const precio     = getPrecio(p);
  const anio       = getAnio(p);
  const area       = getArea(p);
  const km         = getKm(p);
  const wa         = p.whatsapp || WA_DEFAULT;
  const waMsg      = encodeURIComponent(`Hola, vi el catálogo de ORBUX y me interesa: ${p.nombre}`);

  const card = document.createElement('div');
  card.className = 'item-card';
  card.addEventListener('click', () => verMicrositio(p.id));

  // Foto
  const fotoDiv = document.createElement('div');
  fotoDiv.className = 'item-foto';
  if (fotoPortada) {
    const img = document.createElement('img');
    img.src     = fotoPortada;
    img.alt     = p.nombre;
    img.loading = 'lazy';
    fotoDiv.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className   = 'item-foto-placeholder';
    ph.textContent = 'Sin foto';
    fotoDiv.appendChild(ph);
  }

  const badge = document.createElement('span');
  badge.className   = 'item-badge';
  badge.textContent = p.tipo_lugar || 'propiedad';
  fotoDiv.appendChild(badge);

  if (precio) {
    const badgePrecio = document.createElement('span');
    badgePrecio.className   = 'item-badge-tipo';
    badgePrecio.textContent = precio;
    fotoDiv.appendChild(badgePrecio);
  }

  // Body
  const body = document.createElement('div');
  body.className = 'item-body';

  const nombre = document.createElement('div');
  nombre.className   = 'item-nombre';
  nombre.textContent = p.nombre;

  const ubicacion = document.createElement('div');
  ubicacion.className   = 'item-ubicacion';
  ubicacion.textContent = p.ubicacion || '';

  // Specs
  const specs = document.createElement('div');
  specs.className = 'item-specs';
  const specsItems = esVeh
    ? [[anio, 'Modelo'], [km, 'Km']]
    : [[area, 'Área'], [p.ubicacion, '']];
  specsItems.forEach(([val, label]) => {
    if (!val) return;
    const sp = document.createElement('span');
    sp.className = 'item-spec';
    sp.innerHTML = label
      ? `<strong>${val}</strong> ${label}`
      : val;
    specs.appendChild(sp);
  });

  // Precio
  const precioEl = document.createElement('div');
  precioEl.className = 'item-precio';
  if (precio) {
    precioEl.innerHTML = `${precio} <span>· Consultar</span>`;
  } else {
    precioEl.textContent = 'Precio a consultar';
    precioEl.style.fontSize = '14px';
    precioEl.style.color = 'rgba(245,242,235,0.4)';
  }

  // CTAs
  const ctaDiv = document.createElement('div');
  ctaDiv.className = 'item-cta';

  const btnVer = document.createElement('button');
  btnVer.className   = 'btn-ver';
  btnVer.textContent = 'Ver detalles →';
  btnVer.addEventListener('click', e => {
    e.stopPropagation();
    verMicrositio(p.slug, p.id);
  });

  const btnWa = document.createElement('button');
  btnWa.className = 'btn-wa-small';
  btnWa.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.625a.75.75 0 00.918.918l5.771-1.476A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.807-.536-5.393-1.471l-.385-.229-3.99 1.021 1.023-3.877-.247-.396A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>`;
  btnWa.addEventListener('click', e => {
    e.stopPropagation();
    window.open(`https://wa.me/${wa}?text=${waMsg}`, '_blank');
  });

  ctaDiv.append(btnVer, btnWa);
  body.append(nombre, ubicacion, specs, precioEl, ctaDiv);
  card.append(fotoDiv, body);
  return card;
}

function verMicrositio(slug, id) {
  const url = slug ? `/${slug}` : `/proyecto.html?id=${id}`;
  window.open(url, '_blank');
}
