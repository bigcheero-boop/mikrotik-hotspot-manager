/* Table schema:
CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
*/

// This file provides a simple key-value interface for storing application data.
// Uses direct Postgres access so it works on a VPS-managed Postgres.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Reuse a single client connection instead of creating one per query
let pgClient: Client | null = null;

const getPgClient = async (): Promise<Client> => {
  if (pgClient) return pgClient;

  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) throw new Error("DATABASE_URL not set");

  pgClient = new Client(databaseUrl);
  await pgClient.connect();

  // Ensure the table exists on first connection
  await pgClient.queryArray(`
    CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
      key TEXT NOT NULL PRIMARY KEY,
      value JSONB NOT NULL
    );
  `);

  return pgClient;
};

// Helper: JSONB columns are auto-parsed by deno-postgres, so only call
// JSON.parse when the driver returns a raw string.
function parseValue(val: unknown): any {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const pg = await getPgClient();
  await pg.queryArray(
    `INSERT INTO kv_store_4f18e215 (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
    key,
    JSON.stringify(value),
  );
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const pg = await getPgClient();
  const result = await pg.queryObject<{ value: unknown }>(
    "SELECT value FROM kv_store_4f18e215 WHERE key = $1 LIMIT 1",
    key,
  );
  const row = result.rows[0];
  return row ? parseValue(row.value) : null;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const pg = await getPgClient();
  await pg.queryArray("DELETE FROM kv_store_4f18e215 WHERE key = $1", key);
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const pg = await getPgClient();
  for (let i = 0; i < keys.length; i++) {
    await pg.queryArray(
      `INSERT INTO kv_store_4f18e215 (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      keys[i],
      JSON.stringify(values[i]),
    );
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  const pg = await getPgClient();
  const result = await pg.queryObject<{ value: unknown }>(
    `SELECT value FROM kv_store_4f18e215 WHERE key = ANY($1::text[])`,
    keys,
  );
  return result.rows.map((r) => parseValue(r.value));
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const pg = await getPgClient();
  await pg.queryArray(`DELETE FROM kv_store_4f18e215 WHERE key = ANY($1::text[])`, keys);
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const pg = await getPgClient();
  const pattern = prefix + "%";
  const result = await pg.queryObject<{ value: unknown }>(
    `SELECT value FROM kv_store_4f18e215 WHERE key LIKE $1`,
    pattern,
  );
  return result.rows.map((r) => parseValue(r.value));
};
