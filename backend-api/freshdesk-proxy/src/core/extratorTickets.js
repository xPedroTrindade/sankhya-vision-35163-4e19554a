/********************************************************************************************
 * EXTRATOR DE TICKETS FRESHDESK (MÊS A MÊS - MAIS RECENTES → MAIS ANTIGOS)
 * -----------------------------------------------------------------------------------------
 * Evita o limite de 10 páginas do /search/tickets iterando por intervalos mensais.
 * Filtra status 2/3/4/5 em memória.
 * Incrementa tickets_full.json sem sobrescrever, elimina duplicados por ID
 * e mantém ordem decrescente por created_at (mais novo → mais antigo).
 * Também enriquece cada ticket com nome e e-mail do solicitante via /contacts/{id}.
 *
 * Estrutura esperada:
 * backend-api/freshdesk-proxy/
 * └── data/
 *     ├── cache/
 *     │   └── requesters_cache.json
 *     └── raw/
 *         └── tickets_full.json
 *
 * Uso:
 *   node src/core/extratorTickets.js
 ********************************************************************************************/

import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

/* ================== RESOLUÇÃO DE PATHS (CRÍTICO) ================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// estamos em src/core → subir dois níveis até freshdesk-proxy
const PROJECT_ROOT = path.resolve(__dirname, "../../");

// diretórios de dados
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const CACHE_DIR = path.join(DATA_DIR, "cache");
const RAW_DIR = path.join(DATA_DIR, "raw");

// arquivos
const REQUESTER_CACHE_FILE = path.join(CACHE_DIR, "requesters_cache.json");
const TICKETS_RAW_FILE = path.join(RAW_DIR, "tickets_full.json");

// garante estrutura
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

/* ================== ENV ================== */
const DOMAIN = process.env.FRESHDESK_DOMAIN;
const API_KEY = process.env.FRESHDESK_API_KEY;
const MAX_MONTHS = Number(process.env.MAX_MONTHS || "36");

if (!DOMAIN || !API_KEY) {
  console.error("❌ Faltam variáveis no .env: FRESHDESK_DOMAIN e/ou FRESHDESK_API_KEY");
  process.exit(1);
}

/* ================== HELPERS ================== */
const authHeader = () => ({
  Authorization: "Basic " + Buffer.from(`${API_KEY}:x`).toString("base64"),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================== DATAS ================== */
function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmtDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function minusOneMonth(dateUTC) {
  const y = dateUTC.getUTCFullYear();
  const m = dateUTC.getUTCMonth();
  const d = new Date(Date.UTC(y, m, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d;
}

/* ================== RANGE AUTOMÁTICO ================== */
const startTop = process.env.FROM_DATE
  ? parseDate(process.env.FROM_DATE)
  : parseDate("2025-12-03");

const stopBottom = process.env.TO_DATE_END
  ? parseDate(process.env.TO_DATE_END)
  : parseDate("2023-01-01");

if (stopBottom >= startTop) {
  console.error("❌ TO_DATE_END deve ser anterior a FROM_DATE.");
  process.exit(1);
}

/* ================== CACHE EM MEMÓRIA ================== */
let cacheTickets = [];
const VALID_STATUSES = new Set([2, 3, 4, 5]);

/* ================== REQUESTER CACHE ================== */
let requesterCache = {};

if (fs.existsSync(REQUESTER_CACHE_FILE)) {
  try {
    requesterCache = JSON.parse(fs.readFileSync(REQUESTER_CACHE_FILE, "utf8"));
  } catch {
    requesterCache = {};
  }
}

async function getRequesterInfo(requesterId) {
  if (!requesterId) return null;
  if (requesterCache[requesterId]) return requesterCache[requesterId];

  const url = `https://${DOMAIN}/api/v2/contacts/${requesterId}`;
  const resp = await fetch(url, { headers: authHeader() });

  if (!resp.ok) {
    console.warn(`⚠️ Falha ao buscar requester ${requesterId}: ${resp.status}`);
    return null;
  }

  const data = await resp.json();
  requesterCache[requesterId] = {
    name: data.name,
    email: data.email,
  };

  fs.writeFileSync(
    REQUESTER_CACHE_FILE,
    JSON.stringify(requesterCache, null, 2),
    "utf8"
  );

  await sleep(150);
  return requesterCache[requesterId];
}

/* ================== UPSERT ================== */
async function upsertTickets(incoming) {
  const filtered = incoming.filter((t) =>
    VALID_STATUSES.has(Number(t.status))
  );

  const byId = new Map(cacheTickets.map((t) => [t.id, t]));

  for (const t of filtered) {
    if (!byId.has(t.id)) {
      const info = await getRequesterInfo(t.requester_id);
      if (info) {
        t.requester_name = info.name;
        t.requester_email = info.email;
      }
      byId.set(t.id, t);
    }
  }

  cacheTickets = Array.from(byId.values());
}

/* ================== MERGE INCREMENTAL ================== */
function mergeWithExisting() {
  let existing = [];

  if (fs.existsSync(TICKETS_RAW_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(TICKETS_RAW_FILE, "utf8"));
      console.log(`📂 tickets_full.json carregado (${existing.length})`);
    } catch {
      console.warn("⚠️ tickets_full.json inválido — será recriado.");
    }
  }

  const combined = [...existing, ...cacheTickets];
  const seen = new Map();

  const merged = combined.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.set(t.id, true);
    return true;
  });

  merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  fs.writeFileSync(
    TICKETS_RAW_FILE,
    JSON.stringify(merged, null, 2),
    "utf8"
  );

  return {
    totalFinal: merged.length,
    duplicatesRemoved: combined.length - merged.length,
  };
}

/* ================== FETCH MENSAL ================== */
async function fetchMonthBlock(upper, lower) {
  const from = fmtDate(upper);
  const to = fmtDate(lower);

  console.log(`🚀 Extraindo ${from} → ${to}`);

  const rawQuery = `created_at:>'${to}' AND created_at:<'${from}'`;
  const query = encodeURIComponent(rawQuery);

  let fetched = 0;

  for (let page = 1; page <= 10; page++) {
    const url = `https://${DOMAIN}/api/v2/search/tickets?query="${query}"&page=${page}`;
    const resp = await fetch(url, { headers: authHeader() });

    if (resp.status === 429) {
      const retry = Number(resp.headers.get("Retry-After") || "2");
      await sleep(retry * 1000);
      page--;
      continue;
    }

    if (!resp.ok) break;

    const data = await resp.json();
    if (!data?.results?.length) break;

    await upsertTickets(data.results);
    fetched += data.results.length;
    await sleep(300);
  }

  const { totalFinal, duplicatesRemoved } = mergeWithExisting();

  console.log(
    `✅ Bloco concluído | novos: ${fetched} | duplicados removidos: ${duplicatesRemoved} | total: ${totalFinal}`
  );

  return fetched;
}

/* ================== LOOP PRINCIPAL ================== */
async function run() {
  let upper = new Date(startTop);
  let months = 0;
  let total = 0;

  while (upper > stopBottom && months < MAX_MONTHS) {
    const lower = minusOneMonth(upper);
    const effectiveLower = lower > stopBottom ? lower : stopBottom;

    const fetched = await fetchMonthBlock(upper, effectiveLower);
    total += fetched;

    upper = effectiveLower;
    months++;
  }

  console.log(`🎉 Extração finalizada | Total retornado pela API: ${total}`);
}

run().catch((err) =>
  console.error("❌ Falha geral na execução:", err)
);
