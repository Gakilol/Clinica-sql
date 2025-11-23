
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { usuario, contraseña } = req.body;

  if (usuario === "admin" && contraseña === "Admin123*") {
    return res.json({ mensaje: "Login exitoso", rol: "admin", usuario: "admin" });
  }
  if (usuario === "cajero" && contraseña === "Cajero123*") {
    return res.json({ mensaje: "Login exitoso", rol: "cajero", usuario: "cajero" });
  }
  return res.status(401).json({ error: "Credenciales incorrectas" });
}
