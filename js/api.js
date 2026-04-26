// ============================================================
// ORBUX · api.js
// Única capa de comunicación con el backend
// ============================================================

import { API_URL } from './config.js';

// ---------- HELPERS INTERNOS ----------

function getToken() {
  return localStorage.getItem('orbux_token');
}

function buildHeaders(auth = false, isJson = true) {
  const h = {};
  if (isJson) h['Content-Type'] = 'application/json';
  if (auth)   h['Authorization'] = `Bearer ${getToken()}`;
  return h;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---------- AUTH ----------

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: buildHeaders(false),
    body: JSON.stringify({ email, password }),
  });
}

// ---------- PROYECTOS ----------

export async function getProyectos() {
  return request('/proyectos');
}

export async function createProyecto(data) {
  return request('/proyectos', {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function updateProyecto(id, data) {
  return request(`/proyectos/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function saveProyecto(data, id = null) {
  return id ? updateProyecto(id, data) : createProyecto(data);
}

export async function deleteProyecto(id) {
  const res = await fetch(`${API_URL}/proyectos/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- FOTOS ----------

export async function subirFoto(proyectoId, file, categoria = 'general') {
  const form = new FormData();
  form.append('foto', file);
  form.append('categoria', categoria);
  return request(`/fotos/subir/${proyectoId}`, {
    method: 'POST',
    headers: buildHeaders(true, false), // sin Content-Type — lo pone FormData
    body: form,
  });
}

export async function updateFotoCategoria(fotoId, categoria) {
  return request(`/fotos/${fotoId}/categoria`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ categoria }),
  });
}

export async function deleteFoto(id) {
  const res = await fetch(`${API_URL}/fotos/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- CONTACTO / MENSAJES ----------

export async function getMensajes() {
  return request('/contacto', {
    headers: buildHeaders(true),
  });
}

export async function marcarMensajeLeido(id) {
  return request(`/contacto/${id}/leido`, {
    method: 'PUT',
    headers: buildHeaders(true),
  });
}
