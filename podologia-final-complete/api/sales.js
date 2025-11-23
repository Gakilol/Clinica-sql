
// api/sales.js
const pool = require('./db');
module.exports = async function(req, res) {
  try {
    if (req.method === 'POST') {
      const { ID_cliente, items, total } = req.body;
      const r = await pool.request().input('cliente', ID_cliente).input('total', total)
        .query("INSERT INTO Compra (ID_cliente, fecha_facturacion, total_pagar) OUTPUT INSERTED.ID_compra VALUES (@cliente, GETDATE(), @total)");
      const idCompra = r.recordset[0].ID_compra;
      for (const it of items) {
        await pool.request().input('prod', it.ID_producto).input('cant', it.cantidad)
          .query("UPDATE Inventario SET existencia = existencia - @cant, fecha_actualizacion = GETDATE() WHERE ID_producto = @prod");
      }
      return res.status(201).json({ mensaje: 'Venta registrada', idCompra });
    }
    res.setHeader('Allow','POST');
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
