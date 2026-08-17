import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Layout from "./components/layout/Layout";

import DashboardEjecutivo from "./pages/DashboardEjecutivo";
import GestionUsuarios from "./pages/GestionUsuarios";
import SolicitarAuditoria from "./pages/SolicitarAuditoria";
import CumplimientoPanel from "./pages/CumplimientoPanel";
import AuditoriasAsignadas from "./pages/AuditoriasAsignadas";
import ChecklistAuditoria from "./pages/ChecklistAuditoria";
import HallazgosPanel from "./pages/HallazgosPanel";
import DetalleHallazgo from "./pages/DetalleHallazgo";
import RiesgoHumanoPanel from "./pages/RiesgoHumanoPanel";
import DetalleCasoRiesgo from "./pages/DetalleCasoRiesgo";
import CapacitacionesPanel from "./pages/CapacitacionesPanel";
import EvaluacionCapacitacion from "./pages/EvaluacionCapacitacion";
import MiHistorial from "./pages/MiHistorial";
import MisHallazgosAsignados from "./pages/MisHallazgosAsignados";
import BackofficeEntidades from "./pages/BackofficeEntidades";
import BackofficeNormasGlobales from "./pages/BackofficeNormasGlobales";
import ConfiguracionNormativa from "./pages/ConfiguracionNormativa";
import GestionCapacitaciones from "./pages/GestionCapacitaciones";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Administrador */}
            <Route path="dashboard" element={<DashboardEjecutivo />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="auditorias/solicitar" element={<SolicitarAuditoria />} />
            <Route path="cumplimiento" element={<CumplimientoPanel />} />
            <Route path="configuracion" element={<ConfiguracionNormativa />} />
            <Route path="capacitaciones-gestion" element={<GestionCapacitaciones />} />

            {/* Responsable de Cumplimiento */}
            <Route path="auditorias" element={<AuditoriasAsignadas />} />
            <Route path="auditorias/:id/checklist" element={<ChecklistAuditoria />} />
            <Route path="hallazgos" element={<HallazgosPanel />} />
            <Route path="hallazgos/:id" element={<DetalleHallazgo />} />
            <Route path="riesgo-humano" element={<RiesgoHumanoPanel />} />
            <Route path="riesgo-humano/:id" element={<DetalleCasoRiesgo />} />

            {/* Colaborador */}
            <Route path="capacitaciones" element={<CapacitacionesPanel />} />
            <Route path="capacitaciones/:id" element={<EvaluacionCapacitacion />} />
            <Route path="mi-historial" element={<MiHistorial />} />
            <Route path="mis-hallazgos" element={<MisHallazgosAsignados />} />

            {/* Backoffice */}
            <Route path="backoffice/entidades" element={<BackofficeEntidades />} />
            <Route path="backoffice/normas" element={<BackofficeNormasGlobales />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
