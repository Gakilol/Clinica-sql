
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { usuario, contrasena } = req.body;

  if (usuario === "admin" && contrasena === "Admin123*") {
    const token = jwt.sign({ rol: "admin", usuario: "admin" }, process.env.JWT_SECRET || "demo_secret", { expiresIn: "8h" });
    return res.json({ mensaje: "Login exitoso", rol: "admin", token });
  }

  if (usuario === "cajero" && contrasena === "Cajero123*") {
    const token = jwt.sign({ rol: "cajero", usuario: "cajero" }, process.env.JWT_SECRET || "demo_secret", { expiresIn: "8h" });
    return res.json({ mensaje: "Login exitoso", rol: "cajero", token });
  }

  return res.status(401).json({ error: "Credenciales incorrectas" });
}
