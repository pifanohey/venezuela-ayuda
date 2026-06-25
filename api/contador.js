// Contador combinado de personas reportadas / por localizar / localizadas.
// Lee SOLO conteos agregados (no datos personales) de las dos plataformas
// ciudadanas y los suma. Degrada con elegancia si una fuente no responde.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const DESAPARECIDOS_API =
  "https://desaparecidos-terremoto-api.theempire.tech/api/personas?page=1&pageSize=1";
const VENEZUELATEBUSCA_URL = "https://venezuelatebusca.com/";

async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function toInt(v) {
  if (v == null) return null;
  const n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

// Lee el conteo que aparece justo antes de una etiqueta en el HTML.
function numBeforeLabel(text, label) {
  const idx = text.toLowerCase().indexOf(label.toLowerCase());
  if (idx < 0) return null;
  const before = text.slice(Math.max(0, idx - 24), idx);
  const m = before.match(/([\d][\d.,\s]*)\s*$/);
  return m ? toInt(m[1]) : null;
}

async function getDesaparecidos() {
  const r = await fetchWithTimeout(DESAPARECIDOS_API, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!r.ok) throw new Error("http " + r.status);
  const d = await r.json();
  const c = (d && d.counts) || {};
  const reportadas = toInt(c.total);
  const porLocalizar = toInt(c.sinContacto);
  const localizadas = toInt(c.localizado);
  if (reportadas == null) throw new Error("sin counts");
  return { reportadas, porLocalizar, localizadas };
}

async function getVenezuelaTeBusca() {
  const r = await fetchWithTimeout(VENEZUELATEBUSCA_URL, {
    headers: { "User-Agent": UA },
  });
  if (!r.ok) throw new Error("http " + r.status);
  const html = await r.text();
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  const reportadas = numBeforeLabel(text, "Personas registradas");
  const porLocalizar = numBeforeLabel(text, "Por localizar");
  const localizadas = numBeforeLabel(text, "Localizadas");
  if (reportadas == null) throw new Error("parseo falló");
  return { reportadas, porLocalizar, localizadas };
}

async function settle(fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

module.exports = async (req, res) => {
  const [desaparecidos, venezuelatebusca] = await Promise.all([
    settle(getDesaparecidos),
    settle(getVenezuelaTeBusca),
  ]);

  const fuentes = { desaparecidos, venezuelatebusca };
  const okSources = Object.values(fuentes).filter((s) => s.ok);

  const sum = (key) =>
    okSources.reduce((acc, s) => acc + (toInt(s[key]) || 0), 0);

  const combinado =
    okSources.length > 0
      ? {
          reportadas: sum("reportadas"),
          porLocalizar: sum("porLocalizar"),
          localizadas: sum("localizadas"),
        }
      : null;

  // Cache en el CDN de Vercel: 1 lectura por fuente cada ~2 min como máximo.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=600"
  );
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(okSources.length > 0 ? 200 : 503).json({
    combinado,
    fuentes,
    fuentesOk: okSources.length,
    nota:
      "Total combinado de ambas plataformas ciudadanas. Puede incluir a una misma persona reportada en las dos; no es una cifra oficial.",
    actualizado: Date.now(),
  });
};

// Exportado para pruebas locales.
module.exports.getDesaparecidos = getDesaparecidos;
module.exports.getVenezuelaTeBusca = getVenezuelaTeBusca;
