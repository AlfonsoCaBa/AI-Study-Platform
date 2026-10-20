"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Note = { id: number; course_id: number; title: string; content: string };
type LoadStatus = "loading" | "loaded" | "error" | "not-found";

function isNote(value: unknown): value is Note {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "course_id" in value && typeof value.course_id === "number" &&
    "title" in value && typeof value.title === "string" &&
    "content" in value && typeof value.content === "string"
  );
}

export default function NotesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  if (!/^\d+$/.test(courseId) || !Number.isSafeInteger(id) || id <= 0) {
    return (
      <main>
        <Link href="/courses">Volver a mis cursos</Link>
        <h1>Notas</h1>
        <p role="alert">El identificador del curso debe ser un entero positivo válido.</p>
      </main>
    );
  }

  // A different key resets the form and list when navigating to another course.
  return <CourseNotes key={id} courseId={id} />;
}

function CourseNotes({ courseId }: { courseId: number }) {
  const notesUrl = `http://127.0.0.1:8000/courses/${courseId}/notes`;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [reloadCount, setReloadCount] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadNotes() {
      setLoadStatus("loading");
      try {
        const response = await fetch(notesUrl, {
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (controller.signal.aborted) return;
        if (response.status === 404) {
          setLoadStatus("not-found");
          return;
        }
        if (!response.ok) throw new Error("Could not load notes");
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every((note) => isNote(note) && note.course_id === courseId)) {
          throw new Error("Unexpected notes response");
        }
        if (!controller.signal.aborted) {
          setNotes(data);
          setLoadStatus("loaded");
        }
      } catch {
        if (!controller.signal.aborted) setLoadStatus("error");
      }
    }

    void loadNotes();
    return () => controller.abort();
  }, [notesUrl, courseId, reloadCount]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || loadStatus !== "loaded") return;
    setFormError("");
    setSuccessMessage("");
    const trimmedTitle = title.trim();
    if (!trimmedTitle || Array.from(trimmedTitle).length > 100) {
      setFormError("Escribe un título de entre 1 y 100 caracteres, sin contar los espacios de los extremos.");
      return;
    }
    if (!content.trim() || Array.from(content).length > 10000) {
      setFormError("Escribe contenido de entre 1 y 10 000 caracteres que no sea sólo espacios.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(notesUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Validate with trim(), but send content with its original formatting.
        body: JSON.stringify({ title: trimmedTitle, content }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.status === 404) {
        setLoadStatus("not-found");
        return;
      }
      if (response.status === 422) {
        setFormError("Revisa el título (1–100 caracteres) y el contenido (1–10 000). Ambos deben contener texto.");
        return;
      }
      if (!response.ok) throw new Error("Could not create note");
      const note: unknown = await response.json();
      if (!isNote(note) || note.course_id !== courseId) {
        throw new Error("Unexpected note response");
      }
      setNotes((current) => [...current, note]);
      setTitle("");
      setContent("");
      setSuccessMessage(`Nota «${note.title}» creada.`);
    } catch {
      setFormError("No se pudo confirmar el guardado. Recarga la página y comprueba las notas antes de volver a intentarlo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ overflowWrap: "anywhere" }}>
      <Link href="/courses">Volver a mis cursos</Link>
      <h1>Notas del curso {courseId}</h1>

      {loadStatus === "not-found" ? (
        <p role="alert">Este curso no existe. Vuelve a la lista y elige otro curso.</p>
      ) : (
        <>
          <h2>Crear nota</h2>
          <form onSubmit={createNote}>
            <p>
              <label htmlFor="note-title">Título</label><br />
              <input
                id="note-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                disabled={saving || loadStatus !== "loaded"}
                aria-describedby="note-title-help"
              />
            </p>
            <p id="note-title-help">Entre 1 y 100 caracteres. Se permiten títulos repetidos.</p>
            <p>
              <label htmlFor="note-content">Contenido</label><br />
              <textarea
                id="note-content"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                required
                disabled={saving || loadStatus !== "loaded"}
                aria-describedby="note-content-help"
              />
            </p>
            <p id="note-content-help">Entre 1 y 10 000 caracteres. Se conservan los saltos de línea y la sangría.</p>
            <button type="submit" disabled={saving || loadStatus !== "loaded"}>
              {saving ? "Guardando…" : "Crear nota"}
            </button>
            {formError && <p role="alert">{formError}</p>}
            <p role="status">{successMessage}</p>
          </form>

          <h2>Notas guardadas</h2>
          {loadStatus === "loading" && <p role="status">Cargando notas…</p>}
          {loadStatus === "error" && (
            <div>
              <p role="alert">No se pudieron cargar las notas. Comprueba que la API y la base de datos estén disponibles.</p>
              <button type="button" onClick={() => setReloadCount((count) => count + 1)}>
                Reintentar
              </button>
            </div>
          )}
          {loadStatus === "loaded" && (
            notes.length === 0 ? <p>Este curso todavía no tiene notas.</p> : (
              <ul>
                {notes.map((note) => (
                  <li key={note.id}>
                    <h3>{note.title}</h3>
                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{note.content}</p>
                  </li>
                ))}
              </ul>
            )
          )}
        </>
      )}
    </main>
  );
}
