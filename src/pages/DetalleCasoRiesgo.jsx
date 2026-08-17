import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../utils/api";

export default function DetalleCasoRiesgo() {
  const { id } = useParams();
  const [caso, setCaso] = useState(null);
  const [mostrarRevisado, setMostrarRevisado] = useState(false);
  const [tipoAccion, setTipoAccion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargar = () => {
    apiGet(`/riesgo-humano/${id}`)
      .then(setCaso)
      .catch((err) => setError(err.message));
  };

  useEffect(cargar, [id]);

  const handleRegistrarAccion = async () => {
    if (!tipoAccion) {
      setError("Seleccioná el tipo de acción correctiva.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await apiPost(`/riesgo-humano/${id}/accion`, { tipoAccion });
      setTipoAccion("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRevisadoSinAccion = async () => {
    if (!justificacion.trim()) {
      setError("La justificación es obligatoria.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await apiPost(`/riesgo-humano/${id}/revisado-sin-accion`, { justificacion });
      setJustificacion("");
      setMostrarRevisado(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!caso) {
    return <div className="rt-panel p-4">{error || "Cargando..."}</div>;
  }

  const { nombre, area, score, senales, acciones, seguimiento } = caso;

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 560 }}>
      {seguimiento && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Seguimiento de la última acción correctiva</h2>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small rt-muted">Score al momento de la acción</span>
            <span className="rt-mono small">{seguimiento.scoreAlMomentoDeLaAccion} pts</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small rt-muted">Score actual</span>
            <span className="rt-mono small">{seguimiento.scoreActual} pts</span>
          </div>
          {seguimiento.mejoro ? (
            <span className="rt-badge rt-badge-baja"><i className="bi bi-arrow-down-circle me-1"></i>El caso mejoró</span>
          ) : (
            <div>
              <span className="rt-badge rt-badge-alta"><i className="bi bi-arrow-up-circle me-1"></i>
                {seguimiento.sinCambios ? "Sin cambios" : "El caso empeoró"}
              </span>
              <p className="rt-muted small mt-2 mb-0">Se sugiere escalar la severidad de la próxima acción correctiva.</p>
            </div>
          )}
        </div>
      )}
      <div className="rt-panel p-4">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h1 className="fs-5 fw-semibold mb-0">{nombre}</h1>
          <span className="rt-mono small">{score} pts</span>
        </div>
        <p className="rt-muted small mb-3">{area || "Sin área asignada"}</p>

        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between small">
            <span className="rt-muted">Última nota de capacitación</span>
            <span>{senales.nota != null ? `${senales.nota} / 100` : "Sin rendir"}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="rt-muted">Último autoreporte</span>
            <span>{senales.likert != null ? `${senales.likert} / 5` : "Sin enviar"}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="rt-muted">Incidentes (últimos 90 días)</span>
            <span>{senales.incidentes}</span>
          </div>
        </div>

        {senales.comentario && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--rt-border)" }}>
            <p className="rt-muted small mb-1">Comentario del autoreporte:</p>
            <p className="small mb-2">"{senales.comentario}"</p>
            {senales.alertaTextual && (
              <span className="rt-badge rt-badge-alta">
                <i className="bi bi-chat-square-text me-1"></i>
                Alerta textual detectada ("{senales.palabraDetectada}")
              </span>
            )}
          </div>
        )}
      </div>

      {!mostrarRevisado && (
        <div className="rt-panel p-4">
          <label className="form-label small rt-muted">Tipo de acción correctiva</label>
          <select className="form-select rt-input mb-3" value={tipoAccion} onChange={(e) => setTipoAccion(e.target.value)}>
            <option value="">Seleccionar...</option>
            <option>Capacitación de refuerzo</option>
            <option>Reunión con el responsable de área</option>
            <option>Plan de mejora individual</option>
          </select>
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <div className="d-flex gap-2">
            <button className="btn rt-btn-primary" onClick={handleRegistrarAccion} disabled={cargando}>Registrar acción correctiva</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setMostrarRevisado(true); setError(""); }}>
              Revisado sin acción
            </button>
          </div>
        </div>
      )}

      {mostrarRevisado && (
        <div className="rt-panel p-4">
          <label className="form-label small rt-muted">Justificación (obligatoria)</label>
          <textarea className="form-control rt-input mb-2" rows={2} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} />
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <button className="btn rt-btn-primary" onClick={handleRevisadoSinAccion} disabled={cargando}>Confirmar</button>
        </div>
      )}

      {acciones.length > 0 && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Historial de acciones</h2>
          <div className="d-flex flex-column gap-2">
            {acciones.map((a, i) => (
              <div key={i} className="py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
                <div className="d-flex justify-content-between small">
                  <span>{a.tipo_accion}</span>
                  <span className="rt-muted">{new Date(a.fecha).toLocaleDateString("es-AR")}</span>
                </div>
                <div className="rt-muted" style={{ fontSize: "0.75rem" }}>Registrado por {a.responsable_nombre}</div>
                {a.resultado && <p className="small mt-1 mb-0">{a.resultado}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
