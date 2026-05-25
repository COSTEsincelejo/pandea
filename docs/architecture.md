# Arquitectura del proyecto Pandea

## Visión general

Pandea es una plataforma de comercio electrónico construida con una arquitectura de aplicación en capas:

- `frontend/`: Single Page Application (SPA) en React + Vite.
- `backend/`: API REST con Node.js, Express y conexión a SQL Server.
- `database/`: esquema SQL Server con tablas y procedimientos almacenados.

Esta separación permite desarrollar y desplegar el cliente y el servidor de forma independiente.

---

## 1. Backend

El backend está diseñado con el patrón `routes → controllers → services → models`.

### 1.1 Punto de entrada

- `backend/src/app.js`
  - Inicializa Express.
  - Configura CORS, JSON middleware y rutas.
  - Define una ruta de salud (`/api/health`).
  - Registra los routers de auth, users, products, orders y admin.

### 1.2 Configuración de la base de datos

- `backend/src/config/db.js`
  - Usa el paquete `mssql` para conectar con SQL Server.
  - Lee variables de entorno desde `backend/.env`.
  - Exporta funciones auxiliares para ejecutar consultas y procedimientos.

### 1.3 Rutas (API)

- `backend/src/routes/authRoutes.js`
- `backend/src/routes/userRoutes.js`
- `backend/src/routes/productRoutes.js`
- `backend/src/routes/orderRoutes.js`
- `backend/src/routes/adminRoutes.js`

Cada ruta define endpoints HTTP y delega el manejo al controlador correspondiente.

### 1.4 Controladores

- `backend/src/controllers/authController.js`
- `backend/src/controllers/userController.js`
- `backend/src/controllers/productController.js`
- `backend/src/controllers/orderController.js`
- `backend/src/controllers/adminController.js`

Los controladores:
- validan solicitudes entrantes,
- llaman a servicios de negocio,
- devuelven JSON con respuesta y estado HTTP.

### 1.5 Servicios

- `backend/src/services/authService.js`
- `backend/src/services/userService.js`
- `backend/src/services/productService.js`
- `backend/src/services/orderService.js`
- `backend/src/services/adminService.js`

Los servicios contienen la lógica de negocio principal, como:
- creación y validación de usuarios,
- gestión de tokens JWT,
- aplicación de cupones en pedidos,
- construcción de compras y pedidos,
- cálculos de totales.

### 1.6 Modelos

- `backend/src/models/authModel.js`
- `backend/src/models/userModel.js`
- `backend/src/models/productModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/adminModel.js`

Los modelos se encargan de la interacción directa con la base de datos.
Usan consultas SQL y procedimientos almacenados para:
- insertar y consultar usuarios,
- listar y buscar productos,
- crear pedidos y detalles de pedidos,
- obtener estadísticas y actividad.

### 1.7 Middleware

- `backend/src/middleware/authMiddleware.js`
  - `requireAuth`: verifica el token JWT en cabeceras `Authorization`.
  - `requireAdmin`: asegura que el usuario autenticado tenga `rol === 'admin'`.

Este middleware protege rutas privadas y de administración.

### 1.8 Variables de entorno

- `backend/.env` y `backend/.env.example`
  - `PORT`
  - `JWT_SECRET`
  - `DB_SERVER`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `DB_PORT`
  - `WHATSAPP_NUMBER`
  - `NODE_ENV`

---

## 2. Frontend

El frontend es una aplicación React moderna con rutas, estado compartido y servicios de API.

### 2.1 Punto de entrada

- `frontend/src/main.jsx`
  - Monta la aplicación React en el DOM.
  - Envuelve la app en los providers de `AuthContext` y `CartContext`.

### 2.2 Enrutamiento

- `frontend/src/App.jsx`
  - Define las rutas públicas y privadas.
  - Muestra páginas como `Home`, `Login`, `Register`, `Cart`, `Profile`, `Checkout` y `AdminDashboard`.

### 2.3 Contextos

- `frontend/src/context/AuthContext.jsx`
  - Administra sesión, token JWT y datos de usuario.
  - Provee funciones de `login`, `logout` y `register`.

- `frontend/src/context/CartContext.jsx`
  - Mantiene el estado del carrito.
  - Suma, elimina y resetea productos en el carrito.

### 2.4 Servicios de API

- `frontend/src/api/client.js`
  - Configura Axios con la URL base de la API.
  - Ajusta el header `Authorization` con el token JWT.

- `frontend/src/services/*Service.js`
  - `authService.js`: login y registro.
  - `productService.js`: listado y detalle de productos.
  - `orderService.js`: creación de pedidos.
  - `userService.js`: datos de usuario y pedidos.
  - `adminService.js`: datos y operaciones administrativas.

### 2.5 Páginas principales

- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/ProductPage.jsx`
- `frontend/src/pages/CartPage.jsx`
- `frontend/src/pages/CheckoutPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/AdminDashboardPage.jsx`

Estas páginas consumen los servicios de API y usan los contextos para renderizar datos dinámicos.

### Nota importante

El proyecto no integra pasarelas de pago en línea. El flujo de compra se completa por WhatsApp:
- desde la ficha de producto o el carrito el cliente pulsa "Comprar por WhatsApp";
- se abre el chat con el número configurado en `backend/.env`;
- el mensaje incluye detalles del producto o pedido para negociar con el vendedor.

### 2.6 Componentes reutilizables

- `frontend/src/components/`: botones, tarjetas de producto, formularios y navegación.

---

## 3. Base de datos

La capa de datos está ubicada en `database/pandea_schema.sql`.

### 3.1 Tablas clave

- `usuarios`
- `productos`
- `categorias`
- `pedidos`
- `pedido_detalles`
- `cupones`
- `actividad_admin`

### 3.2 Procedimientos almacenados

El script define procedimientos para:
- crear y actualizar usuarios,
- autenticar usuarios,
- registrar pedidos y detalles,
- aplicar cupones de descuento,
- obtener estadísticas de administración.

### 3.3 Relación entre capas

- El backend no usa ORM; utiliza SQL directo con `mssql`.
- Las propias consultas ejecutadas en los modelos son la única capa entre la API y SQL Server.

---

## 4. Flujo de datos

1. El usuario accede desde el navegador al frontend React.
2. El frontend solicita productos y datos de usuario a la API.
3. El backend procesa la petición y consulta SQL Server.
4. El backend envía la respuesta JSON al frontend.
5. El frontend actualiza el estado y renderiza la UI.

Las rutas protegidas usan JWT para asegurar que solo usuarios autenticados o administradores accedan a recursos privados.

---

## 5. Seguridad y autorización

- JWT para autenticación en el backend.
- Middleware en el servidor valida tokens y roles.
- El frontend almacena el token en `localStorage` y lo reenvía en cada petición.
- Rutas de admin solo accesibles si el usuario tiene `rol = 'admin'`.

---

## 6. Recomendaciones de mejora

- Agregar `docker-compose` para orquestar frontend, backend y SQL Server.
- Añadir pruebas unitarias e integración para API y componentes.
- Implementar validaciones y manejo de errores más robusto en frontend.
- Añadir caching o paginación en endpoints de productos.

---

## 7. Diagrama de carpetas

```text
pandea/
├─ backend/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ config/db.js
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ models/
│  │  └─ middleware/
│  ├─ package.json
│  └─ .env.example
├─ frontend/
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx
│  │  ├─ api/client.js
│  │  ├─ context/
│  │  ├─ services/
│  │  ├─ pages/
│  │  └─ components/
│  ├─ package.json
│  └─ vite.config.js
├─ database/
│  └─ pandea_schema.sql
├─ README.md
└─ docs/
   └─ architecture.md
```
