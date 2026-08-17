import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../utils/api";

export default function SolicitarAuditoria() {
  const [normas, setNormas] = useState([]);
  const [idNorma, setIdNorma] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [comentario, setComentario] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [responsableAsignado, setResponsableAsignado] = useState("");
  const [asignadoPorEspecialidad, setAsignadoPorEspecialidad] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    apiGet("/normas")
      .then(setNormas)
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idNorma) return;
    setCargando(true);
    setError("");
    try {
      const data = await apiPost("/auditorias", { idNorma: Number(idNorma) });
      setResponsableAsignado(data.responsableNombre);
      setAsignadoPorEspecialidad(data.asignadoPorEspecialidadExacta);
      setConfirmado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (confirmado) {
    const normaNombre = normas.find((n) => n.id_norma === Number(idNorma))?.nombre;
    return (
      <div className="rt-panel p-4" style={{ maxWidth: 480 }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-check-circle-fill" style={{ color: "var(--rt-accent)", fontSize: "1.4rem" }}></i>
          <h1 className="fs-5 fw-semibold mb-0">Auditoría solicitada</h1>
        </div>
        <p className="rt-muted small mb-1">Norma: <span style={{ color: "var(--rt-text)" }}>{normaNombre}</span></p>
        <p className="rt-muted small mb-1">Responsable asignado automáticamente:</p>
        <p className="fw-medium mb-3">{responsableAsignado}</p>
        {!asignadoPorEspecialidad && (
          <p className="small mb-3" style={{ color: "var(--rt-warning)" }}>
            <i className="bi bi-exclamation-triangle me-1"></i>
            No había un responsable con la especialidad exacta de esta norma; se asignó al de menor carga disponible.
          </p>
        )}
        <span className="rt-badge rt-badge-baja">Estado: En progreso</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rt-panel p-4" style={{ maxWidth: 480 }}>
      <h1 className="fs-5 fw-semibold mb-1">Solicitar auditoría de cumplimiento</h1>
      <p className="rt-muted small mb-4">Finora Créditos S.A.</p>

      <div className="mb-3">
        <label className="form-label small rt-muted">Norma o política a auditar</label>
        <select className="form-select rt-input" value={idNorma} onChange={(e) => setIdNorma(e.target.value)} required>
          <option value="">Seleccionar...</option>
          {normas.map((n) => (
            <option key={n.id_norma} value={n.id_norma}>{n.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small rt-muted">Fecha solicitada</label>
        <input type="date" className="form-control rt-input" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <div className="mb-4">
        <label className="form-label small rt-muted">Comentario inicial (opcional)</label>
        <textarea className="form-control rt-input" rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
      </div>

      {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

      <button type="submit" className="btn rt-btn-primary w-100" disabled={cargando}>
        {cargando ? "Solicitando..." : "Solicitar auditoría"}
      </button>
    </form>
  );
}
