/**
 * pandea-api.js
 * ─────────────────────────────────────────────────────────────
 * Capa de integración: conecta el frontend de Pandea con el
 * backend REST (Flask + SQLite).
 *
 * Incluye este script ANTES de los scripts del index.html y
 * define la constante API_URL apuntando a tu servidor.
 *
 * Uso:
 *   <script src="pandea-api.js"></script>
 *
 * Reemplaza todas las llamadas a DB.get / DB.set por llamadas
 * a la API real. El objeto `DB` queda como stub vacío para que
 * el código viejo no rompa mientras migras.
 * ─────────────────────────────────────────────────────────────
 */

const API_URL = "http://localhost:5000"; // ← Cambia en producción

// ── Token helpers ────────────────────────────────────────────
const Auth = {
  getToken() { return sessionStorage.getItem("pandea_token") || ""; },
  setToken(t) { sessionStorage.setItem("pandea_token", t); },
  clearToken() { sessionStorage.removeItem("pandea_token"); },
  headers() {
    return {
      "Content-Type": "application/json",
      ...(this.getToken() ? { Authorization: "Bearer " + this.getToken() } : {}),
    };
  },
};

// ── Base fetch wrapper ────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(API_URL + path, {
    headers: Auth.headers(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en la API");
  return data;
}

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════

const PandeaAuth = {
  async register(payload) {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    Auth.setToken(data.token);
    return data.user;
  },

  async login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    Auth.setToken(data.token);
    return data.user;
  },

  async recover(email) {
    return apiFetch("/api/auth/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  logout() {
    Auth.clearToken();
  },

  async me() {
    return apiFetch("/api/users/me");
  },

  async updateProfile(payload) {
    return apiFetch("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async myOrders() {
    return apiFetch("/api/users/me/orders");
  },
};

// ════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════

const PandeaProducts = {
  async getAll(categoria = "all") {
    const qs = categoria && categoria !== "all" ? `?categoria=${categoria}` : "";
    return apiFetch("/api/products" + qs);
  },

  async getOne(id) {
    return apiFetch(`/api/products/${id}`);
  },

  // Admin
  async create(payload) {
    return apiFetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id, payload) {
    return apiFetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id) {
    return apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
  },
};

// ════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════

const PandeaOrders = {
  async create(payload) {
    return apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Admin
  async getAll() {
    return apiFetch("/api/admin/orders");
  },

  async updateStatus(id, status) {
    return apiFetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async delete(id) {
    return apiFetch(`/api/admin/orders/${id}`, { method: "DELETE" });
  },
};

// ════════════════════════════════════════════════════════════
//  COUPONS
// ════════════════════════════════════════════════════════════

const PandeaCoupons = {
  async validate(code, total) {
    return apiFetch("/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, total }),
    });
  },

  // Admin
  async getAll() {
    return apiFetch("/api/admin/coupons");
  },

  async create(payload) {
    return apiFetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id, payload) {
    return apiFetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id) {
    return apiFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
  },
};

// ════════════════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════════════════

const PandeaAdmin = {
  async stats() {
    return apiFetch("/api/admin/stats");
  },

  async activity() {
    return apiFetch("/api/admin/activity");
  },

  async getUsers() {
    return apiFetch("/api/admin/users");
  },

  async deleteUser(id) {
    return apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
  },

  async setUserRole(id, rol) {
    return apiFetch(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ rol }),
    });
  },
};

// ════════════════════════════════════════════════════════════
//  STUB: mantiene compatibilidad con código que aún usa DB.*
//  (Puedes ir migrando función por función)
// ════════════════════════════════════════════════════════════

const DB = {
  get(key) {
    // Fallback a localStorage mientras migras
    try {
      const raw = localStorage.getItem("pandea_" + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem("pandea_" + key, JSON.stringify(val)); } catch {}
  },
};

console.log("✅ Pandea API client cargado →", API_URL);
