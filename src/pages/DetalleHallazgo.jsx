import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPatch } from "../utils/api";
import { claseSeveridad } from "../utils/severidad";
import { useAuth } from "../context/AuthContext";

export default function DetalleHallazgo() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [hallazgo, setHallazgo] = useState(null);
  const [evidencia, setEvidencia] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [error, setError] = useState("");
  const [mostrarResolucionAlternativa, setMostrarResolucionAlternativa] = useState(null); // "Riesgo Aceptado" | "Falso Positivo"
  const [cargando, setCargando] = useState(false);
  const [porcentajeActualizado, setPorcentajeActualizado] = useState(null);

  const [colaboradores, setColaboradores] = useState([]);
  const [colaboradorElegido, setColaboradorElegido] = useState("");
  const [errorAsignar, setErrorAsignar] = useState("");

  const [accionAdmin, setAccionAdmin] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [nuevoResponsable, setNuevoResponsable] = useState("");
  const [diasExtension, setDiasExtension] = useState("");
  const [justificacionAdmin, setJustificacionAdmin] = useState("");
  const [errorAdmin, setErrorAdmin] = useState("");

  const cargar = () => {
    apiGet(`/hallazgos/${id}`)
      .then(setHallazgo)
      .catch((err) => setError(err.message));
  };

  useEffect(cargar, [id]);

  useEffect(() => {
    if (usuario?.rol === "Administrador") {
      apiGet("/usuarios")
        .then((data) => setResponsables(data.filter((u) => u.rol === "ResponsableCumplimiento")))
        .catch((err) => setErrorAdmin(err.message));
    }
    if (usuario?.rol === "ResponsableCumplimiento") {
      apiGet("/usuarios")
        .then((data) => setColaboradores(data.filter((u) => u.rol === "Colaborador")))
        .catch((err) => setErrorAsignar(err.message));
    }
  }, [usuario]);

  const handleAsignarColaborador = async () => {
    if (!colaboradorElegido) {
      setErrorAsignar("Seleccioná un colaborador.");
      return;
    }
    setErrorAsignar("");
    setCargando(true);
    try {
      await apiPatch(`/hallazgos/${id}/asignar`, { idColaborador: Number(colaboradorElegido) });
      cargar();
    } catch (err) {
      setErrorAsignar(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRemediar = async () => {
    if (!evidencia.trim()) {
      setError("Debés adjuntar evidencia de la remediación.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await apiPatch(`/hallazgos/${id}/remediar`, { evidencia });
      setEvidencia("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRetest = async (resultado) => {
    setCargando(true);
    try {
      const data = await apiPatch(`/hallazgos/${id}/retest`, { resultado });
      setPorcentajeActualizado(data.porcentajeCumplimiento);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleResolucionAlternativa = async () => {
    if (!justificacion.trim()) {
      setError("La justificación es obligatoria.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const data = await apiPatch(`/hallazgos/${id}/riesgo-aceptado`, { justificacion, tipo: mostrarResolucionAlternativa });
      setPorcentajeActualizado(data.porcentajeCumplimiento);
      setJustificacion("");
      setMostrarResolucionAlternativa(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleReasignar = async () => {
    if (!nuevoResponsable) {
      setErrorAdmin("Seleccioná el nuevo responsable.");
      return;
    }
    setErrorAdmin("");
    setCargando(true);
    try {
      await apiPatch(`/hallazgos/${id}/reasignar`, { idNuevoResponsable: Number(nuevoResponsable) });
      setAccionAdmin(null);
      setNuevoResponsable("");
      cargar();
    } catch (err) {
      setErrorAdmin(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleExtenderPlazo = async () => {
    if (!diasExtension || !justificacionAdmin.trim()) {
      setErrorAdmin("Completá los días de extensión y la justificación.");
      return;
    }
    setErrorAdmin("");
    setCargando(true);
    try {
      await apiPatch(`/hallazgos/${id}/extender-plazo`, { dias: Number(diasExtension), justificacion: justificacionAdmin });
      setAccionAdmin(null);
      setDiasExtension(""); setJustificacionAdmin("");
      cargar();
    } catch (err) {
      setErrorAdmin(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!hallazgo) {
    return <div className="rt-panel p-4">{error || "Cargando..."}</div>;
  }

  const {
    estado, severidad, item_descripcion, item_area, fecha_limite_sla,
    nota_administrador, id_colaborador_asignado, colaborador_asignado_nombre, tipo_resolucion_propuesta,
  } = hallazgo;
  const esAdministrador = usuario?.rol === "Administrador";
  const esResponsable = usuario?.rol === "ResponsableCumplimiento";
  const esColaboradorAsignado = usuario?.rol === "Colaborador" && usuario?.id === id_colaborador_asignado;
  const puedeAsignar = !id_colaborador_asignado && ["Abierto", "Escalado"].includes(estado);
  const puedeRemediar = ["Asignado", "Reabierto"].includes(estado);

  const colaboradoresDelArea = item_area ? colaboradores.filter((c) => c.area === item_area) : [];
  const colaboradoresParaAsignar = colaboradoresDelArea.length > 0 ? colaboradoresDelArea : colaboradores;

  return (
    <div className="rt-panel p-4" style={{ maxWidth: 560 }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h1 className="fs-5 fw-semibold mb-0">{item_descripcion}</h1>
        <span className={`rt-badge ${claseSeveridad(severidad)}`}>
          {severidad}
        </span>
      </div>
      <p className="rt-muted small mb-1">Fecha límite (SLA): {new Date(fecha_limite_sla).toLocaleDateString("es-AR")}</p>
      <p className="rt-muted small mb-4">
        Colaborador responsable de la remediación: {colaborador_asignado_nombre || "Sin asignar"}
      </p>

      {porcentajeActualizado !== null && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-accent)", background: "rgba(45,212,191,0.08)" }}>
          <span className="small" style={{ color: "var(--rt-accent)" }}>
            <i className="bi bi-graph-up me-1"></i>
            % de cumplimiento actualizado de la auditoría: <strong>{porcentajeActualizado}%</strong>
          </span>
        </div>
      )}

      {nota_administrador && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-border)" }}>
          <span className="rt-muted small"><i className="bi bi-info-circle me-1"></i>{nota_administrador}</span>
        </div>
      )}

      {estado === "Escalado" && !esAdministrador && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-warning)", background: "rgba(245,158,11,0.08)" }}>
          <span className="small" style={{ color: "var(--rt-warning)" }}>
            <i className="bi bi-exclamation-triangle me-1"></i>
            Este hallazgo superó su plazo de remediación y fue escalado automáticamente al Administrador.
          </span>
        </div>
      )}

      {esResponsable && puedeAsignar && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-border)" }}>
          <label className="form-label small rt-muted">
            Asignar colaborador responsable de la remediación
            {item_area && ` (área: ${item_area})`}
          </label>
          <select className="form-select form-select-sm rt-input mb-2" value={colaboradorElegido} onChange={(e) => setColaboradorElegido(e.target.value)}>
            <option value="">Seleccionar...</option>
            {colaboradoresParaAsignar.map((c) => <option key={c.id_usuario} value={c.id_usuario}>{c.nombre}{c.area ? ` (${c.area})` : ""}</option>)}
          </select>
          {item_area && colaboradoresDelArea.length === 0 && (
            <p className="small mb-2" style={{ color: "var(--rt-warning)" }}>
              <i className="bi bi-exclamation-triangle me-1"></i>
              No hay colaboradores del área "{item_area}". Mostrando todos los colaboradores de la entidad.
            </p>
          )}
          {errorAsignar && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorAsignar}</div>}
          <button className="btn rt-btn-primary btn-sm" onClick={handleAsignarColaborador} disabled={cargando}>Asignar</button>
        </div>
      )}

      {esResponsable && estado === "Asignado" && (
        <p className="rt-muted small mb-4">
          Esperando la remediación de {colaborador_asignado_nombre}. Cuando cargue evidencia vas a poder hacer el retest acá mismo.
        </p>
      )}

      {estado === "Escalado" && esAdministrador && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-warning)", background: "rgba(245,158,11,0.08)" }}>
          <p className="small mb-3" style={{ color: "var(--rt-warning)" }}>
            <i className="bi bi-exclamation-triangle me-1"></i>
            Este hallazgo superó su plazo sin remediación. Elegí cómo proceder:
          </p>

          {!accionAdmin && (
            <div className="d-flex gap-2">
              <button className="btn rt-btn-primary btn-sm" onClick={() => setAccionAdmin("reasignar")}>Reasignar responsable</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setAccionAdmin("extender")}>Extender plazo</button>
            </div>
          )}

          {accionAdmin === "reasignar" && (
            <>
              <label className="form-label small rt-muted">Nuevo responsable</label>
              <select className="form-select form-select-sm rt-input mb-2" value={nuevoResponsable} onChange={(e) => setNuevoResponsable(e.target.value)}>
                <option value="">Seleccionar...</option>
                {responsables.map((r) => <option key={r.id_usuario} value={r.id_usuario}>{r.nombre}</option>)}
              </select>
              {errorAdmin && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorAdmin}</div>}
              <button className="btn rt-btn-primary btn-sm" onClick={handleReasignar} disabled={cargando}>Confirmar reasignación</button>
            </>
          )}

          {accionAdmin === "extender" && (
            <>
              <label className="form-label small rt-muted">Días de extensión</label>
              <input type="number" className="form-control form-control-sm rt-input mb-2" value={diasExtension} onChange={(e) => setDiasExtension(e.target.value)} />
              <label className="form-label small rt-muted">Justificación (obligatoria)</label>
              <textarea className="form-control rt-input mb-2" rows={2} value={justificacionAdmin} onChange={(e) => setJustificacionAdmin(e.target.value)} />
              {errorAdmin && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorAdmin}</div>}
              <button className="btn rt-btn-primary btn-sm" onClick={handleExtenderPlazo} disabled={cargando}>Confirmar extensión</button>
            </>
          )}
        </div>
      )}

      {esColaboradorAsignado && puedeRemediar && !mostrarResolucionAlternativa && (
        <>
          <label className="form-label small rt-muted">Evidencia de la remediación</label>
          <textarea
            className="form-control rt-input mb-2"
            rows={3}
            placeholder="Describí la acción tomada y adjuntá la referencia de evidencia"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value)}
          />
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn rt-btn-primary" onClick={handleRemediar} disabled={cargando}>Marcar como remediado</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarResolucionAlternativa("Riesgo Aceptado")}>
              Marcar riesgo aceptado
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarResolucionAlternativa("Falso Positivo")}>
              Marcar falso positivo
            </button>
          </div>
        </>
      )}

      {esColaboradorAsignado && mostrarResolucionAlternativa && (
        <>
          <p className="small mb-2">Justificación para "{mostrarResolucionAlternativa}" (obligatoria):</p>
          <textarea className="form-control rt-input mb-2" rows={2} value={justificacion} onChange={(e) => setJustificacion(e.target.value)} />
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <div className="d-flex gap-2">
            <button className="btn rt-btn-primary" onClick={handleResolucionAlternativa} disabled={cargando}>Confirmar</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarResolucionAlternativa(null)}>Cancelar</button>
          </div>
        </>
      )}

      {estado === "Pendiente de Retest" && esResponsable && (
        <div className="p-3 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
          <p className="small mb-1">
            {tipo_resolucion_propuesta === "Remediacion" && "El colaborador cargó evidencia de remediación."}
            {tipo_resolucion_propuesta === "Riesgo Aceptado" && "El colaborador propuso aceptar el riesgo."}
            {tipo_resolucion_propuesta === "Falso Positivo" && "El colaborador propuso marcarlo como falso positivo."}
          </p>
          <p className="small mb-3">Verificá de forma independiente y registrá el resultado del retest:</p>
          <div className="d-flex gap-2">
            <button className="btn rt-btn-primary" onClick={() => handleRetest("Éxito")} disabled={cargando}>Retest exitoso (confirmar)</button>
            <button className="btn btn-outline-secondary" onClick={() => handleRetest("Fallido")} disabled={cargando}>Retest fallido (rechazar)</button>
          </div>
        </div>
      )}

      {estado === "Pendiente de Retest" && esColaboradorAsignado && (
        <p className="rt-muted small mb-0">
          Tu propuesta quedó registrada. El Responsable de Cumplimiento va a verificarla con un retest independiente antes de cerrarlo.
        </p>
      )}

      {estado === "Cerrado" && (
        <span className="rt-badge rt-badge-baja"><i className="bi bi-check-circle me-1"></i>Hallazgo cerrado</span>
      )}
      {estado === "Riesgo Aceptado" && (
        <span className="rt-badge rt-badge-media">Riesgo aceptado por el negocio (verificado)</span>
      )}
      {estado === "Falso Positivo" && (
        <span className="rt-badge rt-badge-media">Falso positivo (verificado)</span>
      )}
    </div>
  );
}
