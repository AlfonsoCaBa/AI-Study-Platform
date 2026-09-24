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

The backend has a minimal health-check endpoint at `GET /health`.

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
