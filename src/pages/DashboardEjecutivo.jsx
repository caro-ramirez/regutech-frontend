import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from "recharts";

const COLOR_SEVERIDAD = { Alta: "#ef4444", Media: "#f59e0b", Baja: "#2dd4bf" };
const COLOR_AREA = ["#2dd4bf", "#f59e0b", "#818cf8", "#f472b6", "#38bdf8"];

const tooltipStyle = {
  backgroundColor: "#121b2e",
  border: "1px solid #2a3648",
  borderRadius: 8,
  fontSize: 12,
  color: "#e6eaf0",
};

function colorPorPorcentaje(pct) {
  if (pct >= 90) return "#2dd4bf";
  if (pct >= 60) return "#f59e0b";
  return "#ef4444";
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
    <div className="d-flex flex-column gap-3" style={{ maxWidth: 760 }}>
      <h1 className="fs-5 fw-semibold mb-0">Dashboard Ejecutivo</h1>

      <div className="row g-3">
        <div className="col-6">
          <div className="rt-panel p-3 h-100">
            <div className="rt-muted" style={{ fontSize: "0.7rem" }}>CERTIFICADOS VIGENTES</div>
            <div className="fs-3 fw-semibold mt-1">{data.certificadosVigentes}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="rt-panel p-3 h-100">
            <div className="rt-muted" style={{ fontSize: "0.7rem" }}>CERTIFICADOS VENCIDOS</div>
            <div className="fs-3 fw-semibold mt-1" style={{ color: "var(--rt-critical)" }}>{data.certificadosVencidos}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="rt-panel p-3 h-100">
            <div className="rt-muted" style={{ fontSize: "0.7rem" }}>HALLAZGOS ABIERTOS</div>
            <div className="fs-3 fw-semibold mt-1">{data.hallazgosAbiertos}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="rt-panel p-3 h-100">
            <div className="rt-muted" style={{ fontSize: "0.7rem" }}>CASOS DE RIESGO PRIORIZADOS</div>
            <div className="fs-3 fw-semibold mt-1" style={{ color: "var(--rt-warning)" }}>{data.casosPriorizados}</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-6">
          <div className="rt-panel p-4 h-100">
            <div className="rt-muted mb-2" style={{ fontSize: "0.75rem" }}>HALLAZGOS POR SEVERIDAD</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.hallazgosPorSeveridad}
                  dataKey="cantidad"
                  nameKey="severidad"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.hallazgosPorSeveridad.map((s) => (
                    <Cell key={s.severidad} fill={COLOR_SEVERIDAD[s.severidad]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8b96a8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-6">
          <div className="rt-panel p-4 h-100">
            <div className="rt-muted mb-2" style={{ fontSize: "0.75rem" }}>CUMPLIMIENTO POR NORMA</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.cumplimientoPorNorma}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3648" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} />
                <YAxis tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="porcentaje_cumplimiento" radius={[4, 4, 0, 0]}>
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
        <div className="rt-muted mb-2" style={{ fontSize: "0.75rem" }}>EVOLUCIÓN DEL RIESGO HUMANO POR ÁREA</div>
        {data.historicoRiesgoPorArea.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.historicoRiesgoPorArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3648" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} />
              <YAxis tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "#2a3648" }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#8b96a8" }} />
              {areas.map((area, i) => (
                <Line
                  key={area}
                  type="monotone"
                  dataKey={area}
                  stroke={COLOR_AREA[i % COLOR_AREA.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
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
        <div className="rt-muted mb-3" style={{ fontSize: "0.75rem" }}>ALERTAS ACTIVAS</div>
        <div className="d-flex flex-column gap-2">
          {data.alertas.map((a, i) => (
            a.idHallazgo ? (
              <Link key={i} to={`/hallazgos/${a.idHallazgo}`} className="d-flex justify-content-between small py-1 text-decoration-none" style={{ color: "var(--rt-text)" }}>
                <span>{a.descripcion}</span>
                <span className="rt-badge rt-badge-alta">{a.categoria}</span>
              </Link>
            ) : (
              <div key={i} className="d-flex justify-content-between small py-1">
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
