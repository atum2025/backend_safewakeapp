// server/db.ts
import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const neonUrl = process.env.NEON_DB_URL;
if (!neonUrl) {
  throw new Error("A variável de ambiente NEON_DB_URL não está configurada.");
}

const sql = neon(neonUrl);
export const db = drizzle(sql);
