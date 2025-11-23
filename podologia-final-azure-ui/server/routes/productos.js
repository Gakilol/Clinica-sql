const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');
const { ensureAuth, requireRole, allowRoles } = require('../middleware');

// list
router.get('/', ensureAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Producto');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

// create (admin)
router.post('/', ensureAuth, requireRole('admin'), async (req, res) => {
  const { nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .input('descripcion', sql.VarChar(200), descripcion)
      .input('precio_unitario', sql.Decimal(18,2), precio_unitario)
      .input('ID_proveedor', sql.Int, ID_proveedor)
      .query('INSERT INTO Producto (nombre, descripcion, precio_unitario, ID_proveedor) VALUES (@nombre,@descripcion,@precio_unitario,@ID_proveedor)');
    res.json({ message: 'created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

// update (admin)
router.put('/:id', ensureAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(50), nombre)
      .input('descripcion', sql.VarChar(200), descripcion)
      .input('precio_unitario', sql.Decimal(18,2), precio_unitario)
      .input('ID_proveedor', sql.Int, ID_proveedor)
      .query('UPDATE Producto SET nombre=@nombre, descripcion=@descripcion, precio_unitario=@precio_unitario, ID_proveedor=@ID_proveedor WHERE ID_producto=@id');
    res.json({ message: 'updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

// delete (admin)
router.delete('/:id', ensureAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Producto WHERE ID_producto=@id');
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
