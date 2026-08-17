import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut } from "../utils/api";

export default function ConfiguracionNormativa() {
  // --- SLA y umbral ---
  const [config, setConfig] = useState(null);
  const [slaAlta, setSlaAlta] = useState("");
  const [slaMedia, setSlaMedia] = useState("");
  const [slaBaja, setSlaBaja] = useState("");
  const [umbral, setUmbral] = useState("");
  const [mensajeConfig, setMensajeConfig] = useState("");
  const [errorConfig, setErrorConfig] = useState("");

  // --- Normas ---
  const [normas, setNormas] = useState([]);
  const [nuevaNormaNombre, setNuevaNormaNombre] = useState("");
  const [nuevaNormaDesc, setNuevaNormaDesc] = useState("");
  const [nuevaNormaCategoria, setNuevaNormaCategoria] = useState("");
  const [errorNorma, setErrorNorma] = useState("");
  const [normaSeleccionada, setNormaSeleccionada] = useState(null);
  const [items, setItems] = useState([]);
  const [nuevoItemDesc, setNuevoItemDesc] = useState("");
  const [nuevoItemCrit, setNuevoItemCrit] = useState("");
  const [nuevoItemArea, setNuevoItemArea] = useState("");
  const [errorItem, setErrorItem] = useState("");

  useEffect(() => {
    apiGet("/configuracion").then((c) => {
      setConfig(c);
      setSlaAlta(c.sla_alta_dias);
      setSlaMedia(c.sla_media_dias);
      setSlaBaja(c.sla_baja_dias);
      setUmbral(c.umbral_certificacion);
    });
    cargarNormas();
  }, []);

  const cargarNormas = () => {
    apiGet("/normas").then(setNormas).catch((err) => setErrorNorma(err.message));
  };

  const handleGuardarConfig = async () => {
    if (!slaAlta || !slaMedia || !slaBaja || !umbral) {
      setErrorConfig("Completá todos los valores.");
      return;
    }
    setErrorConfig("");
    try {
      await apiPut("/configuracion", {
        slaAltaDias: Number(slaAlta),
        slaMediaDias: Number(slaMedia),
        slaBajaDias: Number(slaBaja),
        umbralCertificacion: Number(umbral),
      });
      setMensajeConfig("Configuración guardada.");
    } catch (err) {
      setErrorConfig(err.message);
    }
  };

  const handleCrearNorma = async () => {
    if (!nuevaNormaNombre.trim()) {
      setErrorNorma("El nombre de la norma es obligatorio.");
      return;
    }
    setErrorNorma("");
    try {
      await apiPost("/normas", { nombre: nuevaNormaNombre, descripcion: nuevaNormaDesc, categoria: nuevaNormaCategoria });
      setNuevaNormaNombre(""); setNuevaNormaDesc(""); setNuevaNormaCategoria("");
      cargarNormas();
    } catch (err) {
      setErrorNorma(err.message);
    }
  };

  const seleccionarNorma = (norma) => {
    setNormaSeleccionada(norma);
    setErrorItem("");
    apiGet(`/normas/${norma.id_norma}/items`).then(setItems).catch((err) => setErrorItem(err.message));
  };

  const handleAgregarItem = async () => {
    if (!nuevoItemDesc.trim() || !nuevoItemCrit) {
      setErrorItem("Completá descripción y criticidad.");
      return;
    }
    setErrorItem("");
    try {
      await apiPost(`/normas/${normaSeleccionada.id_norma}/items`, { descripcion: nuevoItemDesc, criticidad: nuevoItemCrit, area: nuevoItemArea });
      setNuevoItemDesc(""); setNuevoItemCrit(""); setNuevoItemArea("");
      seleccionarNorma(normaSeleccionada);
    } catch (err) {
      setErrorItem(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 680 }}>
      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-3">SLA por severidad y umbral de certificación</h1>
        <div className="row g-2 mb-2">
          <div className="col-3">
            <label className="form-label small rt-muted">SLA Alta (días)</label>
            <input type="number" className="form-control form-control-sm rt-input" value={slaAlta} onChange={(e) => setSlaAlta(e.target.value)} />
          </div>
          <div className="col-3">
            <label className="form-label small rt-muted">SLA Media (días)</label>
            <input type="number" className="form-control form-control-sm rt-input" value={slaMedia} onChange={(e) => setSlaMedia(e.target.value)} />
          </div>
          <div className="col-3">
            <label className="form-label small rt-muted">SLA Baja (días)</label>
            <input type="number" className="form-control form-control-sm rt-input" value={slaBaja} onChange={(e) => setSlaBaja(e.target.value)} />
          </div>
          <div className="col-3">
            <label className="form-label small rt-muted">Umbral certificación (%)</label>
            <input type="number" className="form-control form-control-sm rt-input" value={umbral} onChange={(e) => setUmbral(e.target.value)} />
          </div>
        </div>
        {errorConfig && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorConfig}</div>}
        {mensajeConfig && <div className="small mb-2" style={{ color: "var(--rt-accent)" }}>{mensajeConfig}</div>}
        <button className="btn rt-btn-primary btn-sm" onClick={handleGuardarConfig}>Guardar configuración</button>
      </div>

      <div className="rt-panel p-4">
        <h2 className="fs-6 fw-semibold mb-3">Normas y políticas</h2>
        <div className="row g-2 mb-3">
          <div className="col-4">
            <input className="form-control form-control-sm rt-input" placeholder="Nombre de la nueva norma" value={nuevaNormaNombre} onChange={(e) => setNuevaNormaNombre(e.target.value)} />
          </div>
          <div className="col-3">
            <input className="form-control form-control-sm rt-input" placeholder="Descripción (opcional)" value={nuevaNormaDesc} onChange={(e) => setNuevaNormaDesc(e.target.value)} />
          </div>
          <div className="col-3">
            <input className="form-control form-control-sm rt-input" placeholder="Categoría (ej. Calidad)" value={nuevaNormaCategoria} onChange={(e) => setNuevaNormaCategoria(e.target.value)} />
          </div>
          <div className="col-2">
            <button className="btn rt-btn-primary btn-sm w-100" onClick={handleCrearNorma}>Crear</button>
          </div>
        </div>
        {errorNorma && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{errorNorma}</div>}

        <div className="d-flex flex-column gap-2">
          {normas.map((n) => (
            <div
              key={n.id_norma}
              onClick={() => seleccionarNorma(n)}
              className="d-flex align-items-center justify-content-between p-2 rounded-3"
              style={{ border: "1px solid var(--rt-border)", cursor: "pointer" }}
            >
              <span className="small">{n.nombre}</span>
              <span className={`rt-badge ${n.id_entidad ? "rt-badge-baja" : "rt-badge-media"}`}>
                {n.id_entidad ? "Propia (editable)" : "Global"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {normaSeleccionada && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Checklist de "{normaSeleccionada.nombre}"</h2>

          {!normaSeleccionada.id_entidad && (
            <p className="rt-muted small mb-3">
              Esta es una norma global compartida por todas las entidades. Solo podés ver su checklist, no editarlo.
            </p>
          )}

          <div className="d-flex flex-column gap-2 mb-3">
            {items.map((it) => (
              <div key={it.id_item} className="d-flex justify-content-between small py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
                <span>{it.descripcion}</span>
                <span className={`rt-badge ${it.criticidad === "Alta" ? "rt-badge-alta" : it.criticidad === "Media" ? "rt-badge-media" : "rt-badge-baja"}`}>
                  {it.criticidad}
                </span>
              </div>
            ))}
            {items.length === 0 && <p className="rt-muted small mb-0">Sin ítems cargados todavía.</p>}
          </div>

          {normaSeleccionada.id_entidad && (
            <>
              <div className="row g-2 mb-2">
                <div className="col-5">
                  <input className="form-control form-control-sm rt-input" placeholder="Nuevo ítem del checklist" value={nuevoItemDesc} onChange={(e) => setNuevoItemDesc(e.target.value)} />
                </div>
                <div className="col-3">
                  <select className="form-select form-select-sm rt-input" value={nuevoItemCrit} onChange={(e) => setNuevoItemCrit(e.target.value)}>
                    <option value="">Criticidad...</option>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
                <div className="col-2">
                  <input className="form-control form-control-sm rt-input" placeholder="Área (opcional)" value={nuevoItemArea} onChange={(e) => setNuevoItemArea(e.target.value)} />
                </div>
                <div className="col-2">
                  <button className="btn rt-btn-primary btn-sm w-100" onClick={handleAgregarItem}>Agregar</button>
                </div>
              </div>
              {errorItem && <div className="small" style={{ color: "var(--rt-critical)" }}>{errorItem}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
