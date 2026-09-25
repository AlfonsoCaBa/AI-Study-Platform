"use client";

import { useEffect, useState } from "react";

type ApiStatus = "loading" | "connected" | "error";

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");
        if (!response.ok) {
          throw new Error("The API returned an error");
        }

        const data: { status: string } = await response.json();
        if (data.status !== "ok") {
          throw new Error("Unexpected API response");
        }

        setApiStatus("connected");
      } catch {
        setApiStatus("error");
      }
    }

    void checkApi();
  }, []);

  const statusMessage = {
    loading: "Comprobando conexión con la API...",
    connected: "API conectada",
    error: "No se pudo conectar con la API",
  }[apiStatus];

  return (
    <main>
      <h1>AI Study Platform</h1>
      <p>Organiza tus cursos y notas de estudio.</p>
      <p role="status">{statusMessage}</p>
    </main>
  );
}
