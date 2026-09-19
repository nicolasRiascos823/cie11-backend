const { Router } = require("express");
const { getAll, getMeta, getById, getByCodigo, search } = require("../data");

const router = Router();

/**
 * GET /api/enfermedades
 * Lista todas las enfermedades laborales.
 */
router.get("/", (_req, res) => {
  const enfermedades = getAll();
  res.json({
    meta: getMeta(),
    total: enfermedades.length,
    data: enfermedades,
  });
});

/**
 * GET /api/enfermedades/buscar?q=termino
 * Filtra por coincidencias en nombre, código, categoría, agentes, sectores, etc.
 * Query params opcionales:
 *   - q / query / coincidencia: texto a buscar
 *   - categoria: filtro exacto por categoría
 *   - sector: coincidencia parcial en sectores
 *   - agente: coincidencia parcial en agentes
 */
router.get("/buscar", (req, res) => {
  const q = req.query.q || req.query.query || req.query.coincidencia || "";
  const { categoria, sector, agente } = req.query;

  if (!q && !categoria && !sector && !agente) {
    return res.status(400).json({
      error: "Debes enviar al menos un parámetro de búsqueda",
      ejemplos: {
        texto: "/api/enfermedades/buscar?q=silicosis",
        categoria: "/api/enfermedades/buscar?categoria=Respiratoria",
        combinado: "/api/enfermedades/buscar?q=polvo&sector=minería",
      },
    });
  }

  let resultados = q ? search(q) : getAll();

  if (categoria) {
    const cat = String(categoria).toLowerCase();
    resultados = resultados.filter(
      (item) => item.categoria.toLowerCase() === cat
    );
  }

  if (sector) {
    const s = String(sector).toLowerCase();
    resultados = resultados.filter((item) =>
      (item.sectores || []).some((sec) => sec.toLowerCase().includes(s))
    );
  }

  if (agente) {
    const a = String(agente).toLowerCase();
    resultados = resultados.filter((item) =>
      (item.agentes || []).some((ag) => ag.toLowerCase().includes(a))
    );
  }

  res.json({
    query: { q: q || null, categoria: categoria || null, sector: sector || null, agente: agente || null },
    total: resultados.length,
    data: resultados,
  });
});

/**
 * GET /api/enfermedades/:idOrCodigo
 * Consulta una enfermedad por id numérico o por código CIE-11.
 * Ejemplos: /api/enfermedades/1  |  /api/enfermedades/CA60.0
 */
router.get("/:idOrCodigo", (req, res) => {
  const { idOrCodigo } = req.params;

  const enfermedad =
    getById(idOrCodigo) || getByCodigo(idOrCodigo);

  if (!enfermedad) {
    return res.status(404).json({
      error: "Enfermedad no encontrada",
      buscado: idOrCodigo,
    });
  }

  res.json({ data: enfermedad });
});

module.exports = router;
