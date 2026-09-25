# Registro de aprendizaje — AI Study Platform

AI Study Platform es un proyecto para aprender desarrollo de software construyendo, paso a paso, una aplicación de estudio. La meta inicial es organizar cursos y notas; las funciones de inteligencia artificial están previstas para etapas posteriores. Este registro documentará lo que se construye, las decisiones tomadas y las dudas que surjan, sin asumir que un concepto ya está dominado por aparecer en el código.

## Índice de hitos

1. [Estado inicial del proyecto](#estado-inicial-del-proyecto)

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

## Glosario

- **Frontend:** parte de la aplicación con la que interactúa el usuario en el navegador.
- **Backend:** parte que recibe peticiones y ejecuta la lógica de la API.
- **API:** interfaz que permite a otras partes del programa solicitar datos o acciones.
- **Endpoint:** combinación de una ruta y un método HTTP, como `GET /health`.
- **JSON:** formato de texto usado para intercambiar datos estructurados.
- **CORS:** mecanismo del navegador que requiere permiso del servidor para que una página lea respuestas de otro origen.
- **Estado (React):** dato de un componente que, al cambiar, puede actualizar lo que muestra la pantalla.
- **Efecto (React):** código que se ejecuta después del renderizado para interactuar con algo externo al componente, como una API.
