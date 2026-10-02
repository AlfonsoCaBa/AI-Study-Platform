# AI Study Platform

An AI-powered study platform built incrementally as a learning project.

## Initial goal

Build a small full-stack application where users can organize courses and study notes. Future milestones will introduce authentication, document uploads, AI-powered study assistance, and security improvements.

## Planned technology stack

- Frontend: Next.js, React, and TypeScript
- Backend: Python and FastAPI
- Database: PostgreSQL

## Project structure

- `frontend/`: the user interface.
- `backend/`: the API and business logic.
- `docs/`: architecture notes and future project documentation.

## Status

The backend exposes `GET /health`, `POST /courses`, and `GET /courses`. Courses are stored in PostgreSQL. The frontend home page at `/` currently checks only whether the API is reachable; the courses interface is the next step.

## Run the backend locally (Windows PowerShell)

Start PostgreSQL using the database instructions below and create your root `.env` first. From the project root:

```powershell
py -3.13 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
cd backend
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m fastapi dev app/main.py
```

Open `http://127.0.0.1:8000/health` to see `{"status":"ok"}`. FastAPI also provides interactive API documentation at `http://127.0.0.1:8000/docs`. Press `Ctrl+C` to stop the server.

The `.venv` directory is a local Python environment. Git ignores it because installed packages can be restored from `backend/requirements.txt`.

Alembic applies the migrations in `backend/migrations/versions/` and records which ones ran. Running `upgrade head` again applies only pending migrations. The backend reads the root `.env` regardless of the terminal's current folder, and connects to PostgreSQL on `127.0.0.1:5432`. Credentials are not written in the migration configuration.

## Run the frontend locally (Windows PowerShell)

From the project root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:3000` to see the home page. Press `Ctrl+C` to stop the server. `npm ci` installs the versions recorded in `frontend/package-lock.json`; the `node_modules` directory stays local and is ignored by Git.

If npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on Windows, run `$env:NODE_OPTIONS = "--use-system-ca"` in that PowerShell session and retry `npm.cmd ci`.

## Check the frontend–backend connection

Start the backend and frontend in separate PowerShell terminals using the commands above. At `http://localhost:3000`, the page first shows a loading message and then `API conectada`. If the backend is stopped or unreachable, it shows `No se pudo conectar con la API`.

The browser requests `http://127.0.0.1:8000/health`. Since the frontend runs on port 3000 and the API on port 8000, the backend allows the local frontend origins through CORS, including JSON `POST` requests for courses. The API URL is fixed for local development; we will make it configurable when deployment becomes relevant.

## Run PostgreSQL locally (Windows PowerShell)

Install and start Docker Desktop. If you do not already have a `.env`, create it once from the project root:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace `POSTGRES_PASSWORD` with a password of your own. This file stays on your computer; Git ignores it. The other two values name the database user and database.

```powershell
docker compose up -d
docker compose ps
docker compose exec db psql -U study_user -d study_platform -c "SELECT 1;"
```

The last command should return a row containing `1`. It runs `psql`, PostgreSQL's command-line client, inside the container. If PostgreSQL is still starting, wait a few seconds and retry the query. If you change `POSTGRES_USER` or `POSTGRES_DB` in `.env`, use your values in the `psql` command too. PostgreSQL is reachable only from this computer on port 5432.

To stop the database, run `docker compose down`. The named Docker volume keeps its data for the next start. The `POSTGRES_*` values initialize an empty volume; editing `.env` later does not change credentials already stored in PostgreSQL.

## Create and list courses through the API

After applying the migration and starting FastAPI, open `http://127.0.0.1:8000/docs`.

1. Expand `POST /courses`, select **Try it out**, and submit:

   ```json
   {"name": "Algebra"}
   ```

2. Expect HTTP `201` with the saved name and a generated integer `id`.
3. Execute `GET /courses`. Expect HTTP `200` with a list containing that course, ordered by `id`.
4. Submit `{"name": "   "}` or a name longer than 100 characters. Expect `422`; invalid requests do not create courses. Surrounding whitespace is removed from valid names. Repeated names are allowed for now.
5. Stop and restart FastAPI, then execute `GET /courses` again. The course should still be present because PostgreSQL stores it independently of the API process.

SQLAlchemy maps the `Course` Python class to the `courses` table. Pydantic defines the accepted request and returned JSON, and Alembic creates the table. `session.commit()` confirms a database write; it is unrelated to `git commit`.

Common problems:

- **`503 Database unavailable`:** check Docker Desktop, `docker compose ps`, and your local credentials. `/health` checks the API process only, so it can still return `ok` when PostgreSQL is unavailable.
- **`relation "courses" does not exist`:** apply `alembic upgrade head` using the backend's virtual environment.
- **`Missing variables in the root .env`:** check that the three `POSTGRES_*` values are present and nonempty.

This API currently has no accounts or ownership checks. It is for local development; authentication and authorization are later milestones.
