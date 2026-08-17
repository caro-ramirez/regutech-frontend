import { useState, useEffect } from "react";
import { apiGet } from "../utils/api";

export default function MiHistorial() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [autoreportes, setAutoreportes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/capacitaciones")
      .then((data) => setCapacitaciones(data.filter((c) => c.ultima_nota != null)))
      .catch((err) => setError(err.message));
    apiGet("/autoreportes/mios")
      .then(setAutoreportes)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 560 }}>
      {error && <div className="small" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-3">Mis capacitaciones rendidas</h1>
        <div className="d-flex flex-column gap-2">
          {capacitaciones.map((c) => (
            <div key={c.id_capacitacion} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
              <div className="small">{c.nombre}</div>
              <span className="rt-mono small">{c.ultima_nota} pts</span>
            </div>
          ))}
          {capacitaciones.length === 0 && <p className="rt-muted small mb-0">Todavía no rendiste ninguna capacitación.</p>}
        </div>
      </div>

      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-3">Mis autoreportes previos</h1>
        <div className="d-flex flex-column gap-2">
          {autoreportes.map((a) => (
            <div key={a.id_autoreporte} className="py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
              <div className="d-flex justify-content-between">
                <span className="rt-muted small">{new Date(a.fecha).toLocaleDateString("es-AR")}</span>
                <span className="rt-mono small">{a.puntaje_likert} / 5</span>
              </div>
              {a.comentario && <p className="small mt-1 mb-0">{a.comentario}</p>}
            </div>
          ))}
          {autoreportes.length === 0 && <p className="rt-muted small mb-0">Todavía no enviaste ningún autoreporte.</p>}
        </div>
      </div>
    </div>
  );
}
