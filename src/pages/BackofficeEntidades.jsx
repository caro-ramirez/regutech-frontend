import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../utils/api";

export default function BackofficeEntidades() {
  const [entidades, setEntidades] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [razonSocial, setRazonSocial] = useState("");
  const [tipoEntidad, setTipoEntidad] = useState("");
  const [adminNombre, setAdminNombre] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargar = () => {
    apiGet("/backoffice/entidades").then(setEntidades).catch((err) => setError(err.message));
  };

  useEffect(cargar, []);

  const handleCrear = async () => {
    if (!razonSocial.trim() || !tipoEntidad.trim() || !adminNombre.trim() || !adminEmail.trim()) {
      setError("Completá todos los campos antes de guardar.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const data = await apiPost("/backoffice/entidades", { razonSocial, tipoEntidad, adminNombre, adminEmail });
      setMensaje(
        `Entidad creada. Administrador: ${data.administrador.email} — Contraseña temporal: ${data.passwordTemporal}`
      );
      setRazonSocial(""); setTipoEntidad(""); setAdminNombre(""); setAdminEmail("");
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rt-panel p-4" style={{ maxWidth: 680 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-5 fw-semibold mb-0">Entidades financieras</h1>
        <button className="btn rt-btn-primary btn-sm" onClick={() => setMostrarForm((v) => !v)}>
          <i className="bi bi-building-add me-1"></i>Nueva entidad
        </button>
      </div>

      {mensaje && <div className="small mb-3" style={{ color: "var(--rt-accent)" }}>{mensaje}</div>}

      {mostrarForm && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-border)" }}>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <input className="form-control form-control-sm rt-input" placeholder="Razón social" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
            </div>
            <div className="col-6">
              <input className="form-control form-control-sm rt-input" placeholder="Tipo de entidad" value={tipoEntidad} onChange={(e) => setTipoEntidad(e.target.value)} />
            </div>
            <div className="col-6">
              <input className="form-control form-control-sm rt-input" placeholder="Nombre del Administrador" value={adminNombre} onChange={(e) => setAdminNombre(e.target.value)} />
            </div>
            <div className="col-6">
              <input className="form-control form-control-sm rt-input" placeholder="Correo del Administrador" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
          </div>
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <button className="btn rt-btn-primary btn-sm" onClick={handleCrear} disabled={cargando}>
            {cargando ? "Creando..." : "Crear entidad y Administrador"}
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {entidades.map((e) => (
          <div key={e.id_entidad} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
            <div>
              <div className="small" style={{ color: "var(--rt-text)" }}>{e.razon_social}</div>
              <div className="rt-muted" style={{ fontSize: "0.75rem" }}>{e.tipo_entidad}</div>
            </div>
            <span className="rt-badge rt-badge-baja">{e.cantidad_usuarios} usuario(s)</span>
          </div>
        ))}
        {entidades.length === 0 && !error && <p className="rt-muted small mb-0">Todavía no hay entidades registradas.</p>}
      </div>
    </div>
  );
}
