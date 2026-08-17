import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";

export default function RiesgoHumanoPanel() {
  const [casos, setCasos] = useState([]);
  const [porArea, setPorArea] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/riesgo-humano").then(setCasos).catch((err) => setError(err.message));
    apiGet("/riesgo-humano/por-area").then(setPorArea).catch(() => {});
  }, []);

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 640 }}>
      {porArea.length > 0 && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Score promedio por área</h2>
          <div className="d-flex flex-column gap-2">
            {porArea.map((a) => (
              <div key={a.area} className="d-flex justify-content-between small">
                <span>{a.area}</span>
                <span className="rt-mono">{a.scorePromedio} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-1">Panel de riesgo humano</h1>
        <p className="rt-muted small mb-4">Casos ordenados por score (correlación de capacitación, autoreporte, texto e incidentes)</p>

        {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

        <div className="d-flex flex-column gap-2">
          {casos.map((c) => (
            <Link key={c.id_usuario} to={`/riesgo-humano/${c.id_usuario}`} className="text-decoration-none">
              <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
                <div>
                  <div className="small" style={{ color: "var(--rt-text)" }}>{c.nombre}</div>
                  <div className="rt-muted" style={{ fontSize: "0.75rem" }}>{c.area || "Sin área asignada"}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {c.alertaTextual && (
                    <span className="rt-badge rt-badge-alta"><i className="bi bi-chat-square-text me-1"></i>Alerta textual</span>
                  )}
                  <span className="rt-mono small">{c.score} pts</span>
                  <span className={`rt-badge ${c.estado === "Priorizado" ? "rt-badge-alta" : "rt-badge-baja"}`}>{c.estado}</span>
                </div>
              </div>
            </Link>
          ))}
          {casos.length === 0 && !error && <p className="rt-muted small mb-0">Todavía no hay colaboradores con señales registradas.</p>}
        </div>
      </div>
    </div>
  );
}
