
// api/providers.js
const pool = require('./db');
module.exports = async function(req, res) {
  try {
    const method = req.method;
    if (method === 'GET') {
      const result = await pool.request().query("SELECT * FROM Proveedor");
      return res.json(result.recordset);
    }
    if (method === 'POST') {
      const { nombre, telefono, direccion, correo, empresa } = req.body;
      await pool.request()
        .input('nombre', nombre).input('telefono', telefono)
        .input('direccion', direccion).input('correo', correo).input('empresa', empresa)
        .query("INSERT INTO Proveedor (nombre, telefono, direccion, correo, empresa) VALUES (@nombre,@telefono,@direccion,@correo,@empresa)");
      return res.status(201).json({ mensaje: 'Proveedor creado' });
    }
    if (method === 'PUT') {
      const { id, nombre, telefono, direccion, correo, empresa } = req.body;
      await pool.request()
        .input('id', id).input('nombre', nombre).input('telefono', telefono)
        .input('direccion', direccion).input('correo', correo).input('empresa', empresa)
        .query("UPDATE Proveedor SET nombre=@nombre, telefono=@telefono, direccion=@direccion, correo=@correo, empresa=@empresa WHERE ID_proveedor=@id");
      return res.json({ mensaje: 'Proveedor actualizado' });
    }
    if (method === 'DELETE') {
      const id = req.query.id;
      await pool.request().input('id', id).query("DELETE FROM Proveedor WHERE ID_proveedor=@id");
      return res.json({ mensaje: 'Proveedor eliminado' });
    }
    res.setHeader('Allow','GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
