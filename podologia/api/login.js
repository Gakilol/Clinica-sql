export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { usuario, contrasena } = req.body;

  if (usuario === "admin" && contrasena === "Admin123*") {
    return res.json({
      mensaje: "Login exitoso",
      rol: "admin",
      usuario: "admin"
    });
  }

  if (usuario === "cajero" && contrasena === "Cajero123*") {
    return res.json({
      mensaje: "Login exitoso",
      rol: "cajero",
      usuario: "cajero"
    });
  }

  return res.status(401).json({ error: "Credenciales incorrectas" });
}
