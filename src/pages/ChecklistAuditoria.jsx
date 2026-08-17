import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet, apiPost } from "../utils/api";

export default function ChecklistAuditoria() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [porcentaje, setPorcentaje] = useState(null);

  useEffect(() => {
    apiGet(`/auditorias/${id}/checklist`)
      .then((data) => {
        setItems(data.items);
        const previas = {};
        data.items.forEach((it) => {
          if (it.resultado) {
            previas[it.id_item] = { resultado: it.resultado, brecha: it.descripcion_brecha || "" };
          }
        });
        setRespuestas(previas);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const setResultado = (itemId, resultado) => {
    setRespuestas((prev) => ({ ...prev, [itemId]: { ...prev[itemId], resultado } }));
  };
  const setBrecha = (itemId, texto) => {
    setRespuestas((prev) => ({ ...prev, [itemId]: { ...prev[itemId], brecha: texto } }));
  };

  const completados = items.filter((i) => respuestas[i.id_item]?.resultado).length;
  const pct = items.length > 0 ? Math.round((completados / items.length) * 100) : 0;

  const handleFinalizar = async () => {
    const faltantes = items.filter((i) => !respuestas[i.id_item]?.resultado);
    if (faltantes.length > 0) {
      setError(`Faltan ${faltantes.length} ítem(s) por responder.`);
      return;
    }
    setError("");
    setCargando(true);
    try {
      const payload = {
        respuestas: items.map((i) => ({
          idItem: i.id_item,
          resultado: respuestas[i.id_item].resultado,
          descripcionBrecha: respuestas[i.id_item].brecha || null,
        })),
      };
      const data = await apiPost(`/auditorias/${id}/checklist`, payload);
      setPorcentaje(data.porcentajeCumplimiento);
      setFinalizado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (finalizado) {
    const hallazgos = items.filter((i) => respuestas[i.id_item]?.resultado !== "Cumple");
    return (
      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-3">Checklist completado</h1>
        <p className="rt-muted small mb-3">
          % de cumplimiento: {porcentaje}% — Se generaron automáticamente {hallazgos.length} hallazgo(s).
        </p>
        {hallazgos.map((h) => (
          <div key={h.id_item} className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
            <span className="small">{h.descripcion}</span>
            <span className={`rt-badge ${h.criticidad === "Alta" ? "rt-badge-alta" : "rt-badge-media"}`}>{h.criticidad}</span>
          </div>
        ))}
        <Link to={`/hallazgos?auditoriaId=${id}`} className="btn rt-btn-primary btn-sm mt-3">Ver panel de hallazgos</Link>
      </div>
    );
  }

  return (
    <div className="rt-panel p-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h1 className="fs-5 fw-semibold mb-0">Checklist de auditoría</h1>
        <span className="rt-mono small rt-muted">AUD-00{id}</span>
      </div>

      <div className="rt-pulse-track mb-4 mt-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`rt-pulse-segment ${i < Math.round(pct / 10) ? "filled-ok" : ""}`}></div>
        ))}
      </div>

      <div className="d-flex flex-column gap-4">
        {items.map((item) => (
          <div key={item.id_item} className="pb-3" style={{ borderBottom: "1px solid var(--rt-border)" }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="small">{item.descripcion}</span>
              <span className={`rt-badge ${item.criticidad === "Alta" ? "rt-badge-alta" : "rt-badge-media"}`}>{item.criticidad}</span>
            </div>
            <div className="btn-group btn-group-sm mb-2" role="group">
              {["Cumple", "Parcial", "No cumple"].map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`btn ${respuestas[item.id_item]?.resultado === op ? "rt-btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setResultado(item.id_item, op)}
                >
                  {op}
                </button>
              ))}
            </div>
            {(respuestas[item.id_item]?.resultado === "No cumple" || respuestas[item.id_item]?.resultado === "Parcial") && (
              <textarea
                className="form-control rt-input mt-1"
                placeholder="Describí brevemente la brecha detectada"
                rows={2}
                value={respuestas[item.id_item]?.brecha || ""}
                onChange={(e) => setBrecha(item.id_item, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {error && <div className="small mb-2 mt-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
      <button className="btn rt-btn-primary mt-3" onClick={handleFinalizar} disabled={cargando}>
        {cargando ? "Guardando..." : "Finalizar checklist"}
      </button>
    </div>
  );
}
