"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Course = { id: number; name: string };
type LoadStatus = "loading" | "loaded" | "error";

const coursesUrl = "http://127.0.0.1:8000/courses";

function isCourse(value: unknown): value is Course {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "name" in value && typeof value.name === "string"
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [reloadCount, setReloadCount] = useState(0);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoadStatus("loading");
      try {
        const response = await fetch(coursesUrl, {
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (!response.ok) throw new Error("Could not load courses");
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isCourse)) {
          throw new Error("Unexpected courses response");
        }
        if (!controller.signal.aborted) {
          setCourses(data);
          setLoadStatus("loaded");
        }
      } catch {
        if (!controller.signal.aborted) setLoadStatus("error");
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [reloadCount]);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || loadStatus !== "loaded") return;
    setFormError("");
    setSuccessMessage("");
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setFormError("Escribe un nombre de entre 1 y 100 caracteres, sin contar los espacios de los extremos.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(coursesUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.status === 422) {
        setFormError("El nombre no es válido. Usa entre 1 y 100 caracteres.");
        return;
      }
      if (!response.ok) throw new Error("Could not create course");
      const course: unknown = await response.json();
      if (!isCourse(course)) throw new Error("Unexpected course response");
      setCourses((current) => [...current, course]);
      setName("");
      setSuccessMessage(`Curso «${course.name}» creado.`);
    } catch {
      setFormError("No se pudo confirmar el guardado. Recarga la página para comprobar la lista antes de volver a intentarlo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <Link href="/">Volver al inicio</Link>
      <h1>Mis cursos</h1>

      <h2>Crear curso</h2>
      <form onSubmit={createCourse}>
        <label htmlFor="course-name">Nombre del curso</label>{" "}
        <input
          id="course-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={100}
          disabled={saving || loadStatus !== "loaded"}
          aria-describedby="course-name-help"
        />{" "}
        <button type="submit" disabled={saving || loadStatus !== "loaded"}>
          {saving ? "Guardando…" : "Crear curso"}
        </button>
        <p id="course-name-help">Entre 1 y 100 caracteres. Se permiten nombres repetidos.</p>
        {formError && <p role="alert">{formError}</p>}
        <p role="status">{successMessage}</p>
      </form>

      <h2>Cursos guardados</h2>
      {loadStatus === "loading" && <p role="status">Cargando cursos…</p>}
      {loadStatus === "error" && (
        <div>
          <p role="alert">No se pudieron cargar los cursos. Comprueba que la API y la base de datos estén disponibles.</p>
          <button type="button" onClick={() => setReloadCount((count) => count + 1)}>
            Reintentar
          </button>
        </div>
      )}
      {loadStatus === "loaded" && (
        courses.length === 0 ? <p>Todavía no tienes cursos.</p> : (
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                {course.name}{" — "}
                <Link
                  href={`/courses/${course.id}/notes`}
                  aria-label={`Ver notas de ${course.name}, curso ${course.id}`}
                >
                  Ver notas (curso {course.id})
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  );
}
