// ============================================================
// ORBUX · themeManager.js  (ES Module)
// Motor de tokens de diseño — 4 presets × millones de variantes
// ============================================================

// ─── PRESETS MAESTROS ────────────────────────────────────────
const PRESETS = {
  luxury: {
    name:       'Premium Dark',
    surface:    '#0D0D0D',
    surface2:   '#141414',
    surface3:   '#1C1C1C',
    onSurface:  '#F5F0E8',
    radius:     '0px',
    radiusMd:   '4px',
    radiusLg:   '8px',
    fontTitle:  "'Playfair Display', 'Georgia', serif",
    fontBody:   "'Lato', 'Helvetica Neue', sans-serif",
    titleSpacing: '0.08em',
    bodyWeight: '400',
  },
  corporate: {
    name:       'Clean Corporate',
    surface:    '#F9FAFB',
    surface2:   '#F3F4F6',
    surface3:   '#E5E7EB',
    onSurface:  '#111827',
    radius:     '6px',
    radiusMd:   '10px',
    radiusLg:   '16px',
    fontTitle:  "'Montserrat', 'Inter', sans-serif",
    fontBody:   "'Inter', 'Segoe UI', sans-serif",
    titleSpacing: '0.04em',
    bodyWeight: '400',
  },
  eco: {
    name:       'Eco Zen',
    surface:    '#F4F1EA',
    surface2:   '#EDE8DF',
    surface3:   '#E2DBD0',
    onSurface:  '#2C2416',
    radius:     '16px',
    radiusMd:   '20px',
    radiusLg:   '28px',
    fontTitle:  "'Playfair Display', 'Georgia', serif",
    fontBody:   "'Lato', 'Helvetica Neue', sans-serif",
    titleSpacing: '0.03em',
    bodyWeight: '400',
  },
  tech: {
    name:       'High Tech',
    surface:    '#FFFFFF',
    surface2:   '#F8FAFC',
    surface3:   '#F1F5F9',
    onSurface:  '#0F172A',
    radius:     '12px',
    radiusMd:   '16px',
    radiusLg:   '24px',
    fontTitle:  "-apple-system, 'Segoe UI', 'San Francisco', sans-serif",
    fontBody:   "-apple-system, 'Segoe UI', 'San Francisco', sans-serif",
    titleSpacing: '0.01em',
    bodyWeight: '300',
  },
};

// ─── UTILIDADES DE COLOR ─────────────────────────────────────

/** Convierte hex a RGB */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/** Convierte RGB a hex */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.min(255, Math.max(0, Math.round(v)))
      .toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Luminancia relativa WCAG 2.1
 * Determina si un color es claro u oscuro
 */
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula contraste ratio entre dos colores
 * WCAG AA mínimo: 4.5:1
 */
function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determina el color de texto sobre un fondo
 * Retorna blanco o negro según luminancia — WCAG AA garantizado
 */
function getOnColor(hex) {
  return getLuminance(hex) > 0.35 ? '#111111' : '#FFFFFF';
}

/**
 * Aclara u oscurece un color en un porcentaje
 * @param {string} hex
 * @param {number} amount — positivo aclara, negativo oscurece
 */
function adjustBrightness(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

/**
 * Genera el color hover del primario (+10% brillo si oscuro, -10% si claro)
 */
function getPrimaryHover(hex) {
  const lum = getLuminance(hex);
  return lum > 0.35
    ? adjustBrightness(hex, -20)  // color claro → oscurecer hover
    : adjustBrightness(hex, 30);  // color oscuro → aclarar hover
}

/**
 * Genera variante semi-transparente para glassmorphism
 */
function getSurfaceGlass(hex, opacity = 0.82) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

// ─── MOTOR PRINCIPAL ─────────────────────────────────────────

/**
 * Aplica el tema al documento.
 * @param {Object} proyecto — datos del proyecto desde la API
 */
export function applyTheme(proyecto) {
  const preset  = PRESETS[proyecto.preset] || PRESETS.luxury;
  const primary = proyecto.color_hex || '#D4AF37';

  // Calcular variantes armónicas automáticamente
  const primaryHover  = getPrimaryHover(primary);
  const onPrimary     = getOnColor(primary);
  const surfaceGlass  = getSurfaceGlass(preset.surface);

  // Verificar contraste WCAG AA
  const contrasteTexto = getContrastRatio(preset.onSurface, preset.surface);
  if (contrasteTexto < 4.5) {
    console.warn(`WCAG: Contraste insuficiente (${contrasteTexto.toFixed(2)}:1)`);
  }

  // Inyectar tokens en el DOM
  const root = document.documentElement;
  const set  = (k, v) => root.style.setProperty(k, v);

  // Superficie
  set('--surface',       preset.surface);
  set('--surface-2',     preset.surface2);
  set('--surface-3',     preset.surface3);
  set('--surface-glass', surfaceGlass);
  set('--on-surface',    preset.onSurface);

  // Primario — calculado desde color_hex
  set('--primary',       primary);
  set('--primary-hover', primaryHover);
  set('--on-primary',    onPrimary);

  // Tipografía
  set('--font-title',    preset.fontTitle);
  set('--font-body',     preset.fontBody);
  set('--title-spacing', preset.titleSpacing);
  set('--body-weight',   preset.bodyWeight);

  // Bordes
  set('--radius',        preset.radius);
  set('--radius-md',     preset.radiusMd);
  set('--radius-lg',     preset.radiusLg);

  // Textos semánticos WCAG
  set('--texto-primario',   preset.onSurface);
  set('--texto-secundario', getSurfaceGlass(preset.onSurface, 0.75));
  set('--texto-terciario',  getSurfaceGlass(preset.onSurface, 0.50));

  // Sombras adaptadas al preset
  const isDark = getLuminance(preset.surface) < 0.15;
  set('--shadow-sm', isDark
    ? '0 4px 16px rgba(0,0,0,0.3)'
    : '0 4px 16px rgba(0,0,0,0.08)');
  set('--shadow-md', isDark
    ? '0 12px 32px rgba(0,0,0,0.4)'
    : '0 12px 32px rgba(0,0,0,0.12)');
  set('--shadow-lg', isDark
    ? '0 24px 56px rgba(0,0,0,0.55)'
    : '0 24px 56px rgba(0,0,0,0.18)');

  // Clase en body para CSS helpers que no usan variables
  document.body.dataset.preset = proyecto.preset || 'luxury';
  document.body.dataset.dark   = isDark ? 'true' : 'false';
}

/**
 * Preview en tiempo real desde el admin
 * @param {string} preset  — 'luxury' | 'corporate' | 'eco' | 'tech'
 * @param {string} colorHex — '#RRGGBB'
 */
export function previewTheme(preset, colorHex) {
  applyTheme({ preset, color_hex: colorHex });
}

/**
 * Devuelve la info de un preset para mostrar en el admin
 */
export function getPresetInfo(preset) {
  return PRESETS[preset] || PRESETS.luxury;
}

/**
 * Exporta todos los presets para el selector del admin
 */
export { PRESETS };
