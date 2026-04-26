// ============================================================
// ORBUX · auth.js
// Autenticación — login, logout, guard, validación JWT
// ============================================================

import { login as apiLogin } from './api.js';

const TOKEN_KEY = 'orbux_token';

// ---------- TOKEN ----------

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------- VALIDACIÓN JWT ----------

/**
 * Decodifica el payload del JWT sin librería externa.
 * No verifica la firma (eso lo hace el backend).
 * Solo verifica expiración del lado del cliente.
 */
function decodePayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload) return false;
  // Verifica expiración con 30s de margen
  return (payload.exp * 1000) > (Date.now() - 30_000);
}

// ---------- AUTH ACTIONS ----------

export async function login(email, password) {
  const data = await apiLogin(email, password);
  if (data?.token) {
    setToken(data.token);
    return true;
  }
  return false;
}

export function logout() {
  removeToken();
  // Recarga para mostrar login
  window.location.reload();
}

// ---------- AUTH GUARD ----------

/**
 * Llama esto al inicio de admin.js.
 * Devuelve true si el token es válido.
 * Si no, muestra el login y oculta el panel.
 */
export function guard() {
  if (isTokenValid()) return true;

  removeToken();

  const loginScreen = document.getElementById('loginScreen');
  const adminPanel  = document.getElementById('adminPanel');

  if (loginScreen) loginScreen.hidden = false;
  if (adminPanel)  adminPanel.hidden  = true;

  return false;
}
