
// api/dashboard.js
const pool = require('./db');
module.exports = async function(req, res) {
  try {
    const r1 = await pool.request().query("SELECT COUNT(*) AS totalClientes FROM Cliente");
    const r2 = await pool.request().query("SELECT COUNT(*) AS totalProductos FROM Producto");
    const r3 = await pool.request().query("SELECT COUNT(*) AS totalProveedores FROM Proveedor");
    const r4 = await pool.request().query("SELECT ISNULL(SUM(existencia),0) AS totalStock FROM Inventario");
    return res.json({ clientes: r1.recordset[0].totalClientes, productos: r2.recordset[0].totalProductos, proveedores: r3.recordset[0].totalProveedores, stock: r4.recordset[0].totalStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
};
