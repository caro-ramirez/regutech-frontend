import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";
import { claseSeveridad } from "../utils/severidad";

const ESTADO_CLASE = {
  Abierto: "rt-badge-media",
  Asignado: "rt-badge-media",
  Escalado: "rt-badge-alta",
  "Pendiente de Retest": "rt-badge-baja",
  Reabierto: "rt-badge-alta",
};

export default function MisHallazgosAsignados() {
  const [hallazgos, setHallazgos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/hallazgos/mis-asignados").then(setHallazgos).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="rt-panel p-4">
      <h1 className="fs-5 fw-semibold mb-1">Mis hallazgos asignados</h1>
      <p className="rt-muted small mb-4">Hallazgos de auditoría que necesitan tu remediación</p>

      {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <div className="d-flex flex-column gap-2">
        {hallazgos.map((h) => (
          <Link key={h.id_hallazgo} to={`/hallazgos/${h.id_hallazgo}`} className="text-decoration-none">
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
              <div>
                <div className="small" style={{ color: "var(--rt-text)" }}>{h.item_descripcion}</div>
                <div className="rt-muted" style={{ fontSize: "0.75rem" }}>
                  {h.norma_nombre} · Vence: {new Date(h.fecha_limite_sla).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`rt-badge ${claseSeveridad(h.severidad)}`}>
                  {h.severidad}
                </span>
                <span className={`rt-badge ${ESTADO_CLASE[h.estado] ?? "rt-badge-media"}`}>{h.estado}</span>
              </div>
            </div>
          </Link>
        ))}
        {hallazgos.length === 0 && !error && (
          <p className="rt-muted small mb-0">No tenés hallazgos asignados por el momento.</p>
        )}
      </div>
    </div>
  );
}
