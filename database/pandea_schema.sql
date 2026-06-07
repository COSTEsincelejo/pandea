CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    documento VARCHAR(30),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    id_categoria INT REFERENCES categorias(id),
    imagen_url VARCHAR(500),
    es_nuevo BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id_usuario INT PRIMARY KEY REFERENCES usuarios(id),
    telefono VARCHAR(20),
    direccion TEXT
);

CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES usuarios(id),
    id_vendedor INT REFERENCES usuarios(id),
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(12,2) NOT NULL,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    metodo_contacto VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    codigo_cupon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    id_venta INT NOT NULL REFERENCES ventas(id),
    id_producto INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cupones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    min_orden NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_usos INT NOT NULL DEFAULT 100,
    usos INT NOT NULL DEFAULT 0,
    descripcion VARCHAR(300),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos_stock (
    id SERIAL PRIMARY KEY,
    id_producto INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    motivo VARCHAR(100),
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    concepto VARCHAR(150) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    fecha DATE NOT NULL,
    id_admin INT NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS actividad (
    id SERIAL PRIMARY KEY,
    usuario_email VARCHAR(150),
    accion VARCHAR(300) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'info',
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chatbot_faqs (
    id SERIAL PRIMARY KEY,
    pregunta VARCHAR(200) NOT NULL,
    respuesta TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO categorias (nombre)
VALUES ('mujer'), ('hombre'), ('accesorios')
on conflict do nothing;

INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, documento, telefono, direccion, ciudad)
VALUES ('Admin', 'Pandea', 'admin@pandea.com', '$2b$10$6o3Ft/SoKwPo0mvGBf1hMuF5TbB43zGP.4OjxFsH1cG.ABCkzxRHe', 'admin', '123456789', '3001234567', 'Calle 100 #10-10', 'Bogotá')
on conflict (email) do nothing;

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, imagen_url, es_nuevo, activo)
VALUES
('Blusa Lino Soleil', 'Blusa de lino con corte amplio para uso diario.', 89000.00, 12, 1, 'https://example.com/blusa.jpg', true, true),
('Pantalón Arcilla', 'Pantalón tiro alto con tela fluida y detalle artesanal.', 135000.00, 8, 1, 'https://example.com/pantalon.jpg', false, true)
on conflict do nothing;

INSERT INTO cupones (codigo, tipo, valor, min_orden, max_usos, descripcion, activo)
VALUES ('BIENVENIDA', 'percent', 10.00, 0.00, 100, '10% de descuento en tu primera compra', true)
on conflict (codigo) do nothing;
