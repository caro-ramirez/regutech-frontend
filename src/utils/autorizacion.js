const pool = require("../config/db");

async function obtenerAuditoriaDeHallazgo(idHallazgo) {
  const r = await pool.query(
    `SELECT a.id_auditoria, a.id_entidad, a.id_responsable
     FROM hallazgo h
     JOIN respuesta_checklist r ON r.id_respuesta = h.id_respuesta
     JOIN auditoria a ON a.id_auditoria = r.id_auditoria
     WHERE h.id_hallazgo = $1`,
    [idHallazgo]
  );
  return r.rows[0];
}

module.exports = { obtenerAuditoriaDeHallazgo };
