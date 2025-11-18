/********************************************************************************************
 * TRANSFORMADOR DE TICKETS FRESHDESK → JSON SIMPLIFICADO (MODELO FINAL)
 * - Lê:  ./data/raw/tickets_full.json
 * - Usa e atualiza: ./data/cache/requesters_cache.json
 * - Grava:
 *     1) ./data/processed/tickets_simplificado.json
 *     2) ./data/processed/companies.json
 *     3) Atualiza corretamente requesters_cache.json dentro de /data/cache/
 ********************************************************************************************/

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

/* ============================= Caminhos ============================= */
const INPUT_FILE        = "./data/raw/tickets_full.json";

const OUTPUT_DIR        = "./data/processed";
const OUTPUT_TICKETS   = `${OUTPUT_DIR}/tickets_simplificado.json`;
const OUTPUT_COMPANIES = `${OUTPUT_DIR}/companies.json`;

const CACHE_DIR         = "./data/cache";
const REQUESTERS_CACHE  = `${CACHE_DIR}/requesters_cache.json`;

/* ============================= Helpers ============================= */
const PORTAL_URL = (process.env.FRESHDESK_PORTAL_URL || "https://sankhyaindaiatuba.freshdesk.com")
  .replace(/\/+$/, "");

function buildTicketLink(id) {
  return id ? `${PORTAL_URL}/support/tickets/${id}` : null;
}

function normalizeText(str) {
  if (!str || typeof str !== "string") return null;
  return str.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim();
}

function safeCustom(fieldset = {}, key) {
  return fieldset?.[key] ?? null;
}

function toTitleCase(str) {
  return String(str || "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

function guessCompanyNameFromEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return null;

  const domain = email.split("@")[1];
  const sld = domain.split(".")[0];

  const generic = new Set([
    "gmail","hotmail","outlook","live","yahoo","bol","icloud","uol","terra","proton","gmx"
  ]);

  if (!sld || generic.has(sld.toLowerCase())) return null;

  return toTitleCase(sld.replace(/\d+/g, ""));
}

function isGenericEmpresaName(nome) {
  return /^empresa[_\s-]/i.test(String(nome || ""));
}

/* ============================= Main ============================= */
function transformarTickets() {

  // ------------------- Garantir arquivos e pastas -------------------
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Arquivo RAW não encontrado: ${INPUT_FILE}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // -------------------- Ler cache existente --------------------
  let requesters =
    fs.existsSync(REQUESTERS_CACHE)
      ? JSON.parse(fs.readFileSync(REQUESTERS_CACHE, "utf8"))
      : {};

  console.log(`📂 Lendo RAW: ${INPUT_FILE}`);
  const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  if (!Array.isArray(rawData)) {
    console.error("❌ Estrutura inválida: esperado array de tickets.");
    process.exit(1);
  }

  console.log(`🔄 Processando ${rawData.length} tickets...`);

  // -------------------- Atualizar cache --------------------
  for (const t of rawData) {
    const rid = String(t.requester_id ?? "");

    if (!rid || rid === "undefined" || rid === "null") continue;

    const nome =
      t.requester_name ??
      t.requester?.name ??
      requesters[rid]?.name ??
      null;

    const email =
      t.requester_email ??
      t.requester?.email ??
      requesters[rid]?.email ??
      null;

    requesters[rid] = { name: nome, email: email };
  }

  // -------------------- Salvar cache atualizado corretamente --------------------
  fs.writeFileSync(REQUESTERS_CACHE, JSON.stringify(requesters, null, 2), "utf8");
  console.log(`💾 Cache atualizado: ${REQUESTERS_CACHE}`);

  // -------------------- Simplificar tickets --------------------
  const simplificados = rawData.map((t) => {
    const rid = String(t.requester_id);
    const req = requesters[rid] || {};
    const cf = t.custom_fields || {};

    return {
      id: t.id ?? null,
      link_ticket: buildTicketLink(t.id),
      assunto: normalizeText(t.subject),
      descricao: normalizeText(t.description_text || t.description),

      status: t.status ?? null,
      prioridade: t.priority ?? null,
      tipo: t.type ?? null,
      empresa_id: t.company_id ?? null,

      requester_id: t.requester_id ?? null,
      nome_solicitante: req.name ?? null,
      email_solicitante: req.email ?? null,

      created_at: t.created_at ?? null,
      updated_at: t.updated_at ?? null,
      due_by: t.due_by ?? null,
      is_escalated: Boolean(t.fr_escalated ?? t.is_escalated),

      tags: Array.isArray(t.tags) ? t.tags : [],
      group_id: t.group_id ?? null,

      modulo: cf.cf_mdulo ?? cf.cf_modulo ?? null,
      processo: cf.cf_processo ?? cf.cf_processo6582 ?? null,
      personalizacao: cf.cf_personalizao ?? cf.cf_personalizacao ?? null,

      custom_fields: {
        cf_mdulo: safeCustom(cf, "cf_mdulo"),
        cf_processo: safeCustom(cf, "cf_processo"),
        cf_processo6582: safeCustom(cf, "cf_processo6582"),
        cf_personalizao: safeCustom(cf, "cf_personalizao"),
      },
    };
  });

  // -------------------- Remover duplicados --------------------
  const seen = new Set();
  const unicos = simplificados.filter((t) => {
    if (!t.id) return false;
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  unicos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  fs.writeFileSync(OUTPUT_TICKETS, JSON.stringify(unicos, null, 2), "utf8");
  console.log(`💾 Gerado: ${OUTPUT_TICKETS}`);

  // -------------------- Gerar companies.json --------------------
  const countByEmpresa = {};
  const currentMap = new Map();

  for (const t of unicos) {
    const eid = t.empresa_id;
    if (!eid) continue;

    countByEmpresa[eid] = (countByEmpresa[eid] || 0) + 1;

    if (!currentMap.has(eid)) {
      const guess = guessCompanyNameFromEmail(t.email_solicitante);
      currentMap.set(eid, guess || `empresa_${eid}`);
    }
  }

  const companiesArr = Array.from(currentMap.entries())
    .map(([id, nome]) => ({
      id: String(id),
      nome: String(nome),
      total_tickets: countByEmpresa[id] || 0,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  fs.writeFileSync(OUTPUT_COMPANIES, JSON.stringify(companiesArr, null, 2), "utf8");
  console.log(`🏢 Companies criadas: ${companiesArr.length}`);
}

transformarTickets();
