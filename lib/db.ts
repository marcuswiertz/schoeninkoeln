import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __schoeninkoelnPool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL fehlt. Für Railway bitte die Postgres-Verbindung als Umgebungsvariable setzen.");
  }

  return databaseUrl;
}

export function getPool() {
  if (!global.__schoeninkoelnPool) {
    global.__schoeninkoelnPool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }

  return global.__schoeninkoelnPool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
