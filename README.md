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

The backend exposes `GET /health`, `POST`/`GET /courses`, `POST`/`GET /courses/{course_id}/notes`, and `PUT`/`DELETE /courses/{course_id}/notes/{note_id}`. Courses and notes are stored in PostgreSQL. The frontend home page at `/` checks whether the API is reachable and links to `/courses`, where users can list and create courses. Each course links to `/courses/{courseId}/notes` to list and create its notes. Note updates and deletion are currently available through `/docs`.

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

The browser requests `http://127.0.0.1:8000/health`. Since the frontend runs on port 3000 and the API on port 8000, the backend allows the local frontend origins through CORS for `GET`, `POST`, `PUT`, and `DELETE`, including JSON requests. The API URL is fixed for local development; we will make it configurable when deployment becomes relevant.

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

## Create and list courses from the frontend

Start PostgreSQL, FastAPI on port 8000 and Next.js on port 3000 using the instructions above. Apply the backend migration first if you have not already done so.

1. Open `http://localhost:3000` and follow **Ver mis cursos** to `/courses`.
2. Wait for the saved courses to load. An empty database shows **Todavía no tienes cursos**.
3. Enter a name and select **Crear curso**. The button shows **Guardando…** during the request. A successful response adds the saved course to the list and clears the input.
4. Reload the page. The course should return from PostgreSQL through `GET /courses`.
5. Try a name made only of spaces: it should show an error without sending a creation request. The input accepts at most 100 characters; the API also validates the name.
6. Stop FastAPI and reload `/courses`. Expect an error and a **Reintentar** button. Restart FastAPI and select **Reintentar** to recover the list.

If saving cannot be confirmed, the form keeps the name. Reload and check the list before submitting again: a lost response can occur after the server saved the course. Requests time out after 10 seconds. Duplicate names are still allowed.

The page uses React state for the form and list, and browser `fetch` requests to the existing API. The initial request is cancelled when leaving the page. PostgreSQL credentials remain in the backend; the browser only receives course JSON.

## Create and list notes for a course

With PostgreSQL running, apply the new migration from the project root:

```powershell
backend/.venv/Scripts/python.exe -m alembic -c backend/alembic.ini upgrade head
```

This creates `notes` with a foreign key to `courses.id` and an index on `course_id`. It keeps existing courses. Restart FastAPI if necessary and open `http://127.0.0.1:8000/docs`; the new routes appear under **notes**.

1. Execute `GET /courses` and choose an existing course's `id`.
2. In `POST /courses/{course_id}/notes`, select **Try it out**, enter that `course_id` in the path parameter, and submit:

   ```json
   {
     "title": "Linear equations",
     "content": "An equation expresses equality between two expressions."
   }
   ```

3. Expect `201` with `id`, `course_id`, `title`, and `content`.
4. Execute `GET /courses/{course_id}/notes` with the same course. Expect `200` with its notes ordered by `id`. An existing course without notes returns `[]`.
5. Repeat the list request for a different existing course: the first course's notes should not appear there.
6. Send a blank title or content, such as `{"title": " ", "content": "Valid"}`. Expect `422` without a new note.
7. Use a positive `course_id` that is absent from `GET /courses`: both note routes should return `404 Course not found`.
8. Stop and restart FastAPI, then list the notes again. They should still be present.

The title accepts 1–100 characters after trimming surrounding whitespace. Content accepts 1–10,000 characters, preserves indentation and line breaks, and must contain something other than whitespace. Both fields are required and stored as plain text. Set `course_id` in the URL; the request body contains only `title` and `content`. Titles may repeat. Invalid path identifiers (zero, negative, or non-integer) return `422`.

`backend/app/api/notes.py` groups the note routes in an `APIRouter`, registered by `main.py`. Listing filters by `course_id`. The foreign key prevents notes from referencing absent courses; user ownership checks will be introduced with authentication and authorization. If PostgreSQL reports that `notes` does not exist, apply the migration above.

## Create and list notes from the frontend

Start PostgreSQL, FastAPI on port 8000, and Next.js on port 3000. Apply the notes migration first if needed, using the command above.

1. Open `http://localhost:3000/courses` and select **Ver notas** for a course. The page heading shows its identifier so courses with repeated names can be distinguished.
2. Check that its saved notes appear. An existing course without notes shows **Este curso todavía no tiene notas** and lets you create one.
3. Enter a title and multiline content, then select **Crear nota**. After the API confirms creation, the note appears and both fields clear.
4. Reload the page to confirm the note is loaded again from PostgreSQL.
5. Return to **Mis cursos** and open another course. The first course's notes and draft should not appear there.
6. Submit a title or content made only of spaces. Expect a validation message without a creation request. The limits are 100 characters for the trimmed title and 10,000 for the original content.
7. Stop FastAPI and reload the notes page. Expect an error and **Reintentar**. Restart FastAPI and select **Reintentar** to recover the list.
8. Open a notes URL with a positive course identifier absent from the course list. Expect **Este curso no existe** and no creation form. An invalid identifier, such as `abc` or `0`, also blocks the form.

Content is sent with its original indentation and line breaks and displayed as plain text. HTML-looking text is displayed literally. Titles may repeat. Validation in FastAPI remains authoritative.

The page reads `courseId` from the URL with `useParams`. Its form and list have a React `key` based on the course identifier, which resets their state when the course changes. Loading is cancelled when leaving the course, and creation is blocked during initial loading or saving. Requests time out after 10 seconds.

If a save cannot be confirmed, both fields are kept. Reload and check the course's notes before submitting again. Leaving during a save does not guarantee that the server cancels the write, so check that course's list when returning.

## Update and delete notes through the API

Run Docker, frontend and backend. Open `http://127.0.0.1:8000/docs` and use a newly created test note for these checks: deletion removes that row from PostgreSQL. These operations reuse the existing table and validation rules.

1. Choose an existing course from `GET /courses`. Create a test note with `POST /courses/{course_id}/notes` and record the returned `id` as `note_id`.
2. In `PUT /courses/{course_id}/notes/{note_id}`, use the same pair of identifiers and send both editable fields:

   ```json
   {
     "title": "Updated test note",
     "content": "First line.\nSecond line."
   }
   ```

3. Expect `200` with the updated note. Its `id` and `course_id` should be unchanged. `PUT` requires both `title` and `content`; it reuses `NoteCreate` in `/docs`. The same limits and formatting rules apply as when creating a note.
4. Execute `GET /courses/{course_id}/notes` to confirm the edit, then restart the backend and list again to verify persistence.
5. Submit an invalid edit, such as `{"title": " ", "content": "Valid"}`. Expect `422` and confirm the previous saved version remains intact.
6. Try `PUT` with valid content and `DELETE` using the test note's `note_id` under a different existing course. Both should return `404 Note not found`; the note should remain unchanged in its original course.
7. Use `DELETE` with the correct `course_id` and `note_id`. Expect `204` with an empty response body. List the notes again: only the chosen test note should be gone.
8. Repeat that `DELETE`: expect `404`. A restart and another list request should confirm that the deletion persisted.

Both identifiers must be positive integers (`422` otherwise). A missing note, a missing course, or a note outside the course in the URL returns `404 Note not found` for these two operations. A `404` here refers to the requested course/note pair; it does not establish whether the course itself exists.

`get_note_for_course` in `backend/app/api/notes.py` searches using both identifiers before either operation. `PUT` assigns the validated fields, then confirms with `session.commit()`. `DELETE` calls `session.delete()` and commits. The empty `204` response should not be parsed as JSON by a client. Course membership is checked here; user ownership remains part of the later authentication and authorization milestones.
