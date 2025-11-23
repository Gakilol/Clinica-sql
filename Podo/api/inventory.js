import { getPool } from './db.js';
import mssql from 'mssql';
export default async function handler(req, res){
  const pool = await getPool();
  if(req.method === 'GET'){
    const r = await pool.request().query(`SELECT i.ID_inventario, i.ID_producto, p.nombre, p.precio_unitario, i.existencia, i.stock_min, i.stock_max FROM Inventario i JOIN Producto p ON i.ID_producto = p.ID_producto`);
    return res.json(r.recordset);
  }
  res.status(405).send('Method not allowed');
}
