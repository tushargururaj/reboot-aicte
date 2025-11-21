import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secret-2",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default db;