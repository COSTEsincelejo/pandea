-- ================================================
-- PANDEA SQL SERVER SCHEMA
-- ================================================

IF DB_ID(N'pandea_db') IS NULL
BEGIN
    CREATE DATABASE pandea_db;
END
GO

USE pandea_db;
GO

-- TABLAS
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    documento VARCHAR(30) NULL,
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(255) NULL,
    ciudad VARCHAR(100) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    id_categoria INT NULL,
    imagen_url VARCHAR(500) NULL,
    es_nuevo BIT NOT NULL DEFAULT 0,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);
GO

CREATE TABLE clientes (
    id_usuario INT PRIMARY KEY,
    telefono VARCHAR(20) NULL,
    direccion TEXT NULL,
    CONSTRAINT FK_Clientes_Usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
GO

CREATE TABLE ventas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_vendedor INT NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE(),
    subtotal DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    metodo_contacto VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    codigo_cupon VARCHAR(50) NULL,
    CONSTRAINT FK_Ventas_Cliente FOREIGN KEY (id_cliente) REFERENCES usuarios(id),
    CONSTRAINT FK_Ventas_Vendedor FOREIGN KEY (id_vendedor) REFERENCES usuarios(id)
);
GO

CREATE TABLE detalle_ventas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_DetalleVentas_Ventas FOREIGN KEY (id_venta) REFERENCES ventas(id),
    CONSTRAINT FK_DetalleVentas_Productos FOREIGN KEY (id_producto) REFERENCES productos(id)
);
GO

CREATE TABLE cupones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    min_orden DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_usos INT NOT NULL DEFAULT 100,
    usos INT NOT NULL DEFAULT 0,
    descripcion VARCHAR(300) NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE movimientos_stock (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    motivo VARCHAR(100) NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MovimientosStock_Productos FOREIGN KEY (id_producto) REFERENCES productos(id)
);
GO

CREATE TABLE gastos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    concepto VARCHAR(150) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    id_admin INT NOT NULL,
    CONSTRAINT FK_Gastos_Admin FOREIGN KEY (id_admin) REFERENCES usuarios(id)
);
GO

CREATE TABLE actividad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_email VARCHAR(150) NULL,
    accion VARCHAR(300) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'info',
    fecha DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE chatbot_faqs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    pregunta VARCHAR(200) NOT NULL,
    respuesta TEXT NOT NULL,
    activo BIT NOT NULL DEFAULT 1
);
GO

-- PROCEDIMIENTOS ALMACENADOS: USUARIOS
CREATE PROCEDURE spCreateUsuario
    @nombre VARCHAR(100),
    @apellido VARCHAR(100),
    @email VARCHAR(150),
    @password_hash VARCHAR(255),
    @rol VARCHAR(20) = 'cliente',
    @documento VARCHAR(30) = NULL,
    @telefono VARCHAR(20) = NULL,
    @direccion VARCHAR(255) = NULL,
    @ciudad VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, documento, telefono, direccion, ciudad)
    VALUES (@nombre, @apellido, @email, @password_hash, @rol, @documento, @telefono, @direccion, @ciudad);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetUsuarioByEmail
    @email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM usuarios WHERE email = @email;
END;
GO

CREATE PROCEDURE spGetUsuarioById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM usuarios WHERE id = @id;
END;
GO

CREATE PROCEDURE spUpdateUsuario
    @id INT,
    @nombre VARCHAR(100) = NULL,
    @apellido VARCHAR(100) = NULL,
    @email VARCHAR(150) = NULL,
    @direccion VARCHAR(255) = NULL,
    @ciudad VARCHAR(100) = NULL,
    @telefono VARCHAR(20) = NULL,
    @documento VARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE usuarios
    SET nombre = COALESCE(@nombre, nombre),
        apellido = COALESCE(@apellido, apellido),
        email = COALESCE(@email, email),
        direccion = COALESCE(@direccion, direccion),
        ciudad = COALESCE(@ciudad, ciudad),
        telefono = COALESCE(@telefono, telefono),
        documento = COALESCE(@documento, documento)
    WHERE id = @id;
    SELECT * FROM usuarios WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteUsuario
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM usuarios WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: CATEGORIAS
CREATE PROCEDURE spCreateCategoria
    @nombre VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO categorias (nombre) VALUES (@nombre);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetCategorias
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM categorias ORDER BY nombre;
END;
GO

CREATE PROCEDURE spGetCategoriaById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM categorias WHERE id = @id;
END;
GO

CREATE PROCEDURE spUpdateCategoria
    @id INT,
    @nombre VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE categorias SET nombre = @nombre WHERE id = @id;
    SELECT * FROM categorias WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteCategoria
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM categorias WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: PRODUCTOS
CREATE PROCEDURE spCreateProducto
    @nombre VARCHAR(200),
    @descripcion TEXT = NULL,
    @precio DECIMAL(12,2),
    @stock INT = 0,
    @id_categoria INT = NULL,
    @imagen_url VARCHAR(500) = NULL,
    @es_nuevo BIT = 0,
    @activo BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, imagen_url, es_nuevo, activo)
    VALUES (@nombre, @descripcion, @precio, @stock, @id_categoria, @imagen_url, @es_nuevo, @activo);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetProductos
    @categoria INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @categoria IS NULL
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        WHERE p.activo = 1
        ORDER BY p.nombre;
    ELSE
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        WHERE p.activo = 1 AND p.id_categoria = @categoria
        ORDER BY p.nombre;
END;
GO

CREATE PROCEDURE spGetProductoById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.*, c.nombre AS categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id
    WHERE p.id = @id;
END;
GO

CREATE PROCEDURE spUpdateProducto
    @id INT,
    @nombre VARCHAR(200) = NULL,
    @descripcion TEXT = NULL,
    @precio DECIMAL(12,2) = NULL,
    @stock INT = NULL,
    @id_categoria INT = NULL,
    @imagen_url VARCHAR(500) = NULL,
    @es_nuevo BIT = NULL,
    @activo BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE productos SET
        nombre = COALESCE(@nombre, nombre),
        descripcion = COALESCE(@descripcion, descripcion),
        precio = COALESCE(@precio, precio),
        stock = COALESCE(@stock, stock),
        id_categoria = COALESCE(@id_categoria, id_categoria),
        imagen_url = COALESCE(@imagen_url, imagen_url),
        es_nuevo = COALESCE(@es_nuevo, es_nuevo),
        activo = COALESCE(@activo, activo)
    WHERE id = @id;
    SELECT * FROM productos WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteProducto
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM productos WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: VENTAS
CREATE PROCEDURE spCreateVenta
    @id_cliente INT,
    @id_vendedor INT = NULL,
    @subtotal DECIMAL(12,2),
    @descuento DECIMAL(12,2) = 0,
    @total DECIMAL(12,2),
    @metodo_contacto VARCHAR(30) = 'whatsapp',
    @estado VARCHAR(30) = 'pendiente',
    @codigo_cupon VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ventas (id_cliente, id_vendedor, subtotal, descuento, total, metodo_contacto, estado, codigo_cupon)
    VALUES (@id_cliente, @id_vendedor, @subtotal, @descuento, @total, @metodo_contacto, @estado, @codigo_cupon);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetVentas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT v.*, c.nombre AS cliente_nombre, v2.nombre AS vendedor_nombre
    FROM ventas v
    LEFT JOIN usuarios c ON v.id_cliente = c.id
    LEFT JOIN usuarios v2 ON v.id_vendedor = v2.id
    ORDER BY v.fecha DESC;
END;
GO

CREATE PROCEDURE spGetVentaById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM ventas WHERE id = @id;
END;
GO

CREATE PROCEDURE spUpdateVentaStatus
    @id INT,
    @estado VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ventas SET estado = @estado WHERE id = @id;
    SELECT * FROM ventas WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteVenta
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM detalle_ventas WHERE id_venta = @id;
    DELETE FROM ventas WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: DETALLE_VENTAS
CREATE PROCEDURE spCreateDetalleVenta
    @id_venta INT,
    @id_producto INT,
    @cantidad INT,
    @precio_unitario DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
    VALUES (@id_venta, @id_producto, @cantidad, @precio_unitario);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetDetalleVentaByVenta
    @id_venta INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT dv.*, p.nombre AS producto_nombre
    FROM detalle_ventas dv
    LEFT JOIN productos p ON dv.id_producto = p.id
    WHERE dv.id_venta = @id_venta;
END;
GO

CREATE PROCEDURE spDeleteDetalleVenta
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM detalle_ventas WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: CUPONES
CREATE PROCEDURE spCreateCupon
    @codigo VARCHAR(50),
    @tipo VARCHAR(20),
    @valor DECIMAL(10,2),
    @min_orden DECIMAL(12,2) = 0,
    @max_usos INT = 100,
    @descripcion VARCHAR(300) = NULL,
    @activo BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO cupones (codigo, tipo, valor, min_orden, max_usos, descripcion, activo)
    VALUES (@codigo, @tipo, @valor, @min_orden, @max_usos, @descripcion, @activo);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetCuponByCodigo
    @codigo VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM cupones WHERE codigo = @codigo;
END;
GO

CREATE PROCEDURE spGetCupones
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM cupones ORDER BY codigo;
END;
GO

CREATE PROCEDURE spUpdateCupon
    @id INT,
    @codigo VARCHAR(50) = NULL,
    @tipo VARCHAR(20) = NULL,
    @valor DECIMAL(10,2) = NULL,
    @min_orden DECIMAL(12,2) = NULL,
    @max_usos INT = NULL,
    @activo BIT = NULL,
    @descripcion VARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE cupones SET
        codigo = COALESCE(@codigo, codigo),
        tipo = COALESCE(@tipo, tipo),
        valor = COALESCE(@valor, valor),
        min_orden = COALESCE(@min_orden, min_orden),
        max_usos = COALESCE(@max_usos, max_usos),
        activo = COALESCE(@activo, activo),
        descripcion = COALESCE(@descripcion, descripcion)
    WHERE id = @id;
    SELECT * FROM cupones WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteCupon
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM cupones WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: MOVIMIENTOS STOCK
CREATE PROCEDURE spCreateMovimientoStock
    @id_producto INT,
    @cantidad INT,
    @tipo VARCHAR(20),
    @motivo VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO movimientos_stock (id_producto, cantidad, tipo, motivo)
    VALUES (@id_producto, @cantidad, @tipo, @motivo);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetMovimientosStock
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ms.*, p.nombre AS producto_nombre
    FROM movimientos_stock ms
    LEFT JOIN productos p ON ms.id_producto = p.id
    ORDER BY ms.fecha DESC;
END;
GO

CREATE PROCEDURE spDeleteMovimientoStock
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM movimientos_stock WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: GASTOS
CREATE PROCEDURE spCreateGasto
    @concepto VARCHAR(150),
    @monto DECIMAL(12,2),
    @fecha DATE,
    @id_admin INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO gastos (concepto, monto, fecha, id_admin)
    VALUES (@concepto, @monto, @fecha, @id_admin);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetGastos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT g.*, u.nombre + ' ' + u.apellido AS admin_nombre
    FROM gastos g
    LEFT JOIN usuarios u ON g.id_admin = u.id
    ORDER BY g.fecha DESC;
END;
GO

CREATE PROCEDURE spDeleteGasto
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM gastos WHERE id = @id;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: ACTIVIDAD
CREATE PROCEDURE spCreateActividad
    @usuario_email VARCHAR(150) = NULL,
    @accion VARCHAR(300),
    @estado VARCHAR(20) = 'info'
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO actividad (usuario_email, accion, estado)
    VALUES (@usuario_email, @accion, @estado);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetActividad
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM actividad ORDER BY fecha DESC;
END;
GO

-- PROCEDIMIENTOS ALMACENADOS: CHATBOT FAQS
CREATE PROCEDURE spCreateChatbotFaq
    @pregunta VARCHAR(200),
    @respuesta TEXT,
    @activo BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO chatbot_faqs (pregunta, respuesta, activo)
    VALUES (@pregunta, @respuesta, @activo);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

CREATE PROCEDURE spGetChatbotFaqs
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM chatbot_faqs WHERE activo = 1 ORDER BY id;
END;
GO

CREATE PROCEDURE spUpdateChatbotFaq
    @id INT,
    @pregunta VARCHAR(200) = NULL,
    @respuesta TEXT = NULL,
    @activo BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE chatbot_faqs SET
        pregunta = COALESCE(@pregunta, pregunta),
        respuesta = COALESCE(@respuesta, respuesta),
        activo = COALESCE(@activo, activo)
    WHERE id = @id;
    SELECT * FROM chatbot_faqs WHERE id = @id;
END;
GO

CREATE PROCEDURE spDeleteChatbotFaq
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM chatbot_faqs WHERE id = @id;
END;
GO

-- DATOS DE PRUEBA
INSERT INTO categorias (nombre) VALUES ('mujer'), ('hombre'), ('accesorios');
GO

INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, documento, telefono, direccion, ciudad)
VALUES ('Admin', 'Pandea', 'admin@pandea.com', '$2b$10$6o3Ft/SoKwPo0mvGBf1hMuF5TbB43zGP.4OjxFsH1cG.ABCkzxRHe', 'admin', '123456789', '3001234567', 'Calle 100 #10-10', 'Bogotá');
GO

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, imagen_url, es_nuevo, activo)
VALUES
('Blusa Lino Soleil', 'Blusa de lino con corte amplio para uso diario.', 89000.00, 12, 1, 'https://example.com/blusa.jpg', 1, 1),
('Pantalón Arcilla', 'Pantalón tiro alto con tela fluida y detalle artesanal.', 135000.00, 8, 1, 'https://example.com/pantalon.jpg', 0, 1);
GO

INSERT INTO cupones (codigo, tipo, valor, min_orden, max_usos, descripcion, activo)
VALUES ('BIENVENIDA', 'percent', 10.00, 0.00, 100, '10% de descuento en tu primera compra', 1);
GO
