import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __poolGastos: Pool | undefined;
}

/**
 * Construye la URI de conexión desde variables de entorno o usa DATABASE_URL.
 */
function getConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ?? "5432";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  if (!host || !user || !password || !database) {
    throw new Error(
      "Configura DATABASE_URL o las variables DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en .env"
    );
  }
  const encodedPassword = encodeURIComponent(password);
  const ssl = process.env.DB_SSL !== "false";
  const params = ssl ? "?sslmode=require" : "";
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}${params}`;
}

/**
 * URI para la segunda base de datos (gastos n8n). Usa DB_NAME_GASTOS o "db_savvy".
 */
function getConnectionStringGastos(): string {
  const baseUrl = process.env.DATABASE_URL;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ?? "5432";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME_GASTOS ?? "db_savvy";
  if (baseUrl) {
    try {
      const u = new URL(baseUrl);
      u.pathname = `/${database}`;
      const ssl = process.env.DB_SSL !== "false";
      if (ssl) u.searchParams.set("sslmode", "require");
      return u.toString();
    } catch {
      return `postgresql://${user}:${encodeURIComponent(password!)}@${host}:${port}/${database}${process.env.DB_SSL !== "false" ? "?sslmode=require" : ""}`;
    }
  }
  if (!host || !user || !password) {
    throw new Error(
      "Para gastos n8n configura DB_NAME_GASTOS y las mismas DB_HOST, DB_USER, DB_PASSWORD (o DATABASE_URL)."
    );
  }
  const encodedPassword = encodeURIComponent(password);
  const ssl = process.env.DB_SSL !== "false";
  const params = ssl ? "?sslmode=require" : "";
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}${params}`;
}

/**
 * Obtiene el pool de conexiones a PostgreSQL.
 * En desarrollo reutiliza la misma instancia para evitar demasiadas conexiones.
 * Para RDS/SSL usa rejectUnauthorized: false si el certificado no es de confianza.
 */
function getPool(): Pool {
  const connectionString = getConnectionString();
  if (!global.__pool) {
    const useSSL =
      connectionString.includes("rds.amazonaws.com") ||
      connectionString.includes("sslmode=require");
    global.__pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    });
  }
  return global.__pool;
}

export const pool = getPool();

/**
 * Pool para la base de datos de gastos n8n (db_savvy).
 */
function getPoolGastos(): Pool {
  const connectionString = getConnectionStringGastos();
  if (!global.__poolGastos) {
    const useSSL =
      connectionString.includes("rds.amazonaws.com") ||
      connectionString.includes("sslmode=require");
    global.__poolGastos = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    });
  }
  return global.__poolGastos;
}

export const poolGastos = getPoolGastos();

/**
 * Ejecuta una consulta en la base de datos de gastos (db_savvy).
 */
export async function queryGastos<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await poolGastos.query(text, params);
  return result.rows as T[];
}

/**
 * Ejecuta una consulta SQL con parámetros opcionales.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Prueba la conexión a la base de datos.
 * Útil para health checks o al iniciar la app.
 */
export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    await pool.query("SELECT 1");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
