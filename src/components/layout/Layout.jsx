import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoMedium from "../../assets/logo-medium.png";
import logoIcon from "../../assets/logo-icon.png";

const NAV_BY_ROLE = {
  Backoffice: [
    { to: "/backoffice/entidades", icon: "bi-building", label: "Entidades Financieras" },
    { to: "/backoffice/normas", icon: "bi-journal-check", label: "Normas Globales" },
  ],
  Administrador: [
    { to: "/dashboard", icon: "bi-grid-1x2", label: "Dashboard Ejecutivo" },
    { to: "/usuarios", icon: "bi-people", label: "Gestión de Usuarios" },
    { to: "/auditorias/solicitar", icon: "bi-clipboard-check", label: "Solicitar Auditoría" },
    { to: "/cumplimiento", icon: "bi-patch-check", label: "Cumplimiento y Certificados" },
    { to: "/configuracion", icon: "bi-sliders", label: "Configuración Normativa" },
    { to: "/capacitaciones-gestion", icon: "bi-mortarboard", label: "Gestión de Capacitaciones" },
  ],
  ResponsableCumplimiento: [
    { to: "/auditorias", icon: "bi-clipboard-check", label: "Auditorías Asignadas" },
    { to: "/hallazgos", icon: "bi-exclamation-triangle", label: "Panel de Hallazgos" },
    { to: "/riesgo-humano", icon: "bi-activity", label: "Riesgo Humano" },
  ],
  Colaborador: [
    { to: "/capacitaciones", icon: "bi-mortarboard", label: "Capacitaciones" },
    { to: "/mis-hallazgos", icon: "bi-clipboard-check", label: "Mis Hallazgos Asignados" },
    { to: "/mi-historial", icon: "bi-activity", label: "Mi Historial" },
  ],
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [menuAbierto, setMenuAbierto] = useState(() => window.innerWidth > 768);
  const [esMobile, setEsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const alRedimensionar = () => setEsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", alRedimensionar);
    return () => window.removeEventListener("resize", alRedimensionar);
  }, []);

  const items = NAV_BY_ROLE[usuario?.rol] ?? [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClickNav = () => {
    if (esMobile) setMenuAbierto(false);
  };

  return (
    <div className="rt-app-shell">
      <div
        className={`rt-sidebar-backdrop ${esMobile && menuAbierto ? "rt-backdrop-visible" : ""}`}
        onClick={() => setMenuAbierto(false)}
      ></div>

      <aside className={`rt-sidebar ${menuAbierto ? "rt-sidebar-expanded" : "rt-sidebar-collapsed"}`}>
        <div className="d-flex align-items-center gap-2 mb-4 px-1" style={{ minHeight: 32 }}>
          <img src={menuAbierto ? logoMedium : logoIcon} alt="ReguTech" style={{ height: 26 }} />
        </div>
        <nav className="d-flex flex-column gap-1 flex-grow-1" style={{ overflowY: "auto" }}>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleClickNav}
              title={item.label}
              className={`rt-nav-item text-decoration-none d-flex align-items-center gap-2 ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span className="small rt-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 justify-content-center mt-3"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span className="rt-nav-label">Cerrar sesión</span>
        </button>
      </aside>

      <div className="rt-main">
        <header
          className="d-flex align-items-center justify-content-between px-3 px-md-4"
          style={{ height: 64, borderBottom: "1px solid var(--rt-border)", position: "sticky", top: 0, background: "var(--rt-bg)", zIndex: 10 }}
        >
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34 }}
              onClick={() => setMenuAbierto((v) => !v)}
              title="Mostrar/ocultar menú"
            >
              <i className="bi bi-list"></i>
            </button>
            <div>
              <div className="fw-medium small">{usuario?.nombre}</div>
              <div className="rt-muted" style={{ fontSize: "0.7rem" }}>{usuario?.rol}</div>
            </div>
          </div>
          <span className="rt-badge rt-badge-baja d-none d-sm-inline-block">
            <i className="bi bi-check-circle me-1"></i>Certificado vigente
          </span>
        </header>

        <div className="rt-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
