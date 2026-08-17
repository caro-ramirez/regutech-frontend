import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";

const ESTADO_CLASE = {
  "En progreso": "rt-badge-media",
  Solicitada: "rt-badge-media",
};

function estadoVisual(auditoria, pendientes) {
  if (auditoria.estado !== "Completada") {
    return { texto: auditoria.estado, clase: ESTADO_CLASE[auditoria.estado] ?? "rt-badge-media" };
  }
  const p = pendientes[auditoria.id_auditoria];
  if (p == null) return { texto: "Completada", clase: "rt-badge-media" };
  return p > 0
    ? { texto: "En remediación", clase: "rt-badge-media" }
    : { texto: "Cerrada", clase: "rt-badge-baja" };
}

export default function AuditoriasAsignadas() {
  const [auditorias, setAuditorias] = useState([]);
  const [pendientes, setPendientes] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/auditorias")
      .then(async (data) => {
        setAuditorias(data);
        const completadas = data.filter((a) => a.estado === "Completada");
        const conteos = {};
        for (const a of completadas) {
          try {
            const hallazgos = await apiGet(`/hallazgos?auditoriaId=${a.id_auditoria}`);
            conteos[a.id_auditoria] = hallazgos.filter((h) => !["Cerrado", "Riesgo Aceptado", "Falso Positivo"].includes(h.estado)).length;
          } catch {
            conteos[a.id_auditoria] = null;
          }
        }
        setPendientes(conteos);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="rt-panel p-4">
      <h1 className="fs-5 fw-semibold mb-4">Auditorías asignadas</h1>

      {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <div className="d-flex flex-column gap-2">
        {auditorias.map((a) => {
          const { texto, clase } = estadoVisual(a, pendientes);
          const cantidadPendientes = pendientes[a.id_auditoria];
          return (
            <Link
              key={a.id_auditoria}
              to={a.estado === "Completada" ? `/hallazgos?auditoriaId=${a.id_auditoria}` : `/auditorias/${a.id_auditoria}/checklist`}
              className="text-decoration-none"
            >
              <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
                <div>
                  <div className="fw-medium small" style={{ color: "var(--rt-text)" }}>{a.norma_nombre}</div>
                  <div className="rt-muted" style={{ fontSize: "0.75rem" }}>
                    Solicitada: {new Date(a.fecha_solicitud).toLocaleDateString("es-AR")}
                    {texto === "En remediación" && cantidadPendientes != null && ` · ${cantidadPendientes} hallazgo(s) pendiente(s)`}
                  </div>
                </div>
                <span className={`rt-badge ${clase}`}>{texto}</span>
              </div>
            </Link>
          );
        })}
        {auditorias.length === 0 && !error && (
          <p className="rt-muted small mb-0">No tenés auditorías asignadas por el momento.</p>
        )}
      </div>
    </div>
  );
}
