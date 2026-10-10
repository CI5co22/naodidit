import {
  clearedSessionCookie,
  createSession,
  hasValidSession,
  secureCompare,
  sessionCookie,
} from '../server/session.mjs';

function isSecureRequest(request) {
  return process.env.VERCEL === '1' || request.headers['x-forwarded-proto'] === 'https';
}

export default function handler(request, response) {
  const password = process.env.APP_PASSWORD;
  const secure = isSecureRequest(request);

  if (request.method === 'GET') {
    if (!password && process.env.VERCEL === '1') {
      response.status(503).json({ error: 'Falta configurar APP_PASSWORD en Vercel.' });
      return;
    }
    response.status(200).json({ authenticated: !password || hasValidSession(request.headers.cookie, password) });
    return;
  }

  if (request.method === 'POST') {
    if (!password) {
      response.status(503).json({ error: 'Configura APP_PASSWORD para iniciar sesión.' });
      return;
    }
    const submittedPassword = typeof request.body?.password === 'string' ? request.body.password : '';
    if (!secureCompare(submittedPassword, password)) {
      response.status(401).json({ error: 'La contraseña no coincide.' });
      return;
    }
    response.setHeader('Set-Cookie', sessionCookie(createSession(password), secure));
    response.status(200).json({ authenticated: true });
    return;
  }

  if (request.method === 'DELETE') {
    response.setHeader('Set-Cookie', clearedSessionCookie(secure));
    response.status(200).json({ authenticated: false });
    return;
  }

  response.setHeader('Allow', 'GET, POST, DELETE');
  response.status(405).end();
}
