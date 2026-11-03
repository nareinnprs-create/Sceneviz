'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';

const SESSION_KEY = 'sv_session';

export function getSessionToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token) {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(SESSION_KEY);
}

// Unwraps FastAPI-style error bodies: {detail: "..."} or {detail: {error: "..."}}.
export function apiErrorMessage(data) {
  const detail = data?.detail;
  if (typeof detail === 'string' && detail) return detail;
  if (detail?.error) return detail.error;
  return 'Something went wrong. Please try again.';
}

/**
 * Authenticated JSON fetch against the API worker. Attaches the bearer token,
 * turns non-2xx responses into thrown Errors (message via apiErrorMessage) and
 * handles expired sessions (401 while holding a token) by clearing storage and
 * returning to the login page — the thrown error has `.handled` set so callers
 * can skip showing a toast during the redirect. 401s made WITHOUT a token
 * (login/signup attempts) are returned as normal errors, never hijacked.
 */
export async function apiJson(path, options = {}) {
  const token = getSessionToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401 && token) {
    clearSessionToken();
    window.location.assign('/dashboard/login');
    const err = new Error('Session expired');
    err.handled = true;
    throw err;
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(apiErrorMessage(data));
    err.status = res.status;
    throw err;
  }
  return data;
}

// undefined = localStorage not read yet (SSR-safe), string = signed in, null = signed out.
export function useSessionToken() {
  const [token, setToken] = useState(undefined);
  useEffect(() => {
    setToken(getSessionToken());
  }, []);
  return token;
}
