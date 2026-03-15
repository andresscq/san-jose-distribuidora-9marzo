const { Pool } = require("pg");
require("dotenv").config();

// Creamos la instancia del Pool usando las variables de tu archivo .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Mensaje opcional para confirmar que la conexión base está configurada
pool.on("connect", () => {
  console.log("🐘 Conexión a PostgreSQL establecida desde db.js");
});

// Exportamos el pool
module.exports = pool;
