
// api/inventory.js
const pool = require('./db');
module.exports = async function(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await pool.request().query("SELECT I.*, P.nombre as producto_nombre FROM Inventario I LEFT JOIN Producto P ON I.ID_producto=P.ID_producto");
      return res.json(result.recordset);
    }
    if (req.method === 'PUT') {
      const { id, existencia, stock_min, stock_max } = req.body;
      await pool.request().input('id', id).input('existencia', existencia).input('min', stock_min).input('max', stock_max)
        .query("UPDATE Inventario SET existencia=@existencia, stock_min=@min, stock_max=@max, fecha_actualizacion=GETDATE() WHERE ID_inventario=@id");
      return res.json({ mensaje: 'Inventario actualizado' });
    }
    res.setHeader('Allow','GET,PUT');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
