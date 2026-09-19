const cron = require("node-cron");

/**
 * Ping externo al health check.
 * En Render free el proceso se apaga si no hay tráfico HTTP entrante;
 * este cron solo ayuda mientras la instancia esté despierta.
 * El keep-alive real debe ser externo (GitHub Actions / cron-job.org).
 */
function startKeepAlive() {
  const baseUrl = (
    process.env.KEEP_ALIVE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    ""
  ).replace(/\/$/, "");

  if (!baseUrl) {
    console.log(
      "[keep-alive] Desactivado: define KEEP_ALIVE_URL o espera RENDER_EXTERNAL_URL"
    );
    return;
  }

  const healthUrl = `${baseUrl}/health`;
  const schedule = process.env.KEEP_ALIVE_CRON || "*/10 * * * *";

  if (!cron.validate(schedule)) {
    console.error(`[keep-alive] Cron inválido: ${schedule}`);
    return;
  }

  console.log(`[keep-alive] Programado (${schedule}) → ${healthUrl}`);

  cron.schedule(schedule, async () => {
    try {
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: { "User-Agent": "semillero-keep-alive" },
      });
      console.log(`[keep-alive] ${res.status} ${healthUrl}`);
    } catch (err) {
      console.error(`[keep-alive] Falló: ${err.message}`);
    }
  });
}

module.exports = { startKeepAlive };
