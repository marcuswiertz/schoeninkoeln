import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

const PG_DATE_OID = 1082;
const PG_TIMESTAMP_OID = 1114;
const PG_TIMESTAMPTZ_OID = 1184;

types.setTypeParser(PG_DATE_OID, (value) => value);
types.setTypeParser(PG_TIMESTAMP_OID, (value) => value);
types.setTypeParser(PG_TIMESTAMPTZ_OID, (value) => value);

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
