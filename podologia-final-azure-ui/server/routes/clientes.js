const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');
const { ensureAuth, requireRole, allowRoles } = require('../middleware');

// list
router.get('/', ensureAuth, requireRole('admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Cliente');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

// add (admin or cajero)
router.post('/', ensureAuth, allowRoles(['admin','cajero']), async (req, res) => {
  const { nombre, apellido, cedula, direccion } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .input('apellido', sql.VarChar(50), apellido)
      .input('cedula', sql.VarChar(20), cedula)
      .input('direccion', sql.VarChar(100), direccion)
      .query('INSERT INTO Persona (nombre, apellido, cedula, direccion) VALUES (@nombre,@apellido,@cedula,@direccion);                  DECLARE @pid INT = SCOPE_IDENTITY();                  INSERT INTO Cliente (ID_cliente) VALUES (@pid);');
    res.json({ message: 'created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

// update/delete only admin
router.put('/:id', ensureAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, cedula, direccion } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(50), nombre)
      .input('apellido', sql.VarChar(50), apellido)
      .input('cedula', sql.VarChar(20), cedula)
      .input('direccion', sql.VarChar(100), direccion)
      .query('UPDATE Persona SET nombre=@nombre, apellido=@apellido, cedula=@cedula, direccion=@direccion WHERE ID_persona=@id');
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
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Cliente WHERE ID_cliente=@id; DELETE FROM Persona WHERE ID_persona=@id;');
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
