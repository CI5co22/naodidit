import { createClient } from '@libsql/client';
import { hasValidSession } from '../server/session.mjs';

let database;
let schemaReady;

function getAuthToken() {
  return process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_TURSO_AUTH_TOKEN;
}

function getDatabase() {
  const authToken = getAuthToken();
  if (!process.env.TURSO_DATABASE_URL || !authToken) {
    throw new Error('Configura la integración Turso Cloud para Vercel.');
  }
  if (!database) {
    database = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken,
    });
  }
  return database;
}

async function ensureSchema(client) {
  if (!schemaReady) {
    schemaReady = client.execute(`
      CREATE TABLE IF NOT EXISTS app_storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  await schemaReady;
}

function isAuthorized(request) {
  const password = process.env.APP_PASSWORD;
  return Boolean(password && hasValidSession(request.headers.cookie, password));
}

export default async function handler(request, response) {
  if (!isAuthorized(request)) {
    response.status(401).json({ error: 'Inicia sesión para acceder a tus datos.' });
    return;
  }

  try {
    const client = getDatabase();
    await ensureSchema(client);

    if (request.method === 'GET') {
      const result = await client.execute('SELECT key, value FROM app_storage');
      response.setHeader('Cache-Control', 'no-store');
      response.status(200).json(Object.fromEntries(result.rows.map((row) => [row.key, row.value])));
      return;
    }

    if (request.method === 'PUT') {
      const values = request.body;
      if (!values || typeof values !== 'object' || Array.isArray(values)) {
        response.status(400).json({ error: 'Se esperaba un objeto de datos.' });
        return;
      }

      const statements = Object.entries(values)
        .filter(([key, value]) => key.startsWith('naoo_') && typeof value === 'string')
        .map(([key, value]) => ({
          sql: `
            INSERT INTO app_storage (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = CURRENT_TIMESTAMP
          `,
          args: [key, value],
        }));

      if (statements.length > 0) await client.batch(statements, 'write');
      response.status(200).json({ saved: true });
      return;
    }

    response.setHeader('Allow', 'GET, PUT');
    response.status(405).end();
  } catch (error) {
    console.error('Error en almacenamiento Turso:', error);
    response.status(500).json({ error: 'No se pudo conectar o guardar en la base de datos.' });
  }
}
