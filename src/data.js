const path = require("path");
const fs = require("fs");

const dataPath = path.join(__dirname, "..", "enfermedades-laborales-cie11.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function getAll() {
  return data.enfermedades;
}

function getMeta() {
  return data.meta;
}

function getById(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) return null;
  return data.enfermedades.find((item) => item.id === numericId) || null;
}

function getByCodigo(codigo) {
  if (!codigo) return null;
  const normalized = String(codigo).trim().toLowerCase();
  return (
    data.enfermedades.find(
      (item) => item.codigo_cie11.toLowerCase() === normalized
    ) || null
  );
}

/**
 * Busca coincidencias en nombre, codigo, categoria, agentes, sectores y relacion_laboral.
 * Soporta varios términos separados por espacio (AND).
 */
function search(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return data.enfermedades.filter((item) => {
    const haystack = [
      item.nombre,
      item.codigo_cie11,
      item.categoria,
      item.relacion_laboral,
      ...(item.agentes || []),
      ...(item.sectores || []),
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

module.exports = {
  getAll,
  getMeta,
  getById,
  getByCodigo,
  search,
};
