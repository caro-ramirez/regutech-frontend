import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "../utils/api";

export default function GestionCapacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [nombre, setNombre] = useState("");
  const [notaMinima, setNotaMinima] = useState("60");
  const [error, setError] = useState("");

  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState(["", "", "", ""]);
  const [nuevaCorrecta, setNuevaCorrecta] = useState("");
  const [errorPregunta, setErrorPregunta] = useState("");

  const cargar = () => {
    apiGet("/capacitaciones/todas").then(setCapacitaciones).catch((err) => setError(err.message));
  };

  useEffect(cargar, []);

  const handleCrear = async () => {
    if (!nombre.trim()) {
      setError("El nombre de la capacitación es obligatorio.");
      return;
    }
    setError("");
    try {
      await apiPost("/capacitaciones", { nombre, notaMinima: Number(notaMinima) });
      setNombre(""); setNotaMinima("60");
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await apiDelete(`/capacitaciones/${id}`);
      if (capacitacionSeleccionada?.id_capacitacion === id) setCapacitacionSeleccionada(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const seleccionarCapacitacion = (cap) => {
    setCapacitacionSeleccionada(cap);
    setErrorPregunta("");
    apiGet(`/capacitaciones/${cap.id_capacitacion}/preguntas-admin`).then(setPreguntas).catch((err) => setErrorPregunta(err.message));
  };

  const handleAgregarPregunta = async () => {
    const opcionesLimpias = nuevasOpciones.map((o) => o.trim()).filter(Boolean);
    if (!nuevoTexto.trim() || opcionesLimpias.length < 2 || !nuevaCorrecta) {
      setErrorPregunta("Completá el enunciado, al menos 2 opciones y marcá cuál es la correcta.");
      return;
    }
    setErrorPregunta("");
    try {
      await apiPost(`/capacitaciones/${capacitacionSeleccionada.id_capacitacion}/preguntas`, {
        texto: nuevoTexto,
        opciones: opcionesLimpias,
        respuestaCorrecta: nuevaCorrecta,
      });
      setNuevoTexto(""); setNuevasOpciones(["", "", "", ""]); setNuevaCorrecta("");
      seleccionarCapacitacion(capacitacionSeleccionada);
    } catch (err) {
      setErrorPregunta(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 680 }}>
      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-1">Gestión de capacitaciones</h1>
        <p className="rt-muted small mb-4">
          Las capacitaciones que crees acá son obligatorias para todos los Colaboradores de tu entidad.
        </p>

        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-border)" }}>
          <div className="row g-2 mb-2">
            <div className="col-8">
              <input className="form-control form-control-sm rt-input" placeholder="Nombre de la capacitación" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-4">
              <input type="number" className="form-control form-control-sm rt-input" placeholder="Nota mínima" value={notaMinima} onChange={(e) => setNotaMinima(e.target.value)} />
            </div>
          </div>
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <button className="btn rt-btn-primary btn-sm" onClick={handleCrear}>Crear capacitación</button>
        </div>

        <div className="d-flex flex-column gap-2">
          {capacitaciones.map((c) => (
            <div
              key={c.id_capacitacion}
              className="d-flex align-items-center justify-content-between p-2 rounded-3"
              style={{ border: "1px solid var(--rt-border)", cursor: "pointer" }}
              onClick={() => seleccionarCapacitacion(c)}
            >
              <div>
                <div className="small" style={{ color: "var(--rt-text)" }}>{c.nombre}</div>
                <div className="rt-muted" style={{ fontSize: "0.75rem" }}>Nota mínima: {c.nota_minima}</div>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); handleEliminar(c.id_capacitacion); }}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
          {capacitaciones.length === 0 && <p className="rt-muted small mb-0">Todavía no creaste ninguna capacitación.</p>}
        </div>
      </div>

      {capacitacionSeleccionada && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Preguntas de "{capacitacionSeleccionada.nombre}"</h2>

          <div className="d-flex flex-column gap-2 mb-3">
            {preguntas.map((p) => (
              <div key={p.id_pregunta} className="py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
                <p className="small mb-1">{p.texto}</p>
                <p className="rt-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  Opciones: {p.opciones.join(" / ")} — Correcta: <strong>{p.respuesta_correcta}</strong>
                </p>
              </div>
            ))}
            {preguntas.length === 0 && (
              <p className="small mb-0" style={{ color: "var(--rt-warning)" }}>
                <i className="bi bi-exclamation-triangle me-1"></i>
                Sin preguntas cargadas — el Colaborador no va a poder rendir esta capacitación hasta que agregues al menos una.
              </p>
            )}
          </div>

          <label className="form-label small rt-muted">Enunciado de la nueva pregunta</label>
          <input className="form-control form-control-sm rt-input mb-2" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} />

          <label className="form-label small rt-muted">Opciones</label>
          {nuevasOpciones.map((op, i) => (
            <input
              key={i}
              className="form-control form-control-sm rt-input mb-2"
              placeholder={`Opción ${i + 1}${i < 2 ? " (obligatoria)" : " (opcional)"}`}
              value={op}
              onChange={(e) => {
                const copia = [...nuevasOpciones];
                copia[i] = e.target.value;
                setNuevasOpciones(copia);
              }}
            />
          ))}

          <label className="form-label small rt-muted">Respuesta correcta</label>
          <select className="form-select form-select-sm rt-input mb-2" value={nuevaCorrecta} onChange={(e) => setNuevaCorrecta(e.target.value)}>
            <option value="">Seleccionar...</option>
            {nuevasOpciones.filter((o) => o.trim()).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          {errorPregunta && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorPregunta}</div>}
          <button className="btn rt-btn-primary btn-sm" onClick={handleAgregarPregunta}>Agregar pregunta</button>
        </div>
      )}
    </div>
  );
}
