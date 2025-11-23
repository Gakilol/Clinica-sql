const sql = require('mssql');

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function getPool() {
  if (!global._mssqlPool) {
    global._mssqlPool = await sql.connect(config);
  }
  return global._mssqlPool;
}

module.exports = { sql, getPool };
