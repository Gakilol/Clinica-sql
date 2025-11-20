import { getConnection } from './db.js';
import mssql from 'mssql';
export default async function handler(req,res){
  const pool = await getConnection();
  if(req.method==='GET'){
    const r = await pool.request().query(`SELECT p.ID_producto, p.nombre, p.descripcion, p.precio_unitario, p.ID_proveedor, pr.empresa FROM Producto p LEFT JOIN Proveedor pr ON p.ID_proveedor=pr.ID_proveedor ORDER BY p.ID_producto`);
    return res.json(r.recordset);
  }
  if(req.method==='POST'){
    const { nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
    try{
      const r = await pool.request()
        .input('nombre', mssql.VarChar(50), nombre)
        .input('descripcion', mssql.VarChar(200), descripcion)
        .input('precio', mssql.Decimal(10,2), precio_unitario)
        .input('prov', mssql.Int, ID_proveedor || null)
        .query(`INSERT INTO Producto (nombre,descripcion,precio_unitario,ID_proveedor) VALUES (@nombre,@descripcion,@precio,@prov); SELECT SCOPE_IDENTITY() AS id;`);
      return res.status(201).json({ id: r.recordset[0].id });
    }catch(e){ console.error(e); return res.status(500).send('err'); }
  }
  if(req.method==='PUT'){
    const id = req.query.id || req.url.split('/').pop();
    const { nombre, descripcion, precio_unitario, ID_proveedor } = req.body;
    try{
      await pool.request()
        .input('id', mssql.Int, id)
        .input('nombre', mssql.VarChar(50), nombre)
        .input('descripcion', mssql.VarChar(200), descripcion)
        .input('precio', mssql.Decimal(10,2), precio_unitario)
        .input('prov', mssql.Int, ID_proveedor || null)
        .query(`UPDATE Producto SET nombre=@nombre, descripcion=@descripcion, precio_unitario=@precio, ID_proveedor=@prov WHERE ID_producto=@id`);
      return res.json({ ok:true });
    }catch(e){ console.error(e); return res.status(500).send('err'); }
  }
  if(req.method==='DELETE'){
    const id = req.query.id || req.url.split('/').pop();
    try{
      await pool.request().input('id', mssql.Int, id).query(`DELETE FROM Inventario WHERE ID_producto=@id; DELETE FROM Producto WHERE ID_producto=@id`);
      return res.json({ ok:true });
    }catch(e){ console.error(e); return res.status(500).send('err'); }
  }
  res.status(405).send('Method not allowed');
}
