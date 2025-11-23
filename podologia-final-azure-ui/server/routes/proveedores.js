const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');
const { ensureAuth, requireRole } = require('../middleware');

// list
router.get('/', ensureAuth, requireRole('admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Proveedor');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

router.post('/', ensureAuth, requireRole('admin'), async (req, res) => {
  const { nombre, telefono, direccion, correo, empresa } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .input('telefono', sql.VarChar(20), telefono)
      .input('direccion', sql.VarChar(100), direccion)
      .input('correo', sql.VarChar(50), correo)
      .input('empresa', sql.VarChar(50), empresa)
      .query('INSERT INTO Proveedor (nombre, telefono, direccion, correo, empresa) VALUES (@nombre,@telefono,@direccion,@correo,@empresa)');
    res.json({ message: 'created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

router.put('/:id', ensureAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  const { nombre, telefono, direccion, correo, empresa } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(50), nombre)
      .input('telefono', sql.VarChar(20), telefono)
      .input('direccion', sql.VarChar(100), direccion)
      .input('correo', sql.VarChar(50), correo)
      .input('empresa', sql.VarChar(50), empresa)
      .query('UPDATE Proveedor SET nombre=@nombre, telefono=@telefono, direccion=@direccion, correo=@correo, empresa=@empresa WHERE ID_proveedor=@id');
    res.json({ message: 'updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

router.delete('/:id', ensureAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Proveedor WHERE ID_proveedor=@id');
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
