import { getPool } from './db.js';
import mssql from 'mssql';
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { clienteId, productoId, cantidad } = req.body;
  const pool = await getPool();
  const tr = new mssql.Transaction(pool);
  try{
    await tr.begin();
    const reqt = tr.request();
    const prod = await reqt.input('pid', mssql.Int, productoId).query(`SELECT precio_unitario FROM Producto WHERE ID_producto = @pid`);
    if(!prod.recordset.length) throw new Error('Producto no existe');
    const precio = prod.recordset[0].precio_unitario;
    const total = precio * cantidad;
    await reqt.input('qty', mssql.Int, cantidad).input('pid', mssql.Int, productoId)
      .query(`UPDATE Inventario SET existencia = existencia - @qty WHERE ID_producto = @pid`);
    await reqt.input('cid', mssql.Int, clienteId).input('total', mssql.Decimal(10,2), total)
      .query(`INSERT INTO Compra (ID_cliente, fecha_facturacion, total_pagar) VALUES (@cid, GETDATE(), @total)`);
    await tr.commit();
    return res.json({ ok:true, total });
  }catch(e){
    await tr.rollback();
    console.error(e);
    return res.status(500).send(e.message || 'err');
  }
}
