import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@libsql/client';
import {
  clearedSessionCookie,
  createSession,
  hasValidSession,
  secureCompare,
  sessionCookie,
} from './server/session.mjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const root = process.cwd();
const dataDirectory = path.join(root, 'data');
mkdirSync(dataDirectory, { recursive: true });

const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_TURSO_AUTH_TOKEN;
const useTurso = Boolean(process.env.TURSO_DATABASE_URL && tursoAuthToken);
const localDatabase = useTurso ? null : new DatabaseSync(path.join(dataDirectory, 'nao-did-it.sqlite'));
const remoteDatabase = useTurso
  ? createClient({ url: process.env.TURSO_DATABASE_URL, authToken: tursoAuthToken })
  : null;
const schemaSql = `
  CREATE TABLE IF NOT EXISTS app_storage (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

if (localDatabase) localDatabase.exec(schemaSql);
if (remoteDatabase) await remoteDatabase.execute(schemaSql);

app.use(express.json({ limit: '1mb' }));

const secureRequest = (request) => request.secure || request.headers['x-forwarded-proto'] === 'https';
const isAuthenticated = (request) => {
  const password = process.env.APP_PASSWORD;
  return !password || hasValidSession(request.headers.cookie, password);
};

app.get('/api/auth', (request, response) => {
  response.json({ authenticated: isAuthenticated(request) });
});

app.post('/api/auth', (request, response) => {
  const password = process.env.APP_PASSWORD;
  const submittedPassword = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!password || !secureCompare(submittedPassword, password)) {
    response.status(401).json({ error: 'La contraseña no coincide.' });
    return;
  }
  response.setHeader('Set-Cookie', sessionCookie(createSession(password), secureRequest(request)));
  response.json({ authenticated: true });
});

app.delete('/api/auth', (_request, response) => {
  response.setHeader('Set-Cookie', clearedSessionCookie(secureRequest(_request)));
  response.json({ authenticated: false });
});

app.get('/api/storage', async (request, response) => {
  if (!isAuthenticated(request)) {
    response.status(401).json({ error: 'Inicia sesión para acceder a tus datos.' });
    return;
  }
  const rows = remoteDatabase
    ? (await remoteDatabase.execute('SELECT key, value FROM app_storage')).rows
    : localDatabase.prepare('SELECT key, value FROM app_storage').all();
  response.set('Cache-Control', 'no-store');
  response.json(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
});

app.put('/api/storage', async (request, response) => {
  if (!isAuthenticated(request)) {
    response.status(401).json({ error: 'Inicia sesión para guardar tus datos.' });
    return;
  }
  const values = request.body;
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    response.status(400).json({ error: 'Se esperaba un objeto de datos.' });
    return;
  }

  try {
    if (remoteDatabase) {
      const statements = Object.entries(values)
        .filter(([key, value]) => key.startsWith('naoo_') && typeof value === 'string')
        .map(([key, value]) => ({
          sql: `INSERT INTO app_storage (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
          args: [key, value],
        }));
      if (statements.length > 0) await remoteDatabase.batch(statements, 'write');
    } else {
      const saveValue = localDatabase.prepare(`
        INSERT INTO app_storage (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);
      localDatabase.exec('BEGIN');
      for (const [key, value] of Object.entries(values)) {
        if (key.startsWith('naoo_') && typeof value === 'string') saveValue.run(key, value);
      }
      localDatabase.exec('COMMIT');
    }
    response.json({ saved: true });
  } catch (error) {
    if (localDatabase?.isTransaction) localDatabase.exec('ROLLBACK');
    console.error('Error guardando los datos de la app:', error);
    response.status(500).json({ error: 'No se pudieron guardar los datos.' });
  }
});

const production = process.argv.includes('--production');
if (production) {
  const distDirectory = path.join(root, 'dist');
  app.use(express.static(distDirectory));
  app.get('*', (_request, response) => response.sendFile(path.join(distDirectory, 'index.html')));
} else {
  const vite = await createViteServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Nao Did It está corriendo en http://localhost:${port}`);
  console.log(`Base SQLite: ${path.join(dataDirectory, 'nao-did-it.sqlite')}`);
});
