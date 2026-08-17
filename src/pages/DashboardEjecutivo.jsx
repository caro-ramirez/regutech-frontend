import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";
import { COLOR_SEVERIDAD } from "../utils/severidad";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#17223a",
  border: "1px solid #2a3648",
  borderRadius: 10,
  fontSize: 12,
  color: "#e6eaf0",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
};

const COLOR_AREA = ["#35c3d6", "#F9C835", "#7c5cd6", "#E3703D", "#88B747"];

function colorPorPorcentaje(pct) {
  if (pct >= 90) return "#88B747";
  if (pct >= 60) return "#F9C835";
  return "#D8413C";
}

function TarjetaIndicador({ icono, label, valor, color }) {
  return (
    <div className="rt-panel p-3 h-100 rt-card-hover d-flex align-items-center gap-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-3"
        style={{ width: 44, height: 44, background: `${color}22`, border: `1px solid ${color}55`, flexShrink: 0 }}
      >
        <i className={`bi ${icono}`} style={{ color, fontSize: "1.2rem" }}></i>
      </div>
      <div>
        <div className="rt-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.03em" }}>{label}</div>
        <div className="fs-4 fw-semibold" style={{ color }}>{valor}</div>
      </div>
    </div>
  );
}

export default function DashboardEjecutivo() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  if (!data) {
    return <div className="rt-panel p-4">{error || "Cargando..."}</div>;
  }

  const areas = data.riesgoPorArea.map((a) => a.area);

  return (
    <div className="d-flex flex-column gap-3">
      <h1 className="fs-5 fw-semibold mb-0">Dashboard Ejecutivo</h1>

      <div className="row g-3">
        <div className="col-xl-3 col-md-6">
          <TarjetaIndicador icono="bi-patch-check" label="CERTIFICADOS VIGENTES" valor={data.certificadosVigentes} color="#35c3d6" />
        </div>
        <div className="col-xl-3 col-md-6">
          <TarjetaIndicador icono="bi-patch-exclamation" label="CERTIFICADOS VENCIDOS" valor={data.certificadosVencidos} color="#D8413C" />
        </div>
        <div className="col-xl-3 col-md-6">
          <TarjetaIndicador icono="bi-exclamation-triangle" label="HALLAZGOS ABIERTOS" valor={data.hallazgosAbiertos} color="#E3703D" />
        </div>
        <div className="col-xl-3 col-md-6">
          <TarjetaIndicador icono="bi-activity" label="CASOS DE RIESGO PRIORIZADOS" valor={data.casosPriorizados} color="#F9C835" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="rt-panel p-4 h-100">
            <div className="rt-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>HALLAZGOS POR SEVERIDAD</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.hallazgosPorSeveridad}
                  dataKey="cantidad"
                  nameKey="severidad"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data.hallazgosPorSeveridad.map((s) => (
                    <Cell key={s.severidad} fill={COLOR_SEVERIDAD[s.severidad]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8b96a8" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="rt-panel p-4 h-100">
            <div className="rt-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>CUMPLIMIENTO POR NORMA</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.cumplimientoPorNorma} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3648" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} />
                <YAxis tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="porcentaje_cumplimiento" radius={[6, 6, 0, 0]}>
                  {data.cumplimientoPorNorma.map((n, i) => (
                    <Cell key={i} fill={colorPorPorcentaje(Number(n.porcentaje_cumplimiento))} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rt-panel p-4">
        <div className="rt-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>EVOLUCIÓN DEL RIESGO HUMANO POR ÁREA</div>
        {data.historicoRiesgoPorArea.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.historicoRiesgoPorArea}>
              <defs>
                {areas.map((area, i) => (
                  <linearGradient key={area} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLOR_AREA[i % COLOR_AREA.length]} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={COLOR_AREA[i % COLOR_AREA.length]} stopOpacity={0.5} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3648" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} />
              <YAxis tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#8b96a8" }} iconType="circle" />
              {areas.map((area, i) => (
                <Line
                  key={area}
                  type="monotone"
                  dataKey={area}
                  stroke={`url(#grad-${i})`}
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 0, fill: COLOR_AREA[i % COLOR_AREA.length] }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="rt-muted small mb-0">Todavía no hay suficiente histórico registrado.</p>
        )}
      </div>

      <div className="rt-panel p-4">
        <div className="rt-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>ALERTAS ACTIVAS</div>
        <div className="d-flex flex-column gap-2">
          {data.alertas.map((a, i) => (
            a.idHallazgo ? (
              <Link key={i} to={`/hallazgos/${a.idHallazgo}`} className="d-flex justify-content-between align-items-center small py-2 px-2 rounded-3 text-decoration-none rt-card-hover" style={{ color: "var(--rt-text)", border: "1px solid var(--rt-border)" }}>
                <span><i className="bi bi-arrow-right-short me-1"></i>{a.descripcion}</span>
                <span className="rt-badge rt-badge-alta">{a.categoria}</span>
              </Link>
            ) : (
              <div key={i} className="d-flex justify-content-between align-items-center small py-2 px-2 rounded-3" style={{ border: "1px solid var(--rt-border)" }}>
                <span>{a.descripcion}</span>
                <span className="rt-badge rt-badge-alta">{a.categoria}</span>
              </div>
            )
          ))}
          {data.alertas.length === 0 && <p className="rt-muted small mb-0">No hay alertas activas.</p>}
        </div>
      </div>
    </div>
  );
}
