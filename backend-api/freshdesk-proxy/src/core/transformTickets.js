/********************************************************************************************
 * TRANSFORMADOR DE TICKETS FRESHDESK → JSON SIMPLIFICADO (MODELO FINAL)
 * - Lê:
 *     ./data/raw/tickets_full.json
 *     ./data/cache/requesters_cache.json
 *
 * - Grava:
 *     1) ./data/processed/tickets_simplificado.json
 *     2) ./data/processed/companies.json   ← INICIAL (id, nome, total_tickets)
 ********************************************************************************************/

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config();

// ✅ caminhos para a estrutura atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// estamos em src/core → subir dois níveis até freshdesk-proxy
const PROJECT_ROOT = path.resolve(__dirname, "../../");

const INPUT_FILE = path.join(PROJECT_ROOT, "data", "raw", "tickets_full.json");

const OUTPUT_DIR = path.join(PROJECT_ROOT, "data", "processed");
const OUTPUT_TICKETS = path.join(OUTPUT_DIR, "tickets_simplificado.json");
const OUTPUT_COMPANIES = path.join(OUTPUT_DIR, "companies.json");

const CACHE_DIR = path.join(PROJECT_ROOT, "data", "cache");
const REQUESTERS_CACHE = path.join(CACHE_DIR, "requesters_cache.json");

const PORTAL_URL =
  (process.env.FRESHDESK_PORTAL_URL || "https://sankhyaindaiatuba.freshdesk.com")
    .replace(/\/+$/, "");

/* ================== Helpers ================== */
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

/**
 * Tenta inferir o nome da empresa a partir de um e-mail corporativo.
 * Ex.: jhonattas.costa@audacci.com  →  "Audacci"
 */
function guessCompanyNameFromEmail(email) {
  if (!email || typeof email !== "string") return null;

  const parts = email.split("@");
  if (parts.length !== 2) return null;

  const domainRaw = parts[1].toLowerCase();        // audacci.com.br
  const domainParts = domainRaw.split(".");        // ["audacci","com","br"]
  let sld = domainParts[0];                        // "audacci"

  const genericDomains = new Set([
    "gmail", "hotmail", "outlook", "live", "yahoo",
    "bol", "icloud", "uol", "terra", "proton", "gmx"
  ]);

  if (!sld || genericDomains.has(sld)) return null;

  sld = sld.replace(/\d+/g, "");                   // remove números, se houver
  const nome = toTitleCase(sld);

  if (!nome || nome.length < 2) return null;
  return nome;
}

function isGenericEmpresaName(nome) {
  return /^empresa[_\s-]/i.test(String(nome || ""));
}

/* ================== Main ================== */
function transformarTickets() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Arquivo ${INPUT_FILE} não encontrado.`);
    process.exit(1);
  }

  // garante diretórios de saída
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // 🔹 carrega o cache de requesters
  const requesters =
    fs.existsSync(REQUESTERS_CACHE)
      ? JSON.parse(fs.readFileSync(REQUESTERS_CACHE, "utf8"))
      : {};

  console.log(`📂 Lendo ${INPUT_FILE}...`);
  const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  if (!Array.isArray(rawData)) {
    console.error("❌ Estrutura inválida: esperado um array de tickets.");
    process.exit(1);
  }

  console.log(`🔄 Processando ${rawData.length} tickets...`);
  const simplificados = rawData.map((t) => {
    const cf = t.custom_fields || {};
    const requesterInfo = requesters[String(t.requester_id)] || {};

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
      nome_solicitante: requesterInfo.name ?? null,
      email_solicitante: requesterInfo.email ?? null,

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

  // Remove duplicados por id e ordena por created_at desc
  const seen = new Set();
  const unicos = simplificados.filter((t) => {
    if (!t.id) return false;
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
  unicos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // ✅ grava tickets simplificados
  fs.writeFileSync(OUTPUT_TICKETS, JSON.stringify(unicos, null, 2), "utf8");
  console.log(`✅ Transformação concluída!`);
  console.log(`💾 ${unicos.length} tickets simplificados salvos em ${OUTPUT_TICKETS}.`);

  // ================== GERAR companies.json (INICIAL) ==================
  // carrega companies.json existente (se houver) para preservar nomes melhores
  let previousCompanies = {};
  if (fs.existsSync(OUTPUT_COMPANIES)) {
    try {
      const arr = JSON.parse(fs.readFileSync(OUTPUT_COMPANIES, "utf8"));
      if (Array.isArray(arr)) {
        previousCompanies = Object.fromEntries(
          arr.map(c => [String(c.id), String(c.nome)])
        );
      }
    } catch {
      previousCompanies = {};
    }
  }

  // Contagem de tickets por empresa
  const countByEmpresa = {};
  for (const t of unicos) {
    const eid = t.empresa_id;
    if (!eid) continue;
    countByEmpresa[eid] = (countByEmpresa[eid] || 0) + 1;
  }

  // gera mapping atual (empresa_id → nome inferido)
  const currentMap = new Map();
  for (const t of unicos) {
    const eid = t.empresa_id;
    if (!eid || currentMap.has(eid)) continue;

    let guess = null;

    // 1️⃣ tenta pelo requester do cache
    const requester = requesters[String(t.requester_id)];
    if (requester && requester.email) {
      guess = guessCompanyNameFromEmail(requester.email);
    }

    // 2️⃣ fallback pelo próprio campo email_solicitante
    if (!guess && t.email_solicitante) {
      guess = guessCompanyNameFromEmail(t.email_solicitante);
    }

    currentMap.set(eid, guess || `empresa_${eid}`);
  }

  // merge com previousCompanies (preserva e melhora nomes)
  const finalMap = new Map();
  for (const [eid, guessedName] of currentMap.entries()) {
    const prev = previousCompanies[String(eid)];
    if (prev) {
      // se o nome anterior era genérico e o novo é melhor, substitui
      if (isGenericEmpresaName(prev) && !isGenericEmpresaName(guessedName)) {
        finalMap.set(eid, guessedName);
      } else {
        finalMap.set(eid, prev);
      }
    } else {
      finalMap.set(eid, guessedName);
    }
  }

  const companiesArr = Array.from(finalMap.entries())
    .map(([id, nome]) => ({
      id: String(id),
      nome: String(nome),
      total_tickets: countByEmpresa[id] || 0,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  fs.writeFileSync(OUTPUT_COMPANIES, JSON.stringify(companiesArr, null, 2), "utf8");
  console.log(`🏢 ${companiesArr.length} empresas → ${OUTPUT_COMPANIES} (INICIAL, com total_tickets)`);
}

transformarTickets();
