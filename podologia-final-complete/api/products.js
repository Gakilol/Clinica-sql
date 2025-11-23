
// api/products.js
const pool = require('./db');
module.exports = async function(req, res) {
  try {
    const method = req.method;
    if (method === 'GET') {
      const result = await pool.request().query("SELECT P.*, Pr.nombre as proveedor_nombre FROM Producto P LEFT JOIN Proveedor Pr ON P.ID_proveedor=Pr.ID_proveedor");
      return res.json(result.recordset);
    }
    if (method === 'POST') {
      const { nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
      await pool.request()
        .input('nombre', nombre).input('descripcion', descripcion)
        .input('precio', precio_unitario).input('prov', ID_proveedor)
        .query("INSERT INTO Producto (nombre, descripcion, precio_unitario, ID_proveedor) VALUES (@nombre,@descripcion,@precio,@prov)");
      return res.status(201).json({ mensaje: 'Producto creado' });
    }
    if (method === 'PUT') {
      const { id, nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
      await pool.request()
        .input('id', id).input('nombre', nombre).input('descripcion', descripcion)
        .input('precio', precio_unitario).input('prov', ID_proveedor)
        .query("UPDATE Producto SET nombre=@nombre, descripcion=@descripcion, precio_unitario=@precio, ID_proveedor=@prov WHERE ID_producto=@id");
      return res.json({ mensaje: 'Producto actualizado' });
    }
    if (method === 'DELETE') {
      const id = req.query.id;
      await pool.request().input('id', id).query("DELETE FROM Producto WHERE ID_producto=@id");
      return res.json({ mensaje: 'Producto eliminado' });
    }
    res.setHeader('Allow','GET,POST,PUT,DELETE');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
