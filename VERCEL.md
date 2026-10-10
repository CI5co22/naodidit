# Sincronizar datos con Vercel

El archivo `data/nao-did-it.sqlite` sirve solo para desarrollo local. Para que el mismo contenido aparezca en la web de Vercel y en el celular, conectá el proyecto a Turso Cloud desde el Marketplace de Vercel. Turso conserva el formato SQLite, pero guarda los datos en una base remota compartida; la función `/api/storage` de este proyecto consulta esa base.

## Configuración

1. Sube el proyecto a un repositorio Git y conéctalo a Vercel.
2. En Vercel, agrega **Turso Cloud** desde Marketplace y crea una base. La integración configura `TURSO_DATABASE_URL` y el token. Si el prefijo personalizado hace que el token se llame `TURSO_DATABASE_TURSO_AUTH_TOKEN`, el proyecto también reconoce ese nombre.
3. En **Settings → Environment Variables**, crea `APP_PASSWORD` con una contraseña privada y larga. La app la usa para proteger tus datos en todos tus dispositivos.
4. Antes de abrir la nueva URL de Vercel, enlaza el proyecto local con Vercel y ejecuta `vercel env pull .env.local`. Así tu servidor local usará Turso.
5. En la compu, corre `npm run dev` y abre el mismo `http://localhost:3000` donde estaban tus datos. Inicia sesión con `APP_PASSWORD`; esa visita migra los datos de ese navegador a Turso. Verifica que aparezcan tus tareas y demás información.
6. Despliega en Vercel. La tabla `app_storage` se crea automáticamente en el primer acceso.
7. Abre la URL de Vercel en la compu y el celular; inicia sesión con la misma contraseña. Ambos cargarán y guardarán el mismo contenido.

Para usar la misma base en desarrollo local, ejecuta `vercel env pull .env.local` desde el proyecto enlazado y corre `npm run dev`. Ese archivo está ignorado por Git. No abras primero la URL de Vercel si todavía falta migrar el almacenamiento local existente.

## Tabla

El esquema SQL está en `database/schema.sql`. La aplicación conserva el formato JSON que ya usaba, almacenando cada sección con una clave `naoo_*`; así migra tareas, presupuesto, beca, ánimo, reflexiones y preferencias sin perder la estructura actual.
