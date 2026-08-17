import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RUTA_INICIAL = {
  Administrador: "/dashboard",
  ResponsableCumplimiento: "/auditorias",
  Colaborador: "/capacitaciones",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario = await login(email, password);
      navigate(RUTA_INICIAL[usuario.rol] ?? "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <form onSubmit={handleSubmit} className="rt-panel p-4" style={{ width: "100%", maxWidth: "380px" }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="d-flex align-items-center justify-content-center rounded-3"
               style={{ width: 36, height: 36, backgroundColor: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)" }}>
            <i className="bi bi-shield-lock" style={{ color: "var(--rt-accent)" }}></i>
          </div>
          <span className="fw-semibold fs-5">ReguTech</span>
        </div>

        <h1 className="fs-4 fw-semibold mb-1">Acceder a la plataforma</h1>
        <p className="rt-muted small mb-4">Compliance financiero, bajo control.</p>

        <div className="mb-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="form-control rt-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            placeholder="Contraseña"
            className="form-control rt-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="small mb-3" style={{ color: "var(--rt-critical)" }}>{error}</div>}

        <button type="submit" className="btn rt-btn-primary w-100" disabled={cargando}>
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
