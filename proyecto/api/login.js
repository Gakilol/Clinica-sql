
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '8h';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensaje: 'Método no permitido' });
  }
  const { usuario, contrasena } = req.body || {};
  if (!usuario || !contrasena) {
    return res.status(400).json({ mensaje: 'usuario y contrasena son requeridos' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('usuario', usuario)
      .query('SELECT ID, usuario, contrasena, rol FROM Usuarios WHERE usuario = @usuario');
    const rows = result.recordset || [];
    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }
    const user = rows[0];
    const ok = bcrypt.compareSync(contrasena, user.contrasena);
    if (!ok) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.ID, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ mensaje: 'Autenticación correcta', token, usuario: { id: user.ID, usuario: user.usuario, rol: user.rol } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ mensaje: 'Error del servidor durante la autenticación' });
  }
}
