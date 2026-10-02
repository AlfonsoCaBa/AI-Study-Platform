# Registro de aprendizaje — AI Study Platform

AI Study Platform es un proyecto para aprender desarrollo de software construyendo, paso a paso, una aplicación de estudio. La meta inicial es organizar cursos y notas; las funciones de inteligencia artificial están previstas para etapas posteriores. Este registro documentará lo que se construye, las decisiones tomadas y las dudas que surjan, sin asumir que un concepto ya está dominado por aparecer en el código.

## Índice de hitos

1. [Estado inicial del proyecto](#estado-inicial-del-proyecto)
2. [PostgreSQL local](#postgresql-local)
3. [Cursos: tabla y API](#cursos-tabla-y-api)

Los siguientes hitos se añadirán cuando se documenten. Cada uno usará las mismas secciones: objetivo, archivos modificados, flujo, conceptos nuevos, decisiones importantes y dudas pendientes.

## Estado inicial del proyecto

### Objetivo

Registrar el punto de partida actual: una página que comprueba si la API responde. Todavía no hay cursos, notas, base de datos ni funciones de inteligencia artificial implementadas.

### Archivos modificados

- `docs/learning-log.md`: creado para este registro.
- `docs/.gitkeep`: retirado porque `docs/` ya contiene un archivo real.

Archivos existentes consultados para describir el estado:

- `README.md`: propósito, estructura y comandos para ejecutar ambas aplicaciones.
- `backend/app/main.py`: aplicación FastAPI, ruta `GET /health` y configuración CORS local.
- `backend/requirements.txt`: dependencia de FastAPI.
- `frontend/app/page.tsx`: página inicial y comprobación de la API.
- `frontend/app/layout.tsx`: estructura HTML que envuelve la página.
- `frontend/package.json` y `frontend/package-lock.json`: comandos y dependencias del frontend.

### Flujo sencillo

1. El navegador abre la página del frontend en `http://localhost:3000`.
2. La página muestra un mensaje de carga y solicita `http://127.0.0.1:8000/health`.
3. FastAPI responde `{"status":"ok"}`. Su configuración CORS permite que el frontend local lea esa respuesta.
4. La página muestra `API conectada` si recibe la respuesta esperada; si la petición falla, muestra un mensaje de error.

### Conceptos nuevos

Conceptos presentes en el código actual, para estudiar o repasar; este registro no presupone que ya estén aprendidos:

- Una ruta HTTP `GET` y una respuesta JSON.
- Componentes React y rutas basadas en archivos de Next.js.
- Estado (`useState`) y efecto (`useEffect`) en React.
- Peticiones con `fetch`, `async` y `await`.
- CORS al comunicar aplicaciones que usan puertos distintos.

### Decisiones importantes

- El frontend usa Next.js y el backend usa FastAPI; cada uno se ejecuta por separado durante el desarrollo local.
- La comprobación se hace desde el navegador para mostrar carga, éxito y error.
- La API permite peticiones `GET` desde los orígenes locales `localhost:3000` y `127.0.0.1:3000`. La URL de la API está fija para desarrollo local y el README indica que se hará configurable cuando sea necesario desplegar.

### Dudas pendientes

No hay dudas personales registradas todavía. Se añadirán aquí cuando aparezcan.

## PostgreSQL local

### Objetivo

Preparar una base de datos PostgreSQL para desarrollo local y comprobarla con una consulta sencilla. La comprobación se completó: el contenedor quedó en estado `Up` y `SELECT 1` devolvió una fila con `1`.

### Archivos modificados

- `compose.yaml`: define el servicio de PostgreSQL, el puerto local y un volumen para conservar los datos.
- `.env.example`: muestra las variables necesarias; cada persona crea su propio `.env` con una contraseña local.
- `README.md`: explica cómo iniciar, comprobar y detener PostgreSQL.
- `docs/learning-log.md`: registra este hito.

Se comprobó que `.gitignore` ya excluye `.env`; no fue necesario modificarlo.

### Flujo sencillo

1. Docker Compose lee `compose.yaml` y los valores locales de `.env`.
2. Docker inicia PostgreSQL y guarda sus datos en un volumen.
3. `psql` envía `SELECT 1` a PostgreSQL; la respuesta esperada es `1`.
4. FastAPI y el frontend todavía no se conectan a la base de datos.

### Conceptos nuevos

- **Base de datos:** sistema que conserva y permite consultar información.
- **Tabla y fila:** una tabla agrupa datos del mismo tipo; cada fila representa un registro. Aún no hemos creado tablas propias.
- **Volumen de Docker:** almacenamiento que conserva los datos aunque se detenga el contenedor.
- **Variable de entorno:** valor de configuración que se entrega al proceso sin fijarlo directamente en el código.
- **SQL:** lenguaje para consultar y modificar datos; `SELECT 1` es una primera consulta sin tablas.

### Decisiones importantes

- Usar Docker Compose para repetir la misma configuración local con pocos comandos.
- Mantener la contraseña en `.env`, excluido de Git, y publicar sólo `.env.example`.
- Exponer PostgreSQL únicamente en `127.0.0.1` para desarrollo local.
- Posponer la conexión con FastAPI, las tablas de cursos y las migraciones para hitos posteriores.

### Dudas pendientes

No hay dudas personales registradas todavía.

## Cursos: tabla y API

### Objetivo

Crear y listar cursos mediante FastAPI, con datos guardados en PostgreSQL. Esta es la primera parte del hito de cursos; el formulario y la lista del frontend vendrán después.

La implementación se comprobó con scripts temporales: primero validación y respuestas de la API con SQLite, después migración y rutas contra PostgreSQL en un esquema de prueba separado. Pasaron creación y listado, rechazo de entradas inválidas, límite de 100 caracteres, nombres repetidos, texto con apariencia de SQL y lectura desde un proceso nuevo de Python. También se verificaron CORS, la respuesta `503`, la independencia de `/health` y la concordancia del modelo con la migración mediante `alembic check`. El esquema de prueba se eliminó al terminar.

El usuario aplicó la migración y creó un curso desde `/docs` con respuesta `201`. Después de reiniciar FastAPI, una consulta directa a PostgreSQL y otra a `GET /courses` devolvieron las mismas tres filas `Algebra`; repetir el `POST` crea filas nuevas porque los nombres repetidos se permiten. Una petición con sólo espacios devolvió `422` y no añadió filas.

### Archivos modificados

- `backend/requirements.txt`: declara SQLAlchemy, Psycopg, Alembic, python-dotenv y Pydantic como dependencias del backend.
- `backend/app/__init__.py`: permite reconocer `app` como un paquete de Python.
- `backend/app/db.py`: lee el `.env` de la raíz, configura la conexión local y entrega una sesión por petición.
- `backend/app/models.py`: describe la tabla `courses`, con `id` como clave primaria y `name` de hasta 100 caracteres.
- `backend/app/schemas.py`: valida el nombre recibido y define el JSON de respuesta.
- `backend/app/main.py`: añade `POST /courses`, `GET /courses`, permiso CORS para JSON `POST` y una respuesta `503` para fallas de conexión.
- `backend/alembic.ini` y `backend/migrations/env.py`: conectan Alembic con la configuración y el modelo.
- `backend/migrations/script.py.mako`: plantilla para futuras migraciones.
- `backend/migrations/versions/0001_create_courses.py`: primera migración, que crea `courses`.
- `README.md`: documenta la migración, la prueba manual y errores habituales.
- `docs/learning-log.md`: registra esta parte del hito.

### Flujo sencillo

1. En `/docs` se envía `POST /courses` con un nombre en JSON.
2. Pydantic elimina espacios al principio y al final y rechaza nombres vacíos o mayores de 100 caracteres.
3. FastAPI recibe una sesión de base de datos mediante `Depends(get_session)`.
4. SQLAlchemy guarda el curso y `session.commit()` confirma la escritura. PostgreSQL asigna el `id`.
5. La API devuelve `201` con el curso creado. `GET /courses` consulta los cursos por `id` y devuelve una lista.

### Conceptos nuevos

- **Clave primaria:** identificador único de cada fila; aquí es `id`.
- **ORM:** herramienta que relaciona objetos de Python con tablas y genera las consultas SQL.
- **Modelo y esquema de API:** el modelo describe almacenamiento; el esquema define qué JSON se acepta y devuelve.
- **Migración:** cambio explícito de estructura de la base, guardado en el repositorio. Alembic registra las migraciones aplicadas.
- **Sesión y transacción:** la sesión organiza las operaciones con la base; `commit()` confirma la transacción, y cerrar la sesión descarta cambios pendientes.
- **Dependencia de FastAPI:** `Depends` permite entregar a una ruta un recurso, como una sesión, y cerrarlo al terminar la petición.

### Decisiones importantes

- Usar SQLAlchemy con Psycopg y funciones síncronas para esta primera conexión.
- Crear la tabla mediante Alembic. El arranque de FastAPI no modifica la estructura automáticamente.
- Leer las credenciales existentes de `.env` y construir la URL con `URL.create` para admitir caracteres especiales en la contraseña.
- Mantener las rutas en `main.py` mientras son pocas; aún no hay reglas de negocio que requieran una capa de servicios.
- Permitir nombres repetidos; cada curso se distingue por su `id`.
- Mantener `/health` como comprobación del proceso de la API. La conexión con PostgreSQL se comprueba al usar cursos.
- Reservar cuentas y comprobación de propietario para sus hitos. La API actual se usa sólo en desarrollo local.

### Dudas pendientes

Queda aclarar por qué en una consulta desde `/docs` no se vio el curso tras reiniciar FastAPI. Las consultas directas a PostgreSQL y a la API sí mostraron los datos. Cerrar o dejar abiertos los paneles **Try it out** no cambia las filas guardadas.

## Glosario

- **Frontend:** parte de la aplicación con la que interactúa el usuario en el navegador.
- **Backend:** parte que recibe peticiones y ejecuta la lógica de la API.
- **API:** interfaz que permite a otras partes del programa solicitar datos o acciones.
- **Endpoint:** combinación de una ruta y un método HTTP, como `GET /health`.
- **JSON:** formato de texto usado para intercambiar datos estructurados.
- **CORS:** mecanismo del navegador que requiere permiso del servidor para que una página lea respuestas de otro origen.
- **Estado (React):** dato de un componente que, al cambiar, puede actualizar lo que muestra la pantalla.
- **Efecto (React):** código que se ejecuta después del renderizado para interactuar con algo externo al componente, como una API.
- **PostgreSQL:** sistema de base de datos relacional que usaremos para guardar cursos y notas.
- **Docker Compose:** herramienta que inicia servicios definidos en un archivo de configuración.
- **Volumen:** almacenamiento de Docker que puede conservar datos entre ejecuciones de un contenedor.
- **SQL:** lenguaje para consultar y modificar datos de una base de datos relacional.
- **Clave primaria:** columna o conjunto de columnas que identifica de forma única una fila.
- **ORM:** herramienta que permite consultar y guardar filas mediante objetos del lenguaje de programación.
- **Migración:** cambio registrado y aplicable a la estructura de una base de datos.
- **Transacción:** grupo de operaciones que se confirman juntas con `commit()` o se descartan con `rollback()`.
- **Validación:** comprobación de que los datos cumplen las reglas antes de usarlos.
