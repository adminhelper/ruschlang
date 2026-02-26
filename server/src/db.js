import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_SSL,
} = process.env;

export const pool = mysql.createPool({
  host: MYSQL_HOST || "127.0.0.1",
  port: Number(MYSQL_PORT || 3306),
  user: MYSQL_USER || "ruschlang",
  password: MYSQL_PASSWORD || "ruschlang",
  database: MYSQL_DATABASE || "ruschlang",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: MYSQL_SSL ? { rejectUnauthorized: false } : undefined,
});

export async function ping() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}
