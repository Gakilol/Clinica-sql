const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');
const { ensureAuth, allowRoles } = require('../middleware');

// create sale
// expects { ID_cliente, items: [{ ID_producto, cantidad, precio_unitario }], total_pagar }
router.post('/', ensureAuth, allowRoles(['admin','cajero']), async (req, res) => {
  const { ID_cliente, items, total_pagar } = req.body;
  try {
    const pool = await getPool();
    const tr = new sql.Transaction(pool);
    await tr.begin();
    const ps = tr.request();
    // insert into Compra (ID_cliente, fecha_facturacion, total_pagar)
    const insertCompra = await ps
      .input('ID_cliente', sql.Int, ID_cliente)
      .input('fecha', sql.Date, new Date())
      .input('total', sql.Decimal(18,2), total_pagar)
      .query('INSERT INTO Compra (ID_cliente, fecha_facturacion, total_pagar) VALUES (@ID_cliente, @fecha, @total); SELECT SCOPE_IDENTITY() AS id;');
    const compraId = insertCompra.recordset[0].id;
    // iterate items (this assumes a CompraDetalle table; if not, it just adjusts inventory)
    for (const it of items) {
      // reduce inventory
      await ps.input('pid', sql.Int, it.ID_producto)
              .input('qty', sql.Int, it.cantidad)
              .query('UPDATE Inventario SET existencia = existencia - @qty WHERE ID_producto = @pid');
      // optionally insert into CompraDetalle if exists
      await ps.input('compraId', sql.Int, compraId)
              .input('pid', sql.Int, it.ID_producto)
              .input('qty', sql.Int, it.cantidad)
              .input('precio', sql.Decimal(18,2), it.precio_unitario)
              .query(`IF OBJECT_ID('CompraDetalle') IS NOT NULL
                     INSERT INTO CompraDetalle (ID_compra, ID_producto, cantidad, precio_unitario) VALUES (@compraId,@pid,@qty,@precio)`);
    }
    await tr.commit();
    res.json({ message: 'venta registrada', compraId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
