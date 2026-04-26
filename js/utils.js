// ============================================================
// ORBUX · utils.js
// Funciones puras — sin DOM, sin efectos secundarios
// ============================================================

import { TIPOS_INMO, TIPOS_VEH } from './data.js';

// ---------- DATOS ----------

export function parseJSON(val, def = []) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return def; }
  }
  return def;
}

export function getTipoGrupo(tipo) {
  if (TIPOS_INMO.includes(tipo)) return 'inmobiliaria';
  if (TIPOS_VEH.includes(tipo))  return 'vehiculo';
  return 'turismo';
}

// ---------- STATS ----------

export function getStat(stats, ...keywords) {
  const list = parseJSON(stats, []);
  const found = list.find(s =>
    keywords.some(kw => s.lbl?.toLowerCase().includes(kw.toLowerCase()))
  );
  return found?.num || '';
}

export function getPrecio(p)  { return getStat(p.stats, 'precio','valor','price'); }
export function getAnio(p)    { return getStat(p.stats, 'año','model','modelo');   }
export function getArea(p)    { return getStat(p.stats, 'm²','area','área','mt'); }
export function getKm(p)      { return getStat(p.stats, 'km','kilómetros');        }

// ---------- FORMATO ----------

export function formatPrice(str = '') {
  return parseInt(str.replace(/\D/g, '') || '0', 10);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('es-CO').format(n);
}

// ---------- SEGURIDAD / XSS ----------

/**
 * Escapa texto para insertar en el DOM de forma segura.
 * Usar siempre en lugar de concatenar strings en innerHTML.
 */
export function safeText(str = '') {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

/**
 * Crea un elemento HTML con propiedades seguras.
 * @param {string} tag
 * @param {Object} props  - { className, textContent, dataset, ... }
 * @param {Node[]} children
 */
export function createElement(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, val]) => {
    if (key === 'className') { el.className = val; }
    else if (key === 'dataset') {
      Object.entries(val).forEach(([dk, dv]) => { el.dataset[dk] = dv; });
    }
    else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    }
    else { el[key] = val; }
  });
  children.forEach(child => {
    if (child) el.appendChild(
      typeof child === 'string'
        ? document.createTextNode(child)
        : child
    );
  });
  return el;
}

// ---------- DOM HELPERS ----------

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function show(el) { if (el) el.hidden = false; }
export function hide(el) { if (el) el.hidden = true;  }

export function showById(id)  { show(document.getElementById(id)); }
export function hideById(id)  { hide(document.getElementById(id)); }

// ---------- URL ----------

export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ---------- WHATSAPP ----------

export function buildWaUrl(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ---------- CLIP ----------

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
