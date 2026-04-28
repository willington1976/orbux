// ============================================================
// ORBUX · admin.js  (ES Module)
// Fase 2 — lógica desacoplada del HTML
// ============================================================

import { guard, login as authLogin, logout as authLogout } from './auth.js';
import {
  getProyectos, getMensajes, saveProyecto, deleteProyecto,
  subirFoto, deleteFoto, updateFotoCategoria, marcarMensajeLeido
} from './api.js';
import { parseJSON, getTipoGrupo } from './utils.js';
import {
  AMENIDADES_POR_TIPO, AMENIDADES_INFO, MODULOS_POR_TIPO,
  ALOJ_HINT, ALOJ_TITLE, CATS_LABELS
} from './data.js';

// ─── ESTADO LOCAL ────────────────────────────────────────────
let uploadId   = null;
let uploadCat  = 'general';

// ─── BOOT ────────────────────────────────────────────────────
(function boot() {
  // Si ya hay sesión válida, mostrar panel directamente
  if (guard()) {
    mostrarAdmin();
  }
  bindEvents();
})();

// ─── BIND EVENTS (reemplaza todos los onclick inline) ────────
function bindEvents() {
  // Login
  document.getElementById('btnLogin')
    .addEventListener('click', handleLogin);
  document.getElementById('loginEmail')
    .addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('loginPassword')
    .addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

  // Logout
  document.getElementById('btnLogout')
    .addEventListener('click', handleLogout);

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab, btn));
  });

  // Nuevo proyecto
  document.getElementById('btnNuevoProyecto')
    .addEventListener('click', abrirModal);

  // Modal — tipo de lugar
  document.getElementById('pTipo')
    .addEventListener('change', e => adaptarFormulario(e.target.value));

  // Modal — tipo de hero
  document.getElementById('pHeroTipo')
    .addEventListener('change', toggleHeroVideo);

  // Modal — presets
  document.querySelectorAll('.preset-opt').forEach(el => {
    el.addEventListener('click', () => selPreset(el));
  });

  // Modal — color picker
  document.getElementById('pColorHex')
    .addEventListener('input', e => {
      document.getElementById('colorLabel').textContent = e.target.value.toUpperCase();
    });

  // Modal — módulos
  document.querySelectorAll('#modulosGrid input').forEach(c => {
    c.addEventListener('change', () =>
      c.closest('.mod-item').classList.toggle('on', c.checked));
  });

  // Modal — botones
  document.getElementById('btnCancelarModal')
    .addEventListener('click', cerrarModal);
  document.getElementById('btnGuardarProyecto')
    .addEventListener('click', guardarProyecto);
  document.getElementById('btnCerrarPaso2')
    .addEventListener('click', () => { cerrarModal(); cargarProyectos(); });

  // Agregar alojamiento / stat
  document.getElementById('btnAgregarAloj')
    .addEventListener('click', () => agregarAloj());
  document.getElementById('btnAgregarStat')
    .addEventListener('click', () => agregarStat());

  // File input (upload fotos)
  document.getElementById('fileInput')
    .addEventListener('change', e => subirFotos(e.target));
}

// ─── AUTH ─────────────────────────────────────────────────────
async function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl  = document.getElementById('loginError');
  errorEl.style.display = 'none';

  try {
    const ok = await authLogin(email, password);
    if (ok) {
      mostrarAdmin();
    } else {
      errorEl.style.display = 'block';
    }
  } catch {
    errorEl.style.display = 'block';
  }
}

function handleLogout() {
  authLogout();
}

function mostrarAdmin() {
  document.getElementById('loginScreen').style.display  = 'none';
  document.getElementById('adminPanel').style.display   = 'block';
  cargarDashboard();
  cargarProyectos();
  cargarMensajes();
}

// ─── TABS ─────────────────────────────────────────────────────
function showTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function cargarDashboard() {
  try {
    const [proyectos, mensajes] = await Promise.all([
      getProyectos(),
      getMensajes(),
    ]);
    const totalFotos = proyectos.reduce((a, p) => a + (p.fotos?.length || 0), 0);
    const sinLeer    = mensajes.filter(m => !m.leido).length;

    document.getElementById('statP').textContent = proyectos.length;
    document.getElementById('statF').textContent = totalFotos;
    document.getElementById('statM').textContent = mensajes.length;
    document.getElementById('statN').textContent = sinLeer;

    const badge = document.getElementById('badgeMensajes');
    badge.innerHTML = sinLeer > 0
      ? `<span class="badge">${sinLeer}</span>`
      : '';
  } catch { /* silencioso */ }
}

// ─── PROYECTOS ────────────────────────────────────────────────
async function cargarProyectos() {
  const list = document.getElementById('proyectosList');
  list.innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const proyectos = await getProyectos();
    if (!proyectos.length) {
      list.innerHTML = '<div class="empty">No hay proyectos. Crea el primero.</div>';
      return;
    }
    list.innerHTML = '';
    proyectos.forEach(p => list.appendChild(crearCardProyecto(p)));
  } catch {
    list.innerHTML = '<div class="empty">Error cargando proyectos</div>';
  }
}

function crearCardProyecto(p) {
  const card = document.createElement('div');
  card.className = 'proyecto-item';

  // Header
  const hdr = document.createElement('div');
  hdr.className = 'proyecto-item-hdr';

  const info = document.createElement('div');
  const titulo = document.createElement('h3');
  titulo.textContent = p.nombre;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${p.tipo_lugar || 'finca'} · ${p.ubicacion || ''} · Tema: ${p.color_acento || 'dorado'}`;
  info.append(titulo, meta);

  const actions = document.createElement('div');
  actions.className = 'proyecto-actions';

  const btnVer = document.createElement('a');
  btnVer.href = `/proyecto.html?id=${p.id}`;
  btnVer.target = '_blank';
  btnVer.className = 'btn btn-outline btn-sm';
  btnVer.textContent = 'Ver micrositio';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'btn btn-outline btn-sm';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', () => editarProyecto(p));

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn btn-danger btn-sm';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.addEventListener('click', () => handleEliminarProyecto(p.id));

  actions.append(btnVer, btnEditar, btnEliminar);
  hdr.append(info, actions);

  // Fotos
  const fotosRow = document.createElement('div');
  fotosRow.className = 'fotos-row';
  fotosRow.id = `fotos-${p.id}`;
  (p.fotos || []).forEach(f => fotosRow.appendChild(crearFotoWrap(f, p.id)));

  const uploadBox = document.createElement('div');
  uploadBox.className = 'upload-box';
  uploadBox.title = 'Subir fotos';
  uploadBox.textContent = '+';
  uploadBox.addEventListener('click', () => {
    uploadId  = p.id;
    uploadCat = 'general';
    document.getElementById('fileInput').click();
  });
  fotosRow.appendChild(uploadBox);

  // Link micrositio
  const linkDiv = document.createElement('div');
  linkDiv.className = 'link-micrositio';
  const urlMicrositio = p.slug
    ? `https://orbux.site/${p.slug}`
    : `/proyecto.html?id=${p.id}`;
  linkDiv.innerHTML = `Link del cliente: <a href="${urlMicrositio}" target="_blank">${urlMicrositio}</a>`;

  card.append(hdr, fotosRow, linkDiv);
  return card;
}

function crearFotoWrap(f, proyectoId) {
  const wrap = document.createElement('div');
  wrap.className = 'foto-wrap';
  wrap.id = `fw-${f.id}`;

  const img = document.createElement('img');
  img.className = 'foto-thumb';
  img.src = f.url;
  img.alt = '';

  const btnDel = document.createElement('button');
  btnDel.className = 'foto-del';
  btnDel.textContent = '✕';
  btnDel.addEventListener('click', () => handleEliminarFoto(f.id, proyectoId));

  const sel = document.createElement('select');
  sel.className = 'foto-cat';
  sel.title = 'Categoría';
  const cats = Object.entries(CATS_LABELS);
  cats.forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    if ((f.categoria || 'general') === val) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () =>
    updateFotoCategoria(f.id, sel.value).catch(console.error));

  wrap.append(img, btnDel, sel);
  return wrap;
}

async function handleEliminarProyecto(id) {
  if (!confirm('¿Eliminar este proyecto y todas sus fotos?')) return;
  await deleteProyecto(id);
  cargarProyectos();
  cargarDashboard();
}

async function handleEliminarFoto(id, proyectoId) {
  if (!confirm('¿Eliminar esta foto?')) return;
  await deleteFoto(id);
  const wrap = document.getElementById(`fw-${id}`);
  if (wrap) wrap.remove();
  cargarDashboard();
}

// ─── MENSAJES ─────────────────────────────────────────────────
async function cargarMensajes() {
  const list = document.getElementById('mensajesList');
  list.innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const mensajes = await getMensajes();
    if (!mensajes.length) {
      list.innerHTML = '<div class="empty">No hay mensajes aún.</div>';
      return;
    }
    list.innerHTML = '';
    mensajes.forEach(m => list.appendChild(crearMensajeEl(m)));
  } catch {
    list.innerHTML = '<div class="empty">Error cargando mensajes</div>';
  }
}

function crearMensajeEl(m) {
  const el = document.createElement('div');
  el.className = `msg-item${m.leido ? ' leido' : ''}`;

  const fecha = new Date(m.created_at).toLocaleDateString('es-CO');
  el.innerHTML = `
    <div class="msg-hdr">
      <div class="msg-nombre">${m.nombre}</div>
      <div class="msg-fecha">${fecha}</div>
    </div>
    <div class="msg-tags">
      ${m.tipo_propiedad ? `<span class="tag">${m.tipo_propiedad}</span>` : ''}
      ${m.servicio ? `<span class="tag">${m.servicio}</span>` : ''}
    </div>
    <div class="msg-texto">${m.mensaje || 'Sin mensaje'}</div>
    <div class="msg-contacto">${m.contacto}</div>
  `;

  if (!m.leido) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.style.marginTop = '1rem';
    btn.textContent = 'Marcar como leído';
    btn.addEventListener('click', async () => {
      await marcarMensajeLeido(m.id);
      cargarMensajes();
      cargarDashboard();
    });
    el.appendChild(btn);
  }

  return el;
}

// ─── MODAL ────────────────────────────────────────────────────
function abrirModal() {
  document.getElementById('modalTitle').textContent = 'Nuevo proyecto';
  document.getElementById('pId').value = '';
  ['pNombre','pUbicacion','pWhatsapp','pTagline','pDescripcion',
   'pHeroFoto','pHeroVideo','pVideo360','pUbicacionMapa']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('pTipo').value     = 'finca';
  document.getElementById('pHeroTipo').value = 'imagen';
  document.getElementById('heroVideoField').style.display = 'none';
  document.getElementById('pPreset').value    = 'luxury';
  document.getElementById('pColorHex').value  = '#D4AF37';
  document.getElementById('colorLabel').textContent = '#D4AF37';
  document.querySelectorAll('.preset-opt').forEach((c, i) =>
    c.classList.toggle('sel', i === 0));
  document.querySelectorAll('#modulosGrid input').forEach(c => {
    c.checked = true;
    c.closest('.mod-item').classList.add('on');
  });
  document.getElementById('alojList').innerHTML  = '';
  document.getElementById('statsList').innerHTML = '';
  adaptarFormulario('finca');
  document.getElementById('modalProyecto').classList.add('open');
}

function editarProyecto(p) {
  document.getElementById('modalTitle').textContent = 'Editar proyecto';
  document.getElementById('pId').value              = p.id;
  document.getElementById('pNombre').value          = p.nombre        || '';
  document.getElementById('pTipo').value            = p.tipo_lugar    || 'finca';
  document.getElementById('pUbicacion').value       = p.ubicacion     || '';
  document.getElementById('pWhatsapp').value        = p.whatsapp      || '';
  document.getElementById('pTagline').value         = p.tagline       || '';
  document.getElementById('pDescripcion').value     = p.descripcion   || '';
  document.getElementById('pHeroFoto').value        = p.hero_foto     || '';
  document.getElementById('pHeroVideo').value       = p.hero_video    || '';
  document.getElementById('pVideo360').value        = p.video360      || '';
  document.getElementById('pUbicacionMapa').value   = p.ubicacion_mapa|| '';
  document.getElementById('pHeroTipo').value        = p.hero_tipo     || 'imagen';
  toggleHeroVideo();

  const presetVal  = p.preset    || 'luxury';
  const colorHex   = p.color_hex || '#D4AF37';
  document.getElementById('pPreset').value   = presetVal;
  document.getElementById('pColorHex').value = colorHex;
  document.getElementById('colorLabel').textContent = colorHex.toUpperCase();
  document.querySelectorAll('.preset-opt').forEach(c =>
    c.classList.toggle('sel', c.dataset.val === presetVal));

  adaptarFormulario(p.tipo_lugar || 'finca');

  const amenidades = parseJSON(p.amenidades, []);
  document.querySelectorAll('#amenidadesCheck input').forEach(c => {
    c.checked = amenidades.includes(c.value);
    c.closest('.chk-item')?.classList.toggle('on', c.checked);
  });

  const modulos = parseJSON(p.modulos, ['galeria','amenidades','alojamiento','video360','mapa','contacto']);
  document.querySelectorAll('#modulosGrid input').forEach(c => {
    c.checked = modulos.includes(c.value);
    c.closest('.mod-item').classList.toggle('on', c.checked);
  });

  document.getElementById('alojList').innerHTML = '';
  parseJSON(p.alojamientos, []).forEach(a => agregarAloj(a.nombre, a.capacidad));

  document.getElementById('statsList').innerHTML = '';
  parseJSON(p.stats, []).forEach(s => agregarStat(s.num, s.lbl));

  document.getElementById('modalProyecto').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modalProyecto').classList.remove('open');
  document.getElementById('modalBtns1').style.display  = 'flex';
  document.getElementById('modalPaso2').style.display  = 'none';
}

function toggleHeroVideo() {
  const tipo = document.getElementById('pHeroTipo').value;
  document.getElementById('heroVideoField').style.display =
    tipo === 'video' ? 'block' : 'none';
}

// ─── PRESET Y COLOR ──────────────────────────────────────────
function selPreset(el) {
  document.querySelectorAll('.preset-opt').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('pPreset').value = el.dataset.val;

  // Color por defecto del preset seleccionado
  const defaults = {
    luxury:    '#D4AF37',
    corporate: '#1A1A1A',
    eco:       '#2D452F',
    tech:      '#0666EB',
  };
  const color = defaults[el.dataset.val] || '#D4AF37';
  document.getElementById('pColorHex').value   = color;
  document.getElementById('colorLabel').textContent = color.toUpperCase();
}

function adaptarFormulario(tipo) {
  const grupo      = getTipoGrupo(tipo);
  const amenidades = AMENIDADES_POR_TIPO[grupo] || AMENIDADES_POR_TIPO.turismo;
  const chkGrid    = document.getElementById('amenidadesCheck');

  chkGrid.innerHTML = '';
  amenidades.forEach(key => {
    const info  = AMENIDADES_INFO[key] || { label: key };
    const label = document.createElement('label');
    label.className = 'chk-item';
    const cb = document.createElement('input');
    cb.type  = 'checkbox';
    cb.value = key;
    cb.addEventListener('change', () =>
      label.classList.toggle('on', cb.checked));
    label.append(cb, ` ${info.label}`);
    chkGrid.appendChild(label);
  });

  document.getElementById('alojamientoTitle').textContent =
    ALOJ_TITLE[grupo] || 'Tipos de alojamiento';
  document.getElementById('alojHint').textContent =
    ALOJ_HINT[grupo]  || '';
  document.getElementById('secAlojamiento').style.display =
    grupo === 'vehiculos' ? 'none' : 'block';

  const modulos = MODULOS_POR_TIPO[grupo] ||
    MODULOS_POR_TIPO.turismo;
  document.querySelectorAll('#modulosGrid input').forEach(c => {
    c.checked = modulos.includes(c.value);
    c.closest('.mod-item').classList.toggle('on', c.checked);
  });

  const taglinePH = {
    turismo:      'Escápate a la tranquilidad del llano',
    inmobiliaria: 'El hogar que siempre soñaste',
    vehiculos:    'Potencia y confort en un solo vehículo',
  };
  document.getElementById('pTagline').placeholder =
    taglinePH[grupo] || '';
}

function agregarAloj(nombre = '', capacidad = '') {
  const div = document.createElement('div');
  div.className = 'aloj-item';

  const inp1 = document.createElement('input');
  inp1.type        = 'text';
  inp1.placeholder = 'Ej: Cabaña privada';
  inp1.value       = nombre;

  const inp2 = document.createElement('input');
  inp2.type        = 'text';
  inp2.placeholder = 'Ej: 2-4 personas';
  inp2.value       = capacidad;

  const btn = document.createElement('button');
  btn.className   = 'aloj-del';
  btn.textContent = '✕';
  btn.addEventListener('click', () => div.remove());

  div.append(inp1, inp2, btn);
  document.getElementById('alojList').appendChild(div);
}

function agregarStat(num = '', lbl = '') {
  const div = document.createElement('div');
  div.className = 'aloj-item';

  const inp1 = document.createElement('input');
  inp1.type        = 'text';
  inp1.placeholder = 'Ej: 5 o 3ha';
  inp1.value       = num;

  const inp2 = document.createElement('input');
  inp2.type        = 'text';
  inp2.placeholder = 'Ej: Cabañas o Hectáreas';
  inp2.value       = lbl;

  const btn = document.createElement('button');
  btn.className   = 'aloj-del';
  btn.textContent = '✕';
  btn.addEventListener('click', () => div.remove());

  div.append(inp1, inp2, btn);
  document.getElementById('statsList').appendChild(div);
}

// ─── GUARDAR PROYECTO ─────────────────────────────────────────
async function guardarProyecto() {
  const id = document.getElementById('pId').value;

  const amenidades = Array.from(
    document.querySelectorAll('#amenidadesCheck input:checked')
  ).map(c => c.value);

  const modulos = Array.from(
    document.querySelectorAll('#modulosGrid input:checked')
  ).map(c => c.value);

  const alojamientos = Array.from(
    document.querySelectorAll('#alojList .aloj-item')
  ).map(el => {
    const [inp1, inp2] = el.querySelectorAll('input');
    return { nombre: inp1.value, capacidad: inp2.value };
  }).filter(a => a.nombre.trim());

  const stats = Array.from(
    document.querySelectorAll('#statsList .aloj-item')
  ).map(el => {
    const [inp1, inp2] = el.querySelectorAll('input');
    return { num: inp1.value, lbl: inp2.value };
  }).filter(s => s.num.trim() && s.lbl.trim());

  const body = {
    nombre:        document.getElementById('pNombre').value,
    tipo_lugar:    document.getElementById('pTipo').value,
    ubicacion:     document.getElementById('pUbicacion').value,
    whatsapp:      document.getElementById('pWhatsapp').value,
    tagline:       document.getElementById('pTagline').value,
    descripcion:   document.getElementById('pDescripcion').value,
    hero_foto:     document.getElementById('pHeroFoto').value,
    hero_video:    document.getElementById('pHeroVideo').value,
    hero_tipo:     document.getElementById('pHeroTipo').value,
    color_acento:  document.getElementById('pColorAcento').value,
    preset:        document.getElementById('pPreset').value,
    color_hex:     document.getElementById('pColorHex').value,
    video360:      document.getElementById('pVideo360').value,
    ubicacion_mapa:document.getElementById('pUbicacionMapa').value,
    amenidades, modulos, alojamientos, stats, activo: true,
  };

  try {
    const proyecto = await saveProyecto(body, id || null);
    uploadId = proyecto.id;
    document.getElementById('pId').value = proyecto.id;
    mostrarPaso2(amenidades, proyecto);
    cargarDashboard();
  } catch (err) {
    alert('Error guardando el proyecto: ' + err.message);
  }
}

// ─── PASO 2: UPLOAD DE FOTOS ──────────────────────────────────
function mostrarPaso2(amenidades, proyecto) {
  document.getElementById('modalBtns1').style.display = 'none';
  document.getElementById('modalPaso2').style.display  = 'block';

  const fotos  = proyecto.fotos || [];
  const cats   = [...new Set(['general', 'aerea', ...amenidades])];
  const zones  = document.getElementById('fotosUploadZones');
  zones.innerHTML = '';

  cats.forEach(cat => {
    const zone = document.createElement('div');
    zone.className = 'upload-zone';
    zone.id = `zone-${cat}`;

    const header = document.createElement('div');
    header.className = 'upload-zone-header';

    const title = document.createElement('span');
    title.className   = 'upload-zone-title';
    title.textContent = CATS_LABELS[cat] || cat;

    const btnSubir = document.createElement('button');
    btnSubir.className   = 'upload-zone-btn';
    btnSubir.textContent = '+ Subir fotos';
    btnSubir.addEventListener('click', () => {
      uploadId  = proyecto.id;
      uploadCat = cat;
      document.getElementById('fileInput').click();
    });

    header.append(title, btnSubir);

    const fotosDiv = document.createElement('div');
    fotosDiv.className = 'upload-zone-fotos';
    fotosDiv.id = `zone-fotos-${cat}`;

    fotos
      .filter(f => f.categoria === cat)
      .forEach(f => {
        const wrap = document.createElement('div');
        wrap.className = 'foto-wrap';
        const img = document.createElement('img');
        img.className = 'foto-thumb';
        img.src = f.url;
        const btn = document.createElement('button');
        btn.className   = 'foto-del';
        btn.textContent = '✕';
        btn.addEventListener('click', async () => {
          await deleteFoto(f.id);
          wrap.remove();
          cargarDashboard();
        });
        wrap.append(img, btn);
        fotosDiv.appendChild(wrap);
      });

    const progress = document.createElement('div');
    progress.className = 'upload-progress';
    progress.id = `zone-prog-${cat}`;
    progress.style.display = 'none';
    progress.textContent = 'Subiendo...';

    zone.append(header, fotosDiv, progress);
    zones.appendChild(zone);
  });
}

// ─── SUBIR FOTOS ─────────────────────────────────────────────
async function subirFotos(input) {
  const files = Array.from(input.files);
  if (!files.length) return;

  const prog = document.getElementById(`zone-prog-${uploadCat}`);
  if (prog) { prog.style.display = 'block'; prog.textContent = `Subiendo ${files.length} foto(s)...`; }

  for (const file of files) {
    try {
      const foto = await subirFoto(uploadId, file, uploadCat);
      const zone = document.getElementById(`zone-fotos-${uploadCat}`);
      if (zone && foto.url) {
        const wrap = document.createElement('div');
        wrap.className = 'foto-wrap';
        const img = document.createElement('img');
        img.className = 'foto-thumb';
        img.src = foto.url;
        const btn = document.createElement('button');
        btn.className   = 'foto-del';
        btn.textContent = '✕';
        btn.addEventListener('click', async () => {
          await deleteFoto(foto.id);
          wrap.remove();
          cargarDashboard();
        });
        wrap.append(img, btn);
        zone.appendChild(wrap);
      }
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  }

  if (prog) {
    prog.textContent = '✓ Listo';
    setTimeout(() => { prog.style.display = 'none'; }, 2000);
  }
  input.value = '';
  cargarDashboard();
}
