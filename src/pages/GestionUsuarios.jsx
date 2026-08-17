import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "../utils/api";

const ROLES = ["Administrador", "ResponsableCumplimiento", "Colaborador"];

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [area, setArea] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = () => {
    apiGet("/usuarios")
      .then(setUsuarios)
      .catch((err) => setError(err.message));
  };

  useEffect(cargar, []);

  const handleAgregar = async () => {
    if (!nombre.trim() || !email.trim() || !rol) {
      setError("Completá nombre, correo y rol antes de guardar.");
      return;
    }
    setError("");
    try {
      const data = await apiPost("/usuarios", { nombre, email, rol, area, especialidad });
      setMensaje(`Usuario creado. Contraseña temporal: ${data.passwordTemporal}`);
      setNombre(""); setEmail(""); setRol(""); setArea(""); setEspecialidad("");
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await apiDelete(`/usuarios/${id}`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="rt-panel p-4" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-5 fw-semibold mb-0">Gestión de usuarios</h1>
        <button className="btn rt-btn-primary btn-sm" onClick={() => setMostrarForm((v) => !v)}>
          <i className="bi bi-person-plus me-1"></i>Nuevo usuario
        </button>
      </div>

      {mensaje && <div className="small mb-3" style={{ color: "var(--rt-accent)" }}>{mensaje}</div>}

      {mostrarForm && (
        <div className="p-3 rounded-3 mb-4" style={{ border: "1px solid var(--rt-border)" }}>
          <div className="row g-2 mb-2">
            <div className="col-3">
              <input className="form-control form-control-sm rt-input" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-3">
              <input className="form-control form-control-sm rt-input" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-3">
              <select className="form-select form-select-sm rt-input" value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="">Rol...</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-3">
              <input className="form-control form-control-sm rt-input" placeholder="Área (opcional)" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            {rol === "ResponsableCumplimiento" && (
              <div className="col-3">
                <input className="form-control form-control-sm rt-input" placeholder="Especialidad (ej. Calidad)" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
              </div>
            )}
          </div>
          {error && <div className="small mb-2" style={{ color: "var(--rt-critical)" }}>{error}</div>}
          <button className="btn rt-btn-primary btn-sm" onClick={handleAgregar}>Guardar</button>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {usuarios.map((u) => (
          <div key={u.id_usuario} className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
            <div>
              <div className="small" style={{ color: "var(--rt-text)" }}>{u.nombre}</div>
              <div className="rt-muted" style={{ fontSize: "0.75rem" }}>
                {u.email}{u.area ? ` · ${u.area}` : ""}{u.especialidad ? ` · Especialidad: ${u.especialidad}` : ""}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rt-badge rt-badge-baja">{u.rol}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEliminar(u.id_usuario)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
