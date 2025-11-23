-- Script para crear tabla Usuarios e insertar cuentas iniciales
CREATE TABLE IF NOT EXISTS Usuarios (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(200) NOT NULL,
    rol VARCHAR(20) NOT NULL
);

-- Insertar usuarios iniciales (contraseñas ya hasheadas con bcrypt)
INSERT INTO Usuarios (usuario, contrasena, rol) VALUES ('admin', '$2b$12$9tnVUCu6gyyGK6rUdGww/.6KUseBPkA0hq3ncFudoUMRFsKMsuOWu', 'admin');
INSERT INTO Usuarios (usuario, contrasena, rol) VALUES ('cajero', '$2b$12$VCtuZtbgjNK/0aJHrBLP9uJ2vS.3q0hZ3UsWf1KEhMTpamlVVTuHe', 'cajero');
