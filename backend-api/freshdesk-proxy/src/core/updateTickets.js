/********************************************************************************************
 * UPDATE TICKETS (INCREMENTAL POR EMPRESA OU GRUPO UNIFICADO)
 * -----------------------------------------------------------------------------------------
 *  🔹 Atualiza tickets da Freshdesk modificados recentemente
 *  🔹 Faz merge incremental no tickets_full.json
 *  🔹 Detecta automaticamente se o nome informado pertence a um grupo unificado ou empresa isolada
 *  🔹 Reexecuta pipeline (transform → companyAndRequest → split)
 *
 * Exemplo:
 *   node src/core/updateTickets.js polivisor
 ********************************************************************************************/

import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
dotenv.config();

/* ================== CONFIG ================== */
const DOMAIN = process.env.FRESHDESK_DOMAIN;
const API_KEY = process.env.FRESHDESK_API_KEY;
const DAYS_RANGE = 30; // busca incremental (últimos N dias)
const empresaNomeArg = process.argv[2]?.toLowerCase();

if (!DOMAIN || !API_KEY) {
  console.error("❌ Variáveis .env ausentes (FRESHDESK_DOMAIN / FRESHDESK_API_KEY)");
  process.exit(1);
}
if (!empresaNomeArg) {
  console.error("❌ Informe o nome da empresa (ex: node src/core/updateTickets.js ndbombas)");
  process.exit(1);
}

/* ================== PATHS ================== */
const RAW_DIR = "./data/raw";
const PROCESSED_DIR = "./data/processed";
const OUTPUT_FILE = `${RAW_DIR}/tickets_full.json`;
const UNIFIED_FILE = `${PROCESSED_DIR}/company_and_requesters.json`;
const COMPANIES_FILE = `${PROCESSED_DIR}/companies.json`;
const LOCK_FILE = "./data/sync.lock";
const HISTORY_FILE = "./data/update_history.json";

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(PROCESSED_DIR, { recursive: true });

/* ================== HELPERS ================== */
const authHeader = () => ({
  Authorization: "Basic " + Buffer.from(`${API_KEY}:x`).toString("base64"),
});

function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadJson(p, fallback = {}) {
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    console.warn(`⚠️ Erro ao ler ${p}: ${err.message}`);
    return fallback;
  }
}

/* ================== CONTROLE DE EXECUÇÃO ================== */
if (fs.existsSync(LOCK_FILE)) {
  console.log("⏳ Atualização já em andamento. Aguarde e tente novamente.");
  process.exit(1);
}
fs.writeFileSync(LOCK_FILE, Date.now().toString());

/* ================== IDENTIFICAR EMPRESA/GRUPO ================== */
const unified = loadJson(UNIFIED_FILE, {});
const companies = loadJson(COMPANIES_FILE, []);
const matchUnified = Object.entries(unified).find(([key]) =>
  key.toLowerCase().replace(/\s+/g, "").includes(empresaNomeArg)
);
const matchCompany = companies.find((c) =>
  c.nome.toLowerCase().replace(/\s+/g, "").includes(empresaNomeArg)
);

let empresaNome = null;
let empresaIds = [];

if (matchUnified) {
  // grupo unificado
  empresaNome = matchUnified[0];
  empresaIds = matchUnified[1].ids_unificados || [];
  console.log(`🚀 Atualizando grupo unificado: ${empresaNome}`);
  console.log(`🏢 IDs associados: ${empresaIds.join(", ")}`);
} else if (matchCompany) {
  // empresa isolada
  empresaNome = matchCompany.nome;
  empresaIds = [matchCompany.id];
  console.log(`🚀 Atualizando empresa isolada: ${empresaNome} (ID: ${empresaIds[0]})`);
} else {
  console.error(`❌ Empresa ou grupo '${empresaNomeArg}' não encontrado.`);
  fs.unlinkSync(LOCK_FILE);
  process.exit(1);
}

/* ================== RANGE DE ATUALIZAÇÃO ================== */
const since = new Date(Date.now() - DAYS_RANGE * 24 * 60 * 60 * 1000);
const sinceStr = formatDate(since);

/* ================== FETCH INCREMENTAL ================== */
async function fetchUpdatedTickets() {
  const query = encodeURIComponent(`updated_at:>'${sinceStr}'`);
  let results = [];

  console.log(`🔍 Buscando tickets atualizados desde ${sinceStr}...`);

  for (let page = 1; page <= 15; page++) {
    const url = `https://${DOMAIN}/api/v2/search/tickets?query="${query}"&page=${page}`;
    const resp = await fetch(url, { headers: authHeader() });

    if (resp.status === 429) {
      const retry = Number(resp.headers.get("Retry-After") || "3");
      console.log(`⏳ Rate limit — aguardando ${retry}s...`);
      await new Promise((r) => setTimeout(r, retry * 1000));
      page--;
      continue;
    }

    if (!resp.ok) {
      const err = await resp.text();
      console.error(`❌ Erro na página ${page}: ${err}`);
      break;
    }

    const data = await resp.json();
    if (!data.results?.length) break;

    results.push(...data.results);
    console.log(`📄 Página ${page}: ${data.results.length} tickets`);
  }

  // Filtra apenas os tickets das empresas alvo
  const filtered = results.filter((t) => empresaIds.includes(String(t.company_id)));
  console.log(`🎯 Tickets encontrados para ${empresaNome}: ${filtered.length}`);
  return filtered;
}

/* ================== MERGE INCREMENTAL ================== */
function mergeTickets(newTickets) {
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
  }

  const before = existing.length;
  const byId = new Map(existing.map((t) => [t.id, t]));
  let updatedCount = 0;

  for (const t of newTickets) {
    const exists = byId.has(t.id);
    byId.set(t.id, { ...byId.get(t.id), ...t });
    if (!exists) updatedCount++;
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`💾 Merge concluído:`);
  console.log(`   • Tickets antes: ${before}`);
  console.log(`   • Novos recebidos: ${newTickets.length}`);
  console.log(`   • Total final global: ${merged.length}`);

  return { total: merged.length, updatedCount };
}

/* ================== HISTÓRICO DE EXECUÇÃO ================== */
function updateHistory(count) {
  const history = loadJson(HISTORY_FILE, {});
  history[empresaNome] = {
    ids: empresaIds,
    last_update: new Date().toISOString(),
    tickets_updated: count,
  };
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
  console.log(`🕒 Histórico atualizado: ${HISTORY_FILE}`);
}

/* ================== MAIN ================== */
async function run() {
  const updated = await fetchUpdatedTickets();

  if (!updated.length) {
    console.log(`🚫 Nenhum ticket novo ou alterado para ${empresaNome}.`);
    fs.unlinkSync(LOCK_FILE);
    return;
  }

  const { total, updatedCount } = mergeTickets(updated);
  updateHistory(updatedCount);

  console.log(`🧾 Tickets ${empresaNome}: ${updated.length}`);
  console.log(`📊 Atualizados: ${updatedCount} / Total global: ${total}`);
  console.log(`⚙️ Executando transformações e divisão de tenants...`);

  execSync("node src/core/transformTickets.js", { stdio: "inherit" });
  execSync("node src/core/companyAndRequest.js", { stdio: "inherit" });
  execSync("node src/core/splitTicketsByCompany.js", { stdio: "inherit" });

  console.log(`✅ Atualização concluída para ${empresaNome}.`);
  fs.unlinkSync(LOCK_FILE);
}

run().catch((err) => {
  console.error("❌ Erro geral:", err);
  if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
});
