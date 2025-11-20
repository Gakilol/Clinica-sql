import sql from 'mssql';
let pool;
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: true, trustServerCertificate: false }
};
export async function getConnection(){
  if(pool && pool.connected) return pool;
  pool = await sql.connect(config);
  return pool;
}
