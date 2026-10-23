# Registro de aprendizaje — AI Study Platform

AI Study Platform es un proyecto para aprender desarrollo de software construyendo, paso a paso, una aplicación de estudio. La meta inicial es organizar cursos y notas; las funciones de inteligencia artificial están previstas para etapas posteriores. Este registro documentará lo que se construye, las decisiones tomadas y las dudas que surjan, sin asumir que un concepto ya está dominado por aparecer en el código.

Para las pruebas futuras, el usuario prefiere recibir la indicación breve **«corre Docker, frontend y backend»**, porque ya sabe iniciar estos servicios. Las comprobaciones de cada función se seguirán guiando paso a paso.

## Índice de hitos

1. [Estado inicial del proyecto](#estado-inicial-del-proyecto)
2. [PostgreSQL local](#postgresql-local)
3. [Cursos: tabla y API](#cursos-tabla-y-api)
4. [Cursos desde el frontend](#cursos-desde-el-frontend)
5. [Notas: tabla y API](#notas-tabla-y-api)
6. [Notas desde el frontend](#notas-desde-el-frontend)
7. [Notas: edición y eliminación en la API](#notas-edición-y-eliminación-en-la-api)

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

## Cursos desde el frontend

### Objetivo

Crear y consultar cursos desde `/courses`, usando la API existente. Se verificaron el build de Next.js y TypeScript, y una prueba de navegador con respuestas simuladas de la API: navegación, lista vacía, validación, creación, bloqueo durante el envío, recarga, respuestas `422` y `503`, conservación del texto y reintento.

El usuario completó la prueba manual con FastAPI y PostgreSQL reales: vio los cursos existentes, creó `Programación`, comprobó que apareció en la lista y que el campo quedó vacío, y confirmó que el curso seguía presente tras recargar. Un nombre de sólo espacios mostró el mensaje de validación sin añadir un curso. Al detener FastAPI y recargar apareció el error; después de reiniciar la API y pulsar **Reintentar**, la lista volvió a cargarse. Con estas comprobaciones se completa el hito de crear y listar cursos desde la interfaz.

### Archivos modificados

- `frontend/app/courses/page.tsx`: página con formulario, lista y mensajes de carga, éxito y error. Define el tipo `Course` y comprueba la forma del JSON recibido.
- `frontend/app/page.tsx`: enlace a la página de cursos mediante `Link`.
- `README.md`: pasos para probar la interfaz con los tres servicios encendidos.
- `docs/learning-log.md`: registro de esta segunda parte del hito de cursos.

### Flujo sencillo

1. Next.js asocia `app/courses/page.tsx` con la ruta `/courses`.
2. Al abrirla, `useEffect` pide `GET /courses`; `useState` guarda la lista y actualiza la pantalla.
3. El campo usa `value` y `onChange` para mantener lo escrito en el estado `name`.
4. Al enviar el formulario, `preventDefault()` evita la navegación normal del formulario. Se valida el nombre y se envía un JSON a `POST /courses`.
5. Tras la confirmación de la API, se añade el curso devuelto a la lista con su `id`, se limpia el campo y se muestra el éxito.
6. Al recargar, la lista vuelve a consultarse a la API. React conserva el estado mientras la página está montada; PostgreSQL conserva los datos guardados.

### Conceptos nuevos

- **Formulario controlado:** el valor del campo está en el estado de React y cambia mediante `onChange`.
- **Evento de envío:** `onSubmit` permite responder tanto al botón como a la tecla Enter.
- **Actualización funcional del estado:** `setCourses((current) => [...current, course])` usa la lista más reciente para añadir el curso.
- **Clave de React:** `key={course.id}` identifica cada elemento, incluso cuando hay nombres repetidos.
- **Cancelación y tiempo de espera:** `AbortController` cancela la carga al abandonar la página; las peticiones tienen un límite de 10 segundos.
- **Estado de envío:** `saving` permite mostrar progreso y desactivar el formulario mientras se espera la respuesta.

### Decisiones importantes

- Usar una ruta propia para cursos y conservar el enlace de vuelta al inicio.
- Mantener formulario y lista en un componente pequeño antes de introducir componentes o utilidades compartidas.
- Realizar las peticiones desde el navegador, como en la comprobación de `/health`; la API ya permite `GET` y `POST` mediante CORS local.
- Esperar a que termine la carga inicial antes de permitir crear un curso, evitando que una respuesta de listado antigua sobrescriba el curso nuevo.
- Actualizar la lista sólo tras recibir la confirmación de creación del servidor.
- Conservar el texto ante fallas de guardado y pedir comprobar la lista antes de repetir un envío cuyo resultado no se pudo confirmar.
- Mantener la validación del backend como comprobación definitiva; la validación del formulario ayuda a corregir errores antes de enviar.

### Dudas pendientes

No hay dudas personales nuevas registradas. La prueba manual con los servicios reales y la comprobación de persistencia al recargar se completaron.

## Notas: tabla y API

### Objetivo

Crear y listar notas asociadas a un curso mediante la API. Cada nota tiene `id`, `course_id`, título y contenido. Esta es la primera parte del hito de notas, que continuará con la interfaz y después con edición y eliminación.

La migración y las rutas se comprobaron en PostgreSQL con un esquema temporal separado. Pasaron creación y listado, separación entre dos cursos, normalización del título, conservación de saltos de línea y sangría, límites de longitud, rechazo de entradas inválidas (`422`) y curso inexistente (`404`). La base rechazó una inserción directa con un curso inexistente mediante la clave foránea. Las notas se recuperaron desde un proceso nuevo de Python. También se verificaron la repetición de la migración, su concordancia con el modelo mediante `alembic check` y la reversión de la migración de notas conservando los cursos de prueba. El esquema temporal se eliminó al terminar.

El usuario aplicó `0002_create_notes` y completó la prueba manual desde `/docs`: creó la nota `Ecuaciones lineales` para el curso `2` (`Algebra`) con respuesta `201`, y la recuperó con `GET` (`200`). El curso `1` devolvió `200` y una lista vacía, confirmando la separación por curso. Un título de sólo espacios recibió `422`; un curso inexistente recibió `404`. Después de reiniciar FastAPI, la misma nota seguía presente con `id: 1`. Con estas comprobaciones se completa la primera parte del hito de notas: tabla y API.

### Archivos modificados

- `backend/app/models.py`: añade `Note`, su referencia a `courses.id`, restricciones e índice por `course_id`.
- `backend/app/schemas.py`: añade `NoteCreate`, validación del contenido y `NoteRead`.
- `backend/app/api/__init__.py`: identifica `api` como paquete de Python.
- `backend/app/api/notes.py`: agrupa las rutas de creación y listado de notas.
- `backend/app/main.py`: registra el router de notas.
- `backend/migrations/versions/0002_create_notes.py`: crea `notes` después de la migración de cursos.
- `README.md`: instrucciones de migración, prueba manual y reglas de validación.
- `docs/learning-log.md`: registra esta primera parte del hito de notas.

### Flujo sencillo

1. En `/docs` se elige un `course_id` obtenido de `GET /courses`.
2. Se envía `POST /courses/{course_id}/notes` con `title` y `content` en JSON. El curso se indica en la URL.
3. Pydantic valida el identificador y los datos. FastAPI comprueba que el curso existe.
4. SQLAlchemy guarda una fila en `notes` con ese `course_id` y confirma la escritura con `commit()`.
5. La API devuelve `201` con la nota guardada. El listado consulta sólo las notas del curso de la URL y las ordena por `id`.

### Conceptos nuevos

- **Relación uno a muchos:** un curso puede tener varias notas; cada nota pertenece a un curso.
- **Clave foránea:** `notes.course_id` debe referirse a un `courses.id` existente.
- **Parámetro de ruta:** `{course_id}` es una parte variable de la URL y FastAPI comprueba que sea un entero positivo.
- **Router:** grupo de rutas relacionadas que se registra en la aplicación con `include_router()`.
- **Validador de campo:** función que revisa una regla adicional, como rechazar contenido de sólo espacios sin modificar la sangría del texto válido.
- **Índice:** estructura de la base que facilita buscar las notas por `course_id`.

### Decisiones importantes

- Usar una clave foránea obligatoria para vincular las notas a cursos existentes.
- Validar el curso en las dos rutas para devolver `404` cuando no existe; un curso existente sin notas devuelve una lista vacía.
- Admitir títulos de 1–100 caracteres después de quitar espacios de los extremos y contenido de 1–10 000 caracteres. El contenido conserva el formato y se valida para impedir texto de sólo espacios.
- Obtener `course_id` de la URL y aceptar sólo título y contenido en el JSON.
- Filtrar el listado por curso y permitir títulos repetidos, identificando cada nota mediante su `id`.
- Añadir un router de notas para agrupar las nuevas rutas, conservando una sola aplicación FastAPI.
- Mantener la consulta y escritura explícitas en el router mientras no haya reglas de negocio que necesiten una capa propia.
- El filtro por curso organiza las notas. La comprobación de propietario se incorporará con autenticación y autorización.

### Dudas pendientes

Duda aclarada: las peticiones de cursos y notas necesitan PostgreSQL en ejecución; en esta configuración local se mantienen Docker Desktop, el contenedor de PostgreSQL y FastAPI encendidos durante las pruebas. La migración y la prueba manual de esta parte están completadas. No hay otras dudas personales nuevas registradas.

## Notas desde el frontend

### Objetivo

Consultar y crear notas desde la página de cada curso, usando las rutas existentes de la API. Esta segunda parte del hito de notas añade la interfaz de creación y lectura; edición y eliminación serán la siguiente parte.

El build de Next.js y TypeScript se completaron correctamente. Se ejecutaron pruebas de navegador en Edge con respuestas simuladas de la API: enlaces por curso, notas existentes y lista vacía, creación y recarga, título recortado, contenido original con saltos y sangría, texto con apariencia de HTML mostrado literalmente, límites de caracteres con emojis, bloqueo durante carga y guardado, conservación de los campos ante `422` y `503`, reintento de carga, curso inexistente e identificador inválido. También se comprobó la navegación durante peticiones de carga y guardado pendientes sin mezclar notas ni borradores entre cursos.

La prueba a 375 píxeles de ancho detectó que un título de 100 letras sin espacios desbordaba la pantalla. Se ajustó el salto de palabras y se verificaron tanto la nota existente como una recién creada con su mensaje de éxito, sin desbordamiento horizontal.

El usuario completó la prueba manual con FastAPI y PostgreSQL reales: vio `Ecuaciones lineales` en el curso `2`, creó `Sistemas de ecuaciones` con contenido de dos líneas y comprobó que ambos campos se vaciaron y la nota persistió al recargar. El curso `1` mostró el estado vacío y el curso `2` conservó sus notas. Los títulos y contenidos de sólo espacios mostraron errores sin añadir notas. Tras detener el backend y recargar, apareció el error de carga; al reiniciarlo y pulsar **Reintentar**, las notas volvieron a mostrarse. Estas comprobaciones completan la segunda parte del hito de notas: creación y lectura desde el frontend.

### Archivos modificados

- `frontend/app/courses/page.tsx`: añade el enlace a las notas de cada curso, indicando su identificador para distinguir cursos con nombres repetidos.
- `frontend/app/courses/[courseId]/notes/page.tsx`: lee el identificador de la URL y contiene el formulario, listado y estados de carga, guardado, error y curso inexistente.
- `README.md`: explica cómo iniciar los servicios y comprobar la interfaz de notas.
- `docs/learning-log.md`: registra esta parte del hito.

### Flujo sencillo

1. En la lista de cursos se selecciona **Ver notas**. Un curso con identificador `2` abre `/courses/2/notes`.
2. `useParams` lee `courseId` y comprueba que representa un entero positivo. La página solicita `GET /courses/2/notes`.
3. El título y contenido del formulario se mantienen en el estado de React. El contenido usa un `textarea` para admitir varias líneas.
4. Al enviar se valida el título y el contenido; después se hace `POST` con el título recortado y el contenido original, conservando su formato.
5. Tras la confirmación del servidor se añade la nota devuelta, se limpian los campos y se muestra el éxito. Al recargar, las notas vuelven a consultarse a la API.
6. Al cambiar de curso se reinicia el estado del formulario y listado. Las respuestas pendientes de la página anterior no añaden notas al curso nuevo.

### Conceptos nuevos

- **Ruta dinámica:** `[courseId]` es una parte variable de la URL que identifica el curso.
- **`useParams`:** hook de Next.js para leer los valores de los segmentos dinámicos.
- **`textarea` controlado:** campo de varias líneas cuyo contenido se mantiene en el estado de React.
- **Reinicio por `key`:** cambiar la clave de un componente hace que React cree una instancia con estado inicial. Aquí se usa para el formulario y listado de cada curso.
- **Formato del texto:** `white-space: pre-wrap` conserva espacios y saltos de línea al mostrar el contenido. React muestra el texto sin interpretarlo como HTML.

### Decisiones importantes

- Usar una página de notas por identificador y un enlace de vuelta a cursos.
- Mostrar el identificador del curso en el encabezado y reutilizar las rutas de notas existentes.
- Mantener los componentes de la página en un archivo mientras el alcance es pequeño. `NotesPage` lee y valida el identificador; `CourseNotes` contiene la interacción y se reinicia mediante su `key`.
- Diferenciar un curso inexistente (`404`, sin formulario), uno sin notas (`200` con lista vacía) y un error de carga recuperable con **Reintentar**.
- Desactivar el formulario durante carga o guardado y añadir la nota sólo después de la confirmación de la API.
- Contar los caracteres con `Array.from` para que los límites coincidan con los puntos de código Unicode contados por Python, incluidos los emojis.
- Usar `trim()` para validar que el contenido no esté vacío, conservando el contenido original al enviarlo.
- Conservar ambos campos si el guardado no se puede confirmar y pedir revisar la lista antes de reenviar. Un guardado pendiente puede completarse en el servidor aunque se abandone la página.

### Dudas pendientes

No hay dudas personales nuevas registradas. Se completaron la prueba manual con los servicios reales, la separación de notas entre cursos, la persistencia al recargar y la recuperación tras reiniciar el backend.

## Notas: edición y eliminación en la API

### Objetivo

Actualizar y eliminar una nota desde `/docs`, conservando el vínculo con su curso. Esta entrega añade las operaciones de API; la incorporación de los botones de edición y eliminación al frontend será la siguiente entrega.

Se comprobó el contrato OpenAPI y se ejecutaron pruebas con PostgreSQL en un esquema temporal: `PUT` devolvió `200` manteniendo `id` y `course_id`, normalizó el título y conservó el contenido con su formato. Repetir el mismo `PUT` no creó filas. Las ediciones inválidas devolvieron `422` dejando intacta la versión anterior; pasaron los límites de 100 y 10 000 caracteres. Usar un curso equivocado o una pareja inexistente devolvió `404` sin cambiar ninguna nota. `DELETE` devolvió `204` con cuerpo vacío, conservó las demás notas y su repetición devolvió `404`. La edición y eliminación se confirmaron desde procesos nuevos de Python. También pasaron los preflight CORS de ambos métodos para los orígenes locales y el rechazo de otro origen, y las comprobaciones existentes de creación, listado y `/health`. Los datos y archivos temporales de prueba se retiraron al terminar.

El usuario completó la prueba manual desde `/docs`: creó la nota temporal `3` en el curso `2`, la editó mediante `PUT` (`200`) y comprobó que conservó sus identificadores y las dos líneas actualizadas. Una edición con título de sólo espacios devolvió `422` y mantuvo la versión guardada. Usar el curso `1` con esa nota en `PUT` y `DELETE` devolvió `404` sin cambios. La edición persistió tras reiniciar el backend. Después, `DELETE` con la pareja correcta devolvió `204` vacío y retiró sólo la nota temporal; repetirlo devolvió `404`. Tras otro reinicio, la nota siguió ausente y las demás se conservaron. Se completa esta entrega de edición y eliminación en la API.

### Archivos modificados

- `backend/app/api/notes.py`: añade la búsqueda compartida por curso y nota, `PUT` para reemplazar título y contenido, y `DELETE` para eliminar la nota.
- `backend/app/main.py`: amplía CORS para permitir `PUT` y `DELETE` desde los orígenes locales existentes.
- `README.md`: explica el uso de las rutas y las pruebas con una nota creada para ello.
- `docs/learning-log.md`: registra esta entrega.

### Flujo sencillo

1. Se elige una nota mediante los identificadores `course_id` y `note_id` de la URL.
2. En una edición, Pydantic valida ambos campos completos usando las reglas de `NoteCreate`.
3. `get_note_for_course` busca la fila que coincida con ambos identificadores. Si no la encuentra, devuelve `404 Note not found`.
4. `PUT` actualiza el título y contenido, confirma la transacción y devuelve `200` con la nota, manteniendo su `id` y `course_id`.
5. `DELETE` elimina la fila encontrada, confirma la transacción y devuelve `204` con cuerpo vacío.

### Conceptos nuevos

- **`PUT`:** operación que en esta API reemplaza los dos campos editables de una nota. Ambos son obligatorios.
- **`DELETE`:** petición para eliminar el recurso identificado en la URL.
- **`204 No Content`:** respuesta de éxito sin cuerpo; el cliente no debe intentar leerla como JSON.
- **Búsqueda por dos identificadores:** la existencia de una nota no basta; debe coincidir también con el curso de la URL.
- **Eliminación mediante la sesión:** `session.delete()` marca la fila para borrado; `session.commit()` confirma la operación en PostgreSQL.

### Decisiones importantes

- Reutilizar la tabla existente y `NoteCreate`, ya que los campos requeridos y sus reglas son iguales para creación y reemplazo completo.
- Conservar el identificador y curso de la nota durante la edición. El cuerpo sólo acepta título y contenido.
- Compartir una única función de búsqueda entre edición y eliminación para aplicar el filtro de la misma forma.
- Devolver `404 Note not found` si no existe la pareja curso/nota, incluyendo el caso de usar el curso equivocado. Esta respuesta no afirma que el curso completo haya desaparecido.
- Permitir los nuevos métodos mediante CORS local, manteniendo los métodos existentes.
- Comprobar edición y eliminación con datos temporales; en la prueba manual se creará una nota específica para ello.
- Mantener la comprobación de pertenencia al curso como regla de esta entrega. La autorización por propietario de usuario llegará con autenticación y autorización.

### Dudas pendientes

No hay dudas personales nuevas registradas. La prueba manual de edición y eliminación desde `/docs` y las comprobaciones de persistencia quedaron completadas.

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
- **Formulario controlado:** formulario cuyos valores se mantienen en el estado de React.
- **AbortController:** mecanismo del navegador para cancelar una operación, como una petición `fetch`.
- **Clave foránea:** columna que referencia una clave de otra tabla para mantener válidas las relaciones entre filas.
- **Relación uno a muchos:** relación en la que una fila de una tabla puede estar asociada a varias filas de otra.
- **Router:** grupo de rutas relacionadas que se incorpora a una aplicación.
- **Parámetro de ruta:** valor incluido en la URL que identifica el recurso solicitado.
- **Índice:** estructura que facilita búsquedas en una tabla.
- **Ruta dinámica:** ruta con un segmento variable, como el identificador de un curso.
- **`textarea`:** campo de formulario para texto de varias líneas.
- **`PUT`:** método HTTP usado aquí para reemplazar todos los campos editables de un recurso.
- **`DELETE`:** método HTTP para solicitar la eliminación de un recurso.
- **`204 No Content`:** código de éxito para una respuesta sin cuerpo.
