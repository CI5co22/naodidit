const STORAGE_PREFIX = 'naoo_';
const originalSetItem = Storage.prototype.setItem;
let saveTimer: number | undefined;

function getAppStorage(): Record<string, string> {
  const values: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    }
  }
  return values;
}

async function saveToDatabase(values: Record<string, string>) {
  const response = await fetch('/api/storage', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error(`No se pudo guardar en la base compartida (${response.status})`);
}

function queueDatabaseSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    void saveToDatabase(getAppStorage()).catch((error: unknown) => {
      console.error('No se pudo sincronizar la información con la base compartida.', error);
    });
  }, 250);
}

export async function initializePersistence() {
  try {
    const response = await fetch('/api/storage', { cache: 'no-store' });
    if (!response.ok) throw new Error(`La base compartida respondió ${response.status}`);

    const savedValues = (await response.json()) as Record<string, string>;
    if (Object.keys(savedValues).length > 0) {
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(STORAGE_PREFIX) && !(key in savedValues)) {
          localStorage.removeItem(key);
        }
      }
      for (const [key, value] of Object.entries(savedValues)) {
        if (key.startsWith(STORAGE_PREFIX)) originalSetItem.call(localStorage, key, value);
      }
    } else {
      // First run: move the existing browser data into SQLite.
      const existingValues = getAppStorage();
      if (Object.keys(existingValues).length > 0) await saveToDatabase(existingValues);
    }
  } catch (error) {
    console.error('No se pudo conectar con la base compartida.', error);
    throw error;
  }

  Storage.prototype.setItem = function (key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && key.startsWith(STORAGE_PREFIX)) queueDatabaseSave();
  };
}
