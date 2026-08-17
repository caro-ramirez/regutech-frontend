import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";

export default function CapacitacionesPanel() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/capacitaciones")
      .then(setCapacitaciones)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="rt-panel p-4">
      <h1 className="fs-5 fw-semibold mb-4">Mis capacitaciones</h1>

      {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <div className="d-flex flex-column gap-2">
        {capacitaciones.map((c) => (
          <Link
            key={c.id_capacitacion}
            to={c.estado === "Pendiente" ? `/capacitaciones/${c.id_capacitacion}` : "#"}
            className="text-decoration-none"
            style={{ pointerEvents: c.estado === "Pendiente" ? "auto" : "none" }}
          >
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
              <div>
                <div className="small" style={{ color: "var(--rt-text)" }}>{c.nombre}</div>
                <div className="rt-muted" style={{ fontSize: "0.75rem" }}>
                  {c.ultima_nota != null ? `Última nota: ${c.ultima_nota} pts` : "Sin rendir"}
                </div>
              </div>
              <span className={`rt-badge ${c.estado === "Pendiente" ? "rt-badge-media" : "rt-badge-baja"}`}>{c.estado}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
