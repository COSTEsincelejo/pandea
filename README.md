# Pandea — Guía de Despliegue Completa

## Archivos del proyecto
```
pandea/
├── app.py            ← Backend (Flask + SQLite)
├── requirements.txt  ← Dependencias Python
├── index.html        ← Frontend (tienda + panel admin)
└── README.md
```

---

## 1. Correr en tu computador (local)

### Requisitos
- Python 3.8+
- Git

### Pasos
```bash
# 1. Instala dependencias
pip install -r requirements.txt

# 2. Arranca el backend
python app.py
# → http://localhost:5000

# 3. Abre index.html en el navegador (doble clic)
```

---

## 2. Despliegue en internet (Render.com — GRATIS)

### Paso 1 — Sube los archivos a GitHub
```bash
cd tu-carpeta-pandea
git init
git add .
git commit -m "Pandea v2"
git remote add origin https://github.com/COSTEsincelejo/pandea.git
git push -f origin master
```

### Paso 2 — Configura Render
1. Ve a https://render.com → New → Web Service
2. Conecta el repo `COSTEsincelejo/pandea`
3. Configura:
   - **Name:** pandea
   - **Branch:** master
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
4. En **Environment Variables** agrega:
   - `SECRET_KEY` = (cualquier texto largo y secreto, ej: `pandea2026xK9mPqR`)
5. Clic en **Deploy**

### Paso 3 — Frontend en GitHub Pages
1. Ve a tu repo en GitHub → Settings → Pages
2. Branch: `main` / Folder: `/ (root)`
3. Tu tienda queda en: `https://costesincelejo.github.io/pandea/`

---

## 3. Seguridad del Admin

- **Solo** `cristianccbr@gmail.com` puede acceder al panel admin
- El rol viene del **backend** — no se puede falsificar desde el navegador
- Si alguien intenta cambiar el rol desde la consola del navegador, el backend lo rechaza
- La función `toggleAdmin` no puede cambiar el rol del admin principal

---

## 4. Para aparecer en Google / buscadores

El `index.html` ya incluye:
- Meta tags SEO (title, description, keywords)
- Open Graph (para compartir en redes)
- `robots: index, follow`

Para acelerar la indexación:
1. Ve a https://search.google.com/search-console
2. Agrega tu URL: `https://costesincelejo.github.io/pandea/`
3. Verifica con el método HTML tag
4. Solicita indexación manual

---

## 5. Endpoints del API

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | /api/health | Público |
| POST | /api/auth/login | Público |
| POST | /api/auth/register | Público |
| GET | /api/products | Público |
| POST | /api/coupons/validate | Público |
| POST | /api/orders | Autenticado |
| GET | /api/orders/mine | Autenticado |
| GET | /api/admin/* | Solo admin |
