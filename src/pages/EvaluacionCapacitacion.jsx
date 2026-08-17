import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../utils/api";

export default function EvaluacionCapacitacion() {
  const { id } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(true);
  const [paso, setPaso] = useState("evaluacion");
  const [respuestas, setRespuestas] = useState({});
  const [nota, setNota] = useState(null);
  const [notaMinima, setNotaMinima] = useState(60);
  const [error, setError] = useState("");
  const [likert, setLikert] = useState(null);
  const [comentario, setComentario] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    apiGet(`/capacitaciones/${id}/preguntas`)
      .then(setPreguntas)
      .catch((err) => setError(err.message))
      .finally(() => setCargandoPreguntas(false));
  }, [id]);

  const handleEnviarEvaluacion = async () => {
    const faltantes = preguntas.filter((p) => !respuestas[p.id_pregunta]);
    if (faltantes.length > 0) {
      setError("Respondé todas las preguntas antes de enviar.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const payload = {
        respuestas: preguntas.map((p) => ({ idPregunta: p.id_pregunta, respuestaElegida: respuestas[p.id_pregunta] })),
      };
      const data = await apiPost(`/capacitaciones/${id}/registrar`, payload);
      setNota(data.nota);
      setNotaMinima(data.notaMinima);
      setPaso(data.aprobado ? "autoreporte" : "reprobado");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleReintentar = () => {
    setRespuestas({});
    setNota(null);
    setError("");
    setPaso("evaluacion");
  };

  const handleEnviarAutoreporte = async () => {
    if (!likert) {
      setError("Seleccioná un puntaje antes de continuar.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await apiPost("/autoreportes", { puntajeLikert: likert, comentario });
      setPaso("confirmado");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoPreguntas) {
    return <div className="rt-panel p-4">Cargando evaluación...</div>;
  }

  if (preguntas.length === 0) {
    return (
      <div className="rt-panel p-4" style={{ maxWidth: 520 }}>
        <p className="small mb-0" style={{ color: "var(--rt-warning)" }}>
          <i className="bi bi-exclamation-triangle me-1"></i>
          Esta capacitación todavía no tiene preguntas cargadas. Pedile al Administrador que las agregue antes de rendirla.
        </p>
      </div>
    );
  }

  if (paso === "reprobado") {
    return (
      <div className="rt-panel p-4" style={{ maxWidth: 520 }}>
        <h1 className="fs-5 fw-semibold mb-2">Nota insuficiente</h1>
        <p className="rt-muted small mb-3">
          Obtuviste {nota} puntos. La nota mínima para aprobar es {notaMinima}. Podés volver a rendir la evaluación.
        </p>
        <button className="btn rt-btn-primary" onClick={handleReintentar}>Reintentar evaluación</button>
      </div>
    );
  }

  if (paso === "autoreporte") {
    return (
      <div className="rt-panel p-4" style={{ maxWidth: 520 }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-check-circle-fill" style={{ color: "var(--rt-accent)" }}></i>
          <span className="small">Evaluación aprobada con {nota} puntos</span>
        </div>
        <h1 className="fs-5 fw-semibold mb-3">Autoreporte periódico</h1>
        <p className="rt-muted small mb-2">¿Cómo percibís la cultura de cumplimiento en tu área actualmente?</p>
        <div className="d-flex gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`btn ${likert === n ? "rt-btn-primary" : "btn-outline-secondary"}`}
              style={{ width: 44 }}
              onClick={() => setLikert(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <label className="form-label small rt-muted">Comentario (opcional)</label>
        <textarea className="form-control rt-input mb-2" rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
        <button className="btn rt-btn-primary" onClick={handleEnviarAutoreporte} disabled={cargando}>Enviar autoreporte</button>
      </div>
    );
  }

  if (paso === "confirmado") {
    return (
      <div className="rt-panel p-4" style={{ maxWidth: 520 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="bi bi-check-circle-fill" style={{ color: "var(--rt-accent)", fontSize: "1.4rem" }}></i>
          <h1 className="fs-5 fw-semibold mb-0">Listo</h1>
        </div>
        <p className="rt-muted small mb-0">
          Se registró tu nota de evaluación ({nota} puntos) y tu autoreporte periódico.
        </p>
      </div>
    );
  }

  return (
    <div className="rt-panel p-4" style={{ maxWidth: 560 }}>
      <h1 className="fs-5 fw-semibold mb-1">Evaluación de capacitación</h1>
      <p className="rt-muted small mb-4">Evaluación obligatoria — nota mínima {notaMinima} puntos</p>

      <div className="d-flex flex-column gap-4">
        {preguntas.map((p) => (
          <div key={p.id_pregunta}>
            <p className="small mb-2">{p.texto}</p>
            <div className="d-flex flex-column gap-1">
              {p.opciones.map((op) => (
                <label key={op} className="d-flex align-items-center gap-2 small" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name={`pregunta-${p.id_pregunta}`}
                    checked={respuestas[p.id_pregunta] === op}
                    onChange={() => setRespuestas((prev) => ({ ...prev, [p.id_pregunta]: op }))}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="small mt-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}
      <button className="btn rt-btn-primary mt-3" onClick={handleEnviarEvaluacion} disabled={cargando}>
        {cargando ? "Enviando..." : "Enviar evaluación"}
      </button>
    </div>
  );
}
