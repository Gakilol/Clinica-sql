create database proyecto
use proyecto

CREATE TABLE Persona (
    ID_persona INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    cedula VARCHAR(20),
    direccion VARCHAR(100)
);

CREATE TABLE Paciente (
    ID_paciente INT PRIMARY KEY,
    FOREIGN KEY (ID_paciente) REFERENCES Persona(ID_persona)
);

CREATE TABLE Historial (
    ID_historial INT IDENTITY(1,1) PRIMARY KEY,
    ID_paciente INT,
    antecedentes_medicos VARCHAR(200),
    asistencias INT,
    FOREIGN KEY (ID_paciente) REFERENCES Paciente(ID_paciente)
);

CREATE TABLE Consulta (
    ID_consulta INT IDENTITY(1,1) PRIMARY KEY,
    ID_paciente INT,
    nombre_consulta VARCHAR(100),
    fecha DATE,
    precio DECIMAL(10,2),
    podologo VARCHAR(50),
    FOREIGN KEY (ID_paciente) REFERENCES Paciente(ID_paciente)
);

CREATE TABLE Cliente (
    ID_cliente INT PRIMARY KEY,
    FOREIGN KEY (ID_cliente) REFERENCES Persona(ID_persona)
);

CREATE TABLE Compra (
    ID_compra INT IDENTITY(1,1) PRIMARY KEY,
    ID_cliente INT,
    fecha_facturacion DATE,
    total_pagar DECIMAL(10,2),
    FOREIGN KEY (ID_cliente) REFERENCES Cliente(ID_cliente)
);

CREATE TABLE Proveedor (
    ID_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50),
    telefono VARCHAR(20),
    direccion VARCHAR(100),
    correo VARCHAR(50),
    empresa VARCHAR(50)
);

CREATE TABLE Producto (
    ID_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion VARCHAR(200),
    precio_unitario DECIMAL(10,2),
    ID_proveedor INT,
    FOREIGN KEY (ID_proveedor) REFERENCES Proveedor(ID_proveedor)
);

CREATE TABLE Inventario (
    ID_inventario INT IDENTITY(1,1) PRIMARY KEY,
    ID_producto INT,
    existencia INT,
    stock_min INT,
    stock_max INT,
    fecha_actualizacion DATE,
    FOREIGN KEY (ID_producto) REFERENCES Producto(ID_producto)
);
