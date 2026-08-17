import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../utils/api";
import { claseSeveridad, OPCIONES_SEVERIDAD } from "../utils/severidad";

export default function BackofficeNormasGlobales() {
  const [normas, setNormas] = useState([]);
  const [nuevaNormaNombre, setNuevaNormaNombre] = useState("");
  const [nuevaNormaDesc, setNuevaNormaDesc] = useState("");
  const [nuevaNormaCategoria, setNuevaNormaCategoria] = useState("");
  const [errorNorma, setErrorNorma] = useState("");
  const [normaSeleccionada, setNormaSeleccionada] = useState(null);
  const [items, setItems] = useState([]);
  const [nuevoItemDesc, setNuevoItemDesc] = useState("");
  const [nuevoItemCrit, setNuevoItemCrit] = useState("");
  const [errorItem, setErrorItem] = useState("");

  const cargarNormas = () => {
    apiGet("/normas").then(setNormas).catch((err) => setErrorNorma(err.message));
  };

  useEffect(cargarNormas, []);

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
      await apiPost(`/normas/${normaSeleccionada.id_norma}/items`, { descripcion: nuevoItemDesc, criticidad: nuevoItemCrit });
      setNuevoItemDesc(""); setNuevoItemCrit("");
      seleccionarNorma(normaSeleccionada);
    } catch (err) {
      setErrorItem(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 680 }}>
      <div className="rt-panel p-4">
        <h1 className="fs-5 fw-semibold mb-1">Normas globales</h1>
        <p className="rt-muted small mb-3">
          Estándares compartidos por todas las entidades de la plataforma (ej. ISO 9001, PCI DSS). No confundir con las
          políticas internas que cada Administrador crea para su propia entidad — esas no aparecen acá.
        </p>

        <div className="row g-2 mb-3">
          <div className="col-4">
            <input className="form-control form-control-sm rt-input" placeholder="Nombre de la norma" value={nuevaNormaNombre} onChange={(e) => setNuevaNormaNombre(e.target.value)} />
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
              className="p-2 rounded-3 small"
              style={{ border: "1px solid var(--rt-border)", cursor: "pointer" }}
            >
              {n.nombre}
            </div>
          ))}
          {normas.length === 0 && <p className="rt-muted small mb-0">Todavía no hay normas globales cargadas.</p>}
        </div>
      </div>

      {normaSeleccionada && (
        <div className="rt-panel p-4">
          <h2 className="fs-6 fw-semibold mb-3">Checklist de "{normaSeleccionada.nombre}"</h2>

          <div className="d-flex flex-column gap-2 mb-3">
            {items.map((it) => (
              <div key={it.id_item} className="d-flex justify-content-between small py-2" style={{ borderBottom: "1px solid var(--rt-border)" }}>
                <span>{it.descripcion}</span>
                <span className={`rt-badge ${claseSeveridad(it.criticidad)}`}>
                  {it.criticidad}
                </span>
              </div>
            ))}
            {items.length === 0 && <p className="rt-muted small mb-0">Sin ítems cargados todavía.</p>}
          </div>

          <div className="row g-2 mb-2">
            <div className="col-7">
              <input className="form-control form-control-sm rt-input" placeholder="Nuevo ítem del checklist" value={nuevoItemDesc} onChange={(e) => setNuevoItemDesc(e.target.value)} />
            </div>
            <div className="col-3">
              <select className="form-select form-select-sm rt-input" value={nuevoItemCrit} onChange={(e) => setNuevoItemCrit(e.target.value)}>
                <option value="">Criticidad...</option>
                {OPCIONES_SEVERIDAD.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-2">
              <button className="btn rt-btn-primary btn-sm w-100" onClick={handleAgregarItem}>Agregar</button>
            </div>
          </div>
          {errorItem && <div className="small" style={{ color: "var(--rt-critical)" }}>{errorItem}</div>}
        </div>
      )}
    </div>
  );
}
