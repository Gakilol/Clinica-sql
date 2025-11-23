-- Script de creación mínima de tablas (ajústalo a tu esquema real)
CREATE TABLE IF NOT EXISTS Persona (
  ID_persona INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(50),
  apellido VARCHAR(50),
  cedula VARCHAR(20),
  direccion VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Cliente (
  ID_cliente INT PRIMARY KEY -- debe coincidir con Persona.ID_persona si así lo deseas
);

CREATE TABLE IF NOT EXISTS Proveedor (
  ID_proveedor INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(50),
  telefono VARCHAR(20),
  direccion VARCHAR(100),
  correo VARCHAR(50),
  empresa VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Producto (
  ID_producto INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(50),
  descripcion VARCHAR(200),
  precio_unitario DECIMAL(18,2),
  ID_proveedor INT
);

CREATE TABLE IF NOT EXISTS Inventario (
  ID_inventario INT IDENTITY(1,1) PRIMARY KEY,
  ID_producto INT,
  existencia INT,
  stock_min INT,
  stock_max INT,
  fecha_actualizacion DATE
);

CREATE TABLE IF NOT EXISTS Compra (
  ID_compra INT IDENTITY(1,1) PRIMARY KEY,
  ID_cliente INT,
  fecha_facturacion DATE,
  total_pagar DECIMAL(18,2)
);

CREATE TABLE IF NOT EXISTS CompraDetalle (
  ID_detalle INT IDENTITY(1,1) PRIMARY KEY,
  ID_compra INT,
  ID_producto INT,
  cantidad INT,
  precio_unitario DECIMAL(18,2)
);

CREATE TABLE IF NOT EXISTS Usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL
);

-- seed users
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE username='admin')
  INSERT INTO Usuarios (username, password, role) VALUES ('admin','1234','admin');
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE username='cajero')
  INSERT INTO Usuarios (username, password, role) VALUES ('cajero','1234','cajero');
