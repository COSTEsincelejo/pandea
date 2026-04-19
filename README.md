# Pandea — Backend API

Backend REST para la tienda **Pandea**, construido con **Python + Flask + SQLite**.  
Reemplaza completamente el `localStorage` del frontend con una API real y persistente.

---

## 🚀 Instalación

```bash
# 1. Clonar / entrar al directorio
cd pandea-backend

# 2. Crear entorno virtual (opcional pero recomendado)
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu SECRET_KEY

# 5. Iniciar el servidor
python app.py
```

El servidor arranca en **http://localhost:5000** y crea automáticamente la base de datos `pandea.db` con productos y cupones de ejemplo.

---

## 🔌 Conectar el frontend

En el `index.html`, cambia la constante `API_URL` al inicio del script:

```js
const API_URL = "http://localhost:5000";
```

Y reemplaza las llamadas a `DB.get` / `DB.set` por llamadas `fetch` a la API.

---

## 📋 Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/recover` | Recuperar contraseña (envía token) |
| POST | `/api/auth/reset-password` | Resetear contraseña con token |

### Usuario autenticado
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/me` | Ver perfil propio |
| PUT | `/api/users/me` | Actualizar perfil |
| GET | `/api/users/me/orders` | Mis pedidos |

### Productos (público)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Todos los productos |
| GET | `/api/products?categoria=mujer` | Filtrar por categoría |
| GET | `/api/products/:id` | Detalle de producto |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido (auth required) |

### Cupones
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/coupons/validate` | Validar cupón |

### Admin (requiere rol admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Estadísticas del dashboard |
| GET | `/api/admin/activity` | Log de actividad |
| GET/POST | `/api/admin/products` | Listar / crear productos |
| PUT/DELETE | `/api/admin/products/:id` | Editar / eliminar producto |
| GET | `/api/admin/users` | Listar usuarios |
| DELETE | `/api/admin/users/:id` | Eliminar usuario |
| PUT | `/api/admin/users/:id/role` | Cambiar rol |
| GET | `/api/admin/orders` | Todos los pedidos |
| PUT | `/api/admin/orders/:id` | Cambiar estado del pedido |
| DELETE | `/api/admin/orders/:id` | Eliminar pedido |
| GET/POST | `/api/admin/coupons` | Listar / crear cupones |
| PUT/DELETE | `/api/admin/coupons/:id` | Editar / eliminar cupón |

---

## 🔐 Autenticación

Todas las rutas protegidas requieren un header:

```
Authorization: Bearer <token>
```

El token se obtiene en el login/registro y dura **7 días**.

### Crear primer admin

```bash
# Registra un usuario normal y luego actualiza su rol en SQLite:
sqlite3 pandea.db "UPDATE users SET rol='admin' WHERE email='tu@email.com';"
```

---

## 📦 Estructura del proyecto

```
pandea-backend/
├── app.py              ← Aplicación principal (Flask)
├── pandea.db           ← Base de datos SQLite (se crea automáticamente)
├── requirements.txt    ← Dependencias Python
├── .env.example        ← Variables de entorno de ejemplo
└── README.md           ← Este archivo
```

---

## 🏭 Producción

Para producción, usa **Gunicorn** como servidor WSGI:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Para deploy rápido considera **Railway**, **Render** o **Fly.io** — todos soportan Python/Flask y SQLite.
