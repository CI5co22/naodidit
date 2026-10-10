import React, { FormEvent, useEffect, useState } from 'react';
import App from '../App';
import { initializePersistence } from '../utils/persistence';

type GateState = 'checking' | 'login' | 'ready' | 'error';

export const AuthGate: React.FC = () => {
  const [state, setState] = useState<GateState>('checking');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    await initializePersistence();
    setState('ready');
  };

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo revisar la sesión.');
        if (result.authenticated) await loadData();
        else setState('login');
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'No se pudo conectar.');
        setState('error');
      });
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo iniciar sesión.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setState('login');
    setPassword('');
  };

  if (state === 'ready') return <App onLogout={handleLogout} />;
  if (state === 'checking') {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-[#3f4a36]">Conectando con Nao Did It…</div>;
  }

  return (
    <main className="min-h-screen bg-[#fbf9f8] flex items-center justify-center p-5">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#006590]">Nao Did It</h1>
          <p className="text-sm text-[#6f7b64] mt-1">Tus datos, en tus dispositivos</p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-[#3f4a36]">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full bg-[#f5f3f3] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1cb0f6]"
          />
        </label>
        {message && <p role="alert" className="text-sm font-semibold text-[#ba1a1a]">{message}</p>}
        {state === 'error' && <button type="button" onClick={() => window.location.reload()} className="text-sm font-bold text-[#006590]">Reintentar conexión</button>}
        <button type="submit" disabled={submitting || state === 'error'} className="btn-tactile-blue rounded-xl py-3 font-black uppercase disabled:opacity-50">
          {submitting ? 'Conectando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
};
