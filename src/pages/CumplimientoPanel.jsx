import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet, API_URL } from "../utils/api";

function PulseMeter({ pct }) {
  const segments = 10;
  const filled = Math.round((pct / 100) * segments);
  const color = pct >= 90 ? "filled-ok" : pct >= 60 ? "filled-warn" : "filled-crit";
  return (
    <div className="rt-pulse-track">
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={`rt-pulse-segment ${i < filled ? color : ""}`}></div>
      ))}
    </div>
  );
}

export default function CumplimientoPanel() {
  const [auditorias, setAuditorias] = useState([]);
  const [certificados, setCertificados] = useState({});
  const [error, setError] = useState("");

  const handleDescargarPDF = async (idAuditoria) => {
    try {
      const token = localStorage.getItem("regutech_token");
      const res = await fetch(`${API_URL}/certificados/${idAuditoria}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo generar el PDF.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado_${idAuditoria}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    apiGet("/auditorias")
      .then(async (data) => {
        setAuditorias(data);
        const completadas = data.filter((a) => a.estado === "Completada");
        const resultados = {};
        for (const a of completadas) {
          try {
            resultados[a.id_auditoria] = await apiGet(`/certificados/${a.id_auditoria}`);
          } catch {
            resultados[a.id_auditoria] = null;
          }
        }
        setCertificados(resultados);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 560 }}>
      <h1 className="fs-5 fw-semibold mb-0">Cumplimiento y certificados</h1>

      {error && <div className="small" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      {auditorias.map((a) => {
        const cert = certificados[a.id_auditoria];
        const pct = Number(a.porcentaje_cumplimiento) || 0;

        return (
          <div key={a.id_auditoria} className="rt-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium small">{a.norma_nombre}</span>
              <span className="rt-mono small">{pct}%</span>
            </div>
            <PulseMeter pct={pct} />

            {a.estado !== "Completada" && (
              <p className="rt-muted small mt-3 mb-0">Auditoría en progreso, todavía no finalizó el checklist.</p>
            )}

            {cert?.certificado && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--rt-border)" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Certificado</span>
                  <span className={`rt-badge ${cert.certificado.estado === "Vigente" ? "rt-badge-baja" : "rt-badge-alta"}`}>
                    {cert.certificado.estado}
                  </span>
                </div>
                <p className="rt-muted small mb-1">
                  Emisión: {new Date(cert.certificado.fecha_emision).toLocaleDateString("es-AR")}
                </p>
                <p className="rt-muted small mb-2">
                  Vencimiento: {new Date(cert.certificado.fecha_vencimiento).toLocaleDateString("es-AR")}
                </p>
                <div className="d-flex gap-2">
                  <button className="btn rt-btn-primary btn-sm" onClick={() => handleDescargarPDF(a.id_auditoria)}>
                    <i className="bi bi-file-earmark-arrow-down me-1"></i>Descargar PDF
                  </button>
                  {cert.certificado.estado === "Vencido" && (
                    <Link to="/auditorias/solicitar" className="btn btn-outline-secondary btn-sm">Iniciar nueva auditoría</Link>
                  )}
                </div>
              </div>
            )}

            {a.estado === "Completada" && !cert?.certificado && (
              <p className="rt-muted small mt-3 mb-0">
                Todavía no alcanzó el 90% de cumplimiento requerido para certificar.
              </p>
            )}
          </div>
        );
      })}

      {auditorias.length === 0 && !error && (
        <p className="rt-muted small mb-0">Todavía no hay auditorías solicitadas para esta entidad.</p>
      )}
    </div>
  );
}
