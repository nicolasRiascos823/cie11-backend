const express = require("express");
const cors = require("cors");
const enfermedadesRouter = require("./routes/enfermedades");
const { startKeepAlive } = require("./keepAlive");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    nombre: "API Enfermedades Laborales CIE-11",
    endpoints: {
      health: "GET /health",
      listar: "GET /api/enfermedades",
      buscar: "GET /api/enfermedades/buscar?q=termino",
      detalle: "GET /api/enfermedades/:idOrCodigo",
    },
  });
});

app.use("/api/enfermedades", enfermedadesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  startKeepAlive();
});
