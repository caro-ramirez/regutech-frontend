import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoFull from "../assets/logo-full.png";

const RUTA_INICIAL = {
  Backoffice: "/backoffice/entidades",
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
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgb(51 65 85 / 0.35) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      <form onSubmit={handleSubmit} className="rt-panel p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="d-flex justify-content-center mb-4">
          <img src={logoFull} alt="ReguTech" style={{ maxWidth: 260, width: "100%" }} />
        </div>

        <h1 className="fs-4 fw-semibold mb-1 text-center">Acceder a la plataforma</h1>
        <p className="rt-muted small mb-4 text-center">Compliance financiero, bajo control.</p>

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
