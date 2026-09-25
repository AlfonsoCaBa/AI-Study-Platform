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

The backend has a minimal health-check endpoint at `GET /health`. The frontend home page at `/` checks whether the API is reachable.

## Run the backend locally (Windows PowerShell)

From the project root:

```powershell
py -3.13 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
cd backend
.venv/Scripts/python.exe -m fastapi dev app/main.py
```

Open `http://127.0.0.1:8000/health` to see `{"status":"ok"}`. FastAPI also provides interactive API documentation at `http://127.0.0.1:8000/docs`. Press `Ctrl+C` to stop the server.

The `.venv` directory is a local Python environment. Git ignores it because installed packages can be restored from `backend/requirements.txt`.

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

The browser requests `http://127.0.0.1:8000/health`. Since the frontend runs on port 3000 and the API on port 8000, the backend allows the local frontend origins through CORS. The API URL is fixed for local development; we will make it configurable when deployment becomes relevant.
