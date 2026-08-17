import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "../utils/api";
import { claseSeveridad } from "../utils/severidad";

const ESTADO_CLASE = {
  Abierto: "rt-badge-media",
  Asignado: "rt-badge-media",
  Escalado: "rt-badge-alta",
  "Pendiente de Retest": "rt-badge-baja",
  Cerrado: "rt-badge-baja",
  Reabierto: "rt-badge-alta",
  "Riesgo Aceptado": "rt-badge-media",
  "Falso Positivo": "rt-badge-media",
};

export default function HallazgosPanel() {
  const [searchParams] = useSearchParams();
  const auditoriaId = searchParams.get("auditoriaId");
  const [hallazgos, setHallazgos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auditoriaId) return;
    apiGet(`/hallazgos?auditoriaId=${auditoriaId}`)
      .then(setHallazgos)
      .catch((err) => setError(err.message));
  }, [auditoriaId]);

  if (!auditoriaId) {
    return (
      <div className="rt-panel p-4">
        <p className="rt-muted small mb-0">
          Entrá a esta pantalla desde una auditoría completada (en "Auditorías Asignadas") para ver sus hallazgos.
        </p>
      </div>
    );
  }

  return (
    <div className="rt-panel p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-5 fw-semibold mb-0">Panel de hallazgos</h1>
        <span className="rt-mono small rt-muted">AUD-00{auditoriaId}</span>
      </div>

      {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <div className="d-flex flex-column gap-2">
        {hallazgos.map((h) => (
          <Link key={h.id_hallazgo} to={`/hallazgos/${h.id_hallazgo}`} className="text-decoration-none">
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
              <div>
                <div className="small" style={{ color: "var(--rt-text)" }}>{h.item_descripcion}</div>
                <div className="rt-muted" style={{ fontSize: "0.75rem" }}>
                  Vence: {new Date(h.fecha_limite_sla).toLocaleDateString("es-AR")}
                  {h.colaborador_asignado_nombre ? ` · ${h.colaborador_asignado_nombre}` : " · Sin colaborador asignado"}
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
          <p className="rt-muted small mb-0">No se generaron hallazgos en esta auditoría. ¡Cumplimiento total!</p>
        )}
      </div>
    </div>
  );
}
