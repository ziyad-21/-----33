import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gestion.niger.com',
  user: process.env.DB_USER || 'u188519225_zzziiiaaaddd12',
  password: process.env.DB_PASSWORD || 'Azv-01599510',
  database: process.env.DB_NAME || 'u188519225_niger_projects',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
