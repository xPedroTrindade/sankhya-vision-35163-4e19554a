/********************************************************************************************
 * EXTRATOR DE TICKETS FRESHDESK (MÊS A MÊS - MAIS RECENTES → MAIS ANTIGOS)
 * -----------------------------------------------------------------------------------------
 * Evita o limite de 10 páginas do /search/tickets iterando por intervalos mensais.
 * Filtra status 2/3/4/5 em memória.
 * Incrementa tickets_full.json sem sobrescrever, elimina duplicados por ID
 * e mantém ordem decrescente por created_at (mais novo → mais antigo).
 * Também enriquece cada ticket com nome e e-mail do solicitante via /contacts/{id}.
 *
 * Config .env:
 *   FRESHDESK_DOMAIN=sankhyaindaiatuba.freshdesk.com
 *   FRESHDESK_API_KEY=xxxx
 *   FROM_DATE=2025-10-01     # início (ex: mês atual)
 *   TO_DATE_END=2024-01-01   # até onde descer
 *   MAX_MONTHS=36            # segurança
 *
 * Uso:
 *   node extratorTickets.js
 ********************************************************************************************/

import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const DOMAIN = process.env.FRESHDESK_DOMAIN;
const API_KEY = process.env.FRESHDESK_API_KEY;
const MAX_MONTHS = Number(process.env.MAX_MONTHS || "36");

if (!DOMAIN || !API_KEY) {
  console.error("❌ Faltam variáveis no .env: FRESHDESK_DOMAIN e/ou FRESHDESK_API_KEY");
  process.exit(1);
}

const authHeader = () => ({
  Authorization: "Basic " + Buffer.from(`${API_KEY}:x`).toString("base64"),
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================== Datas ================== */
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

/* ================== Config do range automático ================== */
const startTop = process.env.FROM_DATE ? parseDate(process.env.FROM_DATE) : parseDate("2025-11-13");
const stopBottom = process.env.TO_DATE_END ? parseDate(process.env.TO_DATE_END) : parseDate("2023-01-01");

if (!(startTop instanceof Date) || isNaN(startTop)) {
  console.error("❌ FROM_DATE inválido no .env (use yyyy-mm-dd).");
  process.exit(1);
}
if (!(stopBottom instanceof Date) || isNaN(stopBottom)) {
  console.error("❌ TO_DATE_END inválido no .env (use yyyy-mm-dd).");
  process.exit(1);
}
if (stopBottom >= startTop) {
  console.error("❌ TO_DATE_END deve ser anterior a FROM_DATE (descendo no tempo).");
  process.exit(1);
}

/* ================== Estado/Cache ================== */
let cacheTickets = [];
const VALID_STATUSES = new Set([2, 3, 4, 5]); // Aberto, Pendente, Resolvido, Fechado

/* ================== ENRIQUECIMENTO DE REQUESTER ================== */
const REQUESTER_CACHE_FILE = "./requesters_cache.json";
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
  fs.writeFileSync(REQUESTER_CACHE_FILE, JSON.stringify(requesterCache, null, 2));
  await sleep(150); // delay pequeno para evitar rate limit
  return requesterCache[requesterId];
}

/* ================== UP-SERT COM ENRIQUECIMENTO ================== */
async function upsertTickets(incoming) {
  const filtered = incoming.filter((t) => VALID_STATUSES.has(Number(t.status)));
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
  const OUTPUT_DIR = "./data/raw";
  const OUTPUT_FILE = `${OUTPUT_DIR}/tickets_full.json`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let existing = [];

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
      console.log(`📂 tickets_full.json carregado (${existing.length} registros existentes)`);
    } catch {
      console.warn("⚠️ tickets_full.json inválido — será recriado.");
    }
  }

  const before = existing.length;
  const incoming = cacheTickets.length;
  const combined = [...existing, ...cacheTickets];
  const seen = new Map();

  const merged = combined.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.set(t.id, true);
    return true;
  });

  merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const duplicatesRemoved = combined.length - merged.length;
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), "utf8");

  console.log(`💾 ${OUTPUT_FILE} atualizado.`);
  console.log(`📊 Estatísticas do merge:`);
  console.log(`   • Tickets anteriores: ${before}`);
  console.log(`   • Novos recebidos:   ${incoming}`);
  console.log(`   • Duplicados remov.: ${duplicatesRemoved}`);
  console.log(`   • Total final:       ${merged.length}\n`);

  return { totalFinal: merged.length, duplicatesRemoved };
}

/* ================== Busca 1 bloco (um mês) ================== */
async function fetchMonthBlock(upperExclusiveUTC, lowerInclusiveUTC) {
  const to = fmtDate(lowerInclusiveUTC);
  const from = fmtDate(upperExclusiveUTC);
  console.log(`\n🚀 Iniciando extração de ${from} até ${to} (mais recentes primeiro)...`);

  const rawQuery = `created_at:>'${to}' AND created_at:<'${from}'`;
  const query = encodeURIComponent(rawQuery);
  let totalFetched = 0;

  for (let page = 1; page <= 10; page++) {
    const url = `https://${DOMAIN}/api/v2/search/tickets?query="${query}"&page=${page}`;
    const resp = await fetch(url, { headers: authHeader() });

    if (resp.status === 429) {
      const retry = Number(resp.headers.get("Retry-After") || "2");
      console.log(`⏳ Rate limit. Aguardando ${retry}s...`);
      await sleep(retry * 1000);
      page--;
      continue;
    }

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`❌ Erro HTTP ${resp.status} na página ${page}: ${errText}`);
      if (resp.status === 400) console.error(`🔎 Query enviada (raw): ${rawQuery}`);
      break;
    }

    const data = await resp.json();
    if (data?.results?.length) {
      await upsertTickets(data.results);
      totalFetched += data.results.length;
      console.log(`📄 Página ${page}: ${data.results.length} tickets`);
    } else {
      console.log(`🚫 Página ${page} sem resultados — encerrando bloco.`);
      break;
    }

    await sleep(300);
  }

  const { totalFinal, duplicatesRemoved } = mergeWithExisting();
  console.log(`✅ Bloco concluído (+${totalFetched} tickets de ${from} → ${to}).`);
  console.log(`📊 Total processado: ${totalFetched}, duplicados removidos: ${duplicatesRemoved}, total final: ${totalFinal}\n`);
  return totalFetched;
}

/* ================== Loop mês a mês (descendo) ================== */
async function run() {
  let upper = new Date(startTop);
  let months = 0;
  let grandTotal = 0;

  while (upper > stopBottom && months < MAX_MONTHS) {
    const lower = minusOneMonth(upper);
    const effectiveLower = lower > stopBottom ? lower : stopBottom;

    const fetched = await fetchMonthBlock(upper, effectiveLower);
    grandTotal += fetched;

    upper = effectiveLower;
    months++;

    if (fetched === 0 && upper <= stopBottom) break;
  }

  console.log(`\n🎉 Extração finalizada.`);
  console.log(`📦 Total de tickets retornados pela API nesta execução: ${grandTotal}`);
}

run().catch((err) => console.error("❌ Falha geral na execução:", err));
