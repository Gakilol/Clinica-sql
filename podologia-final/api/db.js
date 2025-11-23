import mssql from 'mssql';
let pool;
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: false, trustServerCertificate: true }
};
export async function getPool(){
  if(pool && pool.connected) return pool;
  pool = await mssql.connect(config);
  return pool;
}
