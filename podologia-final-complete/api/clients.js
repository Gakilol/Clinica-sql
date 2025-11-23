
// api/clients.js
const pool = require('./db'); // existing db helper in your project
module.exports = async function(req, res) {
  try {
    const method = req.method;
    if (method === 'GET') {
      const result = await pool.request().query(`SELECT c.ID_cliente, p.nombre, p.apellido, p.cedula, p.direccion FROM Cliente c JOIN Persona p ON c.ID_cliente = p.ID_persona`);
      return res.json(result.recordset);
    }
    if (method === 'POST') {
      const { nombre, apellido, cedula, direccion } = req.body;
      const r = await pool.request()
        .input('nombre', nombre).input('apellido', apellido)
        .input('cedula', cedula).input('direccion', direccion)
        .query("INSERT INTO Persona (nombre, apellido, cedula, direccion) OUTPUT INSERTED.ID_persona VALUES (@nombre,@apellido,@cedula,@direccion)");
      const newId = r.recordset[0].ID_persona;
      await pool.request().input('id', newId).query("INSERT INTO Cliente (ID_cliente) VALUES (@id)");
      return res.status(201).json({ mensaje: 'Cliente creado', id: newId });
    }
    if (method === 'PUT') {
      const { id, nombre, apellido, cedula, direccion } = req.body;
      await pool.request()
        .input('id', id).input('nombre', nombre).input('apellido', apellido)
        .input('cedula', cedula).input('direccion', direccion)
        .query("UPDATE Persona SET nombre=@nombre, apellido=@apellido, cedula=@cedula, direccion=@direccion WHERE ID_persona=@id");
      return res.json({ mensaje: 'Cliente actualizado' });
    }
    if (method === 'DELETE') {
      const id = req.query.id;
      await pool.request().input('id', id).query("DELETE FROM Cliente WHERE ID_cliente=@id");
      await pool.request().input('id', id).query("DELETE FROM Persona WHERE ID_persona=@id");
      return res.json({ mensaje: 'Cliente eliminado' });
    }
    res.setHeader('Allow','GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
