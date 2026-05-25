# Pandea — Fullstack React + Node + SQL Server

**Pandea** es una plataforma de comercio electrónico para una microempresa textil. El proyecto está dividido en:

- `backend/`: API construida con Node.js, Express y SQL Server.
- `frontend/`: cliente SPA en React usando Vite.
- `database/`: esquema SQL Server con tablas, procedimientos almacenados y datos de ejemplo.

---

## 📌 Qué hace el proyecto

### Backend
- Gestiona autenticación y autorización con JWT.
- Crea usuarios, valida sesiones y protege rutas con middleware.
- Ofrece catálogo de productos y detalles de producto.
- Permite crear pedidos desde el carrito.
- No gestiona pagos en línea; el pedido se confirma por WhatsApp.
- El cliente puede pulsar "Comprar por WhatsApp" desde la ficha del producto o el carrito y abrir el chat con el vendedor.
- Incluye operaciones administrativas para:
  - gestión de usuarios
  - gestión de productos
  - gestión de pedidos
  - gestión de cupones
  - estadísticas y actividad del panel admin

### Frontend
- Presenta un catálogo de productos navegable.
- Permite registro e inicio de sesión.
- Administra carrito de compras y checkout.
- Muestra perfil de usuario y pedidos realizados.
- Incluye un panel admin básico para ver estadísticas y gestionar recursos.

---

## 🧱 Arquitectura del proyecto

### Backend
- `backend/src/app.js`: punto de entrada del servidor Express.
- `backend/src/routes/`: define rutas por dominio (`auth`, `products`, `orders`, `users`, `admin`).
- `backend/src/controllers/`: maneja la lógica de cada ruta.
- `backend/src/services/`: contiene la lógica de negocio entre controladores y modelos.
- `backend/src/models/`: ejecuta consultas SQL y procedimientos almacenados.
- `backend/src/config/db.js`: configuración de conexión a SQL Server.
- `backend/.env`: variables de entorno para la base de datos, JWT y puerto.

### Frontend
- `frontend/src/main.jsx`: arranca la app React.
- `frontend/src/App.jsx`: define las rutas del frontend.
- `frontend/src/context/`: administra estado de autenticación y carrito.
- `frontend/src/services/`: encapsula llamadas HTTP al backend.
- `frontend/src/pages/`: páginas principales del cliente.
- `frontend/src/components/`: componentes reutilizables.
- `frontend/src/api/client.js`: instancia Axios con baseURL y token.

---

## 📁 Estructura de carpetas

### Raíz
- `README.md`: documentación del proyecto.
- `database/pandea_schema.sql`: esquema SQL Server.
- `frontend/`: cliente React.
- `backend/`: servidor Node.

### Frontend
- `frontend/src/pages`: páginas navegables.
- `frontend/src/components`: tarjetas, barra de navegación, etc.
- `frontend/src/context`: Auth y Cart.
- `frontend/src/services`: llamadas a API.
- `frontend/src/api/client.js`: Axios configurado.

### Backend
- `backend/src/routes`: definición de rutas.
- `backend/src/controllers`: lógica de respuesta HTTP.
- `backend/src/services`: reglas de negocio.
- `backend/src/models`: acceso a datos SQL.
- `backend/src/config/db.js`: configuración de SQL Server.

---

## ⚙️ Requisitos

- Node.js >= 18
- SQL Server disponible (local, Docker o en la nube)
- Navegador moderno para el frontend

---

## 🚀 Cómo ejecutar

### 1. Preparar la base de datos SQL Server

Usa `database/pandea_schema.sql` para crear la base de datos y las tablas.

Ejemplo con SQL Server Management Studio o `sqlcmd`:

```sql
USE master;
GO
:r database/pandea_schema.sql
```

### 2. Ejecutar el backend

```bash
cd /workspaces/pandea/backend
npm install
cp .env.example .env
# Edita backend/.env con tus credenciales de SQL Server
npm run dev
```

El backend quedará en `http://localhost:4000`.

### 3. Ejecutar el frontend

```bash
cd /workspaces/pandea/frontend
npm install
cp .env.example .env
npm run dev
```

El frontend quedará en `http://localhost:5173`.

---

## 🧪 Pruebas y CI

### Backend

```bash
cd /workspaces/pandea/backend
npm test
```

### Frontend

```bash
cd /workspaces/pandea/frontend
npm test
```

El repositorio también incluye un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta las pruebas de backend y frontend y valida la compilación del frontend.

---

## 🔐 Variables de entorno

### `backend/.env`

- `PORT`: puerto del servidor backend.
- `JWT_SECRET`: clave secreta para firmar tokens JWT.
- `DB_SERVER`: host de SQL Server.
- `DB_USER`: usuario SQL.
- `DB_PASSWORD`: contraseña SQL.
- `DB_NAME`: nombre de la base de datos.
- `DB_PORT`: puerto SQL Server.
- `WHATSAPP_NUMBER`: número de WhatsApp usado en la app.
- `NODE_ENV`: modo de ejecución.

### `frontend/.env`

- `VITE_API_URL`: URL base de la API (`http://localhost:4000/api`).

---

## 📦 Endpoints del backend

### Autenticación

- `POST /api/auth/register`
  - Registra un usuario.
  - Payload esperado:
    - `nombre`, `apellido`, `email`, `password`, `documento`.

- `POST /api/auth/login`
  - Inicia sesión y devuelve un token JWT.
  - Payload esperado: `email`, `password`.

- `POST /api/auth/recover`
  - Inicia el flujo de recuperación de contraseña.
  - Payload esperado: `email`.

### Usuario

- `GET /api/users/me`
  - Devuelve información del usuario autenticado.

- `PUT /api/users/me`
  - Actualiza el perfil del usuario.

- `GET /api/users/me/orders`
  - Lista los pedidos del usuario autenticado.

### Productos

- `GET /api/products`
  - Obtiene todos los productos.

- `GET /api/products/:id`
  - Obtiene el detalle de un producto.

### Pedidos

- `POST /api/orders`
  - Crea un nuevo pedido.
  - Requiere autorización Bearer token.
  - Payload esperado:
    - `items`, `subtotal`, `total`, `metodo_contacto`, `couponCode` (opcional).

### Admin (requiere token admin)

- `GET /api/admin/stats`
- `GET /api/admin/activity`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id`
- `DELETE /api/admin/orders/:id`
- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `PUT /api/admin/coupons/:id`
- `DELETE /api/admin/coupons/:id`

---

## 🧩 Flujo de uso principal

1. El cliente carga el catálogo desde `GET /api/products`.
2. El usuario se registra o inicia sesión.
3. El usuario agrega productos al carrito.
4. El usuario completa checkout y crea un pedido en `POST /api/orders`.
5. El admin puede revisar estadísticas, pedidos y gestionar productos.

---

## 📝 Notas importantes

- El frontend usa el token almacenado en `localStorage` para autorizar solicitudes.
- El backend usa JWT con firma y expiración de 7 días.
- Las operaciones admin están protegidas con middleware que valida `rol === 'admin'`.
- La base de datos SQL Server se crea y se gestiona por `database/pandea_schema.sql`.

---

## 🎯 Características implementadas

- Autenticación con JWT
- CRUD de productos
- Carrito y checkout
- Validación de pedidos con cupones
- Panel admin con estadísticas
- Frontend SPA en React con rutas protegidas
- Conexión segura a SQL Server con `mssql`

---

## 📌 Recomendaciones para producción

- Usa variables de entorno seguras.
- Crea un usuario administrador en la tabla `usuarios`.
- Haz un backup de la base de datos antes de hacer cambios.
- Considera agregar tests automatizados y un CI/CD.

---

## 📌 Próximos pasos sugeridos

- Añadir UI de administración avanzada: edición de cupones y usuarios.
- Crear `docker-compose` para backend + SQL Server + frontend.
- Agregar pruebas unitarias e integración.
- Añadir un flujo real de pago / pasarela.
