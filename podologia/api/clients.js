import { getPool } from './db.js';
import mssql from 'mssql';

export default async function handler(req, res){
  const pool = await getPool();
  if(req.method === 'GET'){
    const result = await pool.request()
      .query(`SELECT c.ID_cliente, p.nombre, p.apellido, p.cedula, p.direccion FROM Cliente c JOIN Persona p ON c.ID_cliente = p.ID_persona`);
    return res.json(result.recordset);
  }
  if(req.method === 'POST'){
    const { nombre, apellido, cedula, direccion } = req.body;
    const tr = new mssql.Transaction(await getPool());
    try{
      await tr.begin();
      const r1 = await tr.request()
        .input('nombre', mssql.VarChar(50), nombre)
        .input('apellido', mssql.VarChar(50), apellido)
        .input('cedula', mssql.VarChar(20), cedula)
        .input('direccion', mssql.VarChar(100), direccion)
        .query(`INSERT INTO Persona (nombre, apellido, cedula, direccion) VALUES (@nombre, @apellido, @cedula, @direccion);
                SELECT SCOPE_IDENTITY() AS id;`);
      const id = r1.recordset[0].id;
      await tr.request().query(`INSERT INTO Cliente (ID_cliente) VALUES (${id});`);
      await tr.commit();
      return res.status(201).send('ok');
    }catch(e){
      await tr.rollback();
      console.error(e);
      return res.status(500).send('err');
    }
  }
  if(req.method === 'PUT'){
    const id = req.query.id || req.url.split('/').pop();
    const { nombre, apellido, cedula, direccion } = req.body;
    await pool.request()
      .input('nombre', mssql.VarChar(50), nombre)
      .input('apellido', mssql.VarChar(50), apellido)
      .input('cedula', mssql.VarChar(20), cedula)
      .input('direccion', mssql.VarChar(100), direccion)
      .input('id', mssql.Int, id)
      .query(`UPDATE Persona SET nombre=@nombre, apellido=@apellido, cedula=@cedula, direccion=@direccion WHERE ID_persona=@id`);
    return res.send('ok');
  }
  if(req.method === 'DELETE'){
    const id = req.query.id || req.url.split('/').pop();
    await pool.request().input('id', mssql.Int, id).query(`DELETE FROM Cliente WHERE ID_cliente=@id; DELETE FROM Persona WHERE ID_persona=@id;`);
    return res.send('ok');
  }
  res.status(405).send('Method not allowed');
}
