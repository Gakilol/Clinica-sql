const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../database');

// login: accepts { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT id, username, password, role FROM Usuarios WHERE username = @username');
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const user = result.recordset[0];
    // passwords in DB may be plain; support plain check OR bcrypt
    const matches = (password === user.password) || bcrypt.compareSync(password, user.password);
    if (!matches) return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });

    // set session
    req.session.user = { id: user.id, username: user.username, role: user.role };
    return res.json({ message: 'OK', role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'logged out' });
});

// endpoint to create seed users if needed
router.post('/seed-users', async (req, res) => {
  try {
    const pool = await getPool();
    // insert only if not exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE username='admin')
      INSERT INTO Usuarios (username, password, role) VALUES ('admin', '1234', 'admin');

      IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE username='cajero')
      INSERT INTO Usuarios (username, password, role) VALUES ('cajero', '1234', 'cajero');
    `);
    res.json({ message: 'seeded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
