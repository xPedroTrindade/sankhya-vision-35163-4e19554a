/********************************************************************************************
 * COMPANY & REQUESTERS CONSOLIDATOR (AGRUPA EMPRESAS POR INTERSEÇÃO DE REQUESTERS)
 * -----------------------------------------------------------------------------------------
 * Se o mesmo requester (nome ou e-mail) aparece em múltiplas empresas,
 * elas são unificadas num mesmo grupo (ex: Polivisor + empresa_73001329495).
 *
 * Entradas:
 *   ./data/processed/tickets_simplificado.json
 *   ./data/processed/companies.json
 *   ./requesters_cache.json
 *
 * Saída:
 *   ./data/processed/company_and_requesters.json
 ********************************************************************************************/

import fs from "fs";
import path from "path";

const TICKETS_FILE    = "./data/processed/tickets_simplificado.json";
const COMPANIES_FILE  = "./data/processed/companies.json";
const REQUESTERS_FILE = "./data/cache/requesters_cache.json";
const OUTPUT_DIR      = "./data/processed";
const OUTPUT_FILE     = path.join(OUTPUT_DIR, "company_and_requesters.json");

/* ============ Helpers ============ */
function loadJson(p) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Arquivo não encontrado: ${p}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function normalizeName(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function extractDomain(email) {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1].split(".")[0]?.toLowerCase();
  const generic = new Set(["gmail", "hotmail", "outlook", "yahoo", "icloud", "uol", "terra", "bol", "proton"]);
  return generic.has(domain) ? null : domain;
}

/* ============ Execução ============ */
function run() {
  const tickets = loadJson(TICKETS_FILE);
  const companiesArray = loadJson(COMPANIES_FILE);
  const companies = Array.isArray(companiesArray)
    ? Object.fromEntries(companiesArray.map(c => [String(c.id), c.nome]))
    : companiesArray;
  const requesters = loadJson(REQUESTERS_FILE);

  // Passo 1: montar base empresa_id → requesters
  const base = {};
  for (const [id, nome] of Object.entries(companies)) {
    base[id] = { id, nome, requesters: [] };
  }

  for (const t of tickets) {
    const empresaId = String(t.empresa_id ?? "sem_empresa");
    const requesterId = String(t.requester_id ?? "");
    if (!empresaId || empresaId === "sem_empresa" || !requesterId) continue;

    const req = requesters[requesterId];
    if (!req) continue;
    const name = req.name?.trim();
    const email = req.email?.trim();
    if (!name && !email) continue;

    if (!base[empresaId]) base[empresaId] = { id: empresaId, nome: `empresa_${empresaId}`, requesters: [] };

    const exists = base[empresaId].requesters.some(r => r.email?.toLowerCase() === email?.toLowerCase());
    if (!exists) base[empresaId].requesters.push({ name, email });
  }

  // Passo 2: criar índice reverso (requester → empresas)
  const requesterIndex = {}; // email ou nome normalizado → [empresa_ids]
  for (const [eid, empresa] of Object.entries(base)) {
    for (const r of empresa.requesters) {
      const keyEmail = r.email ? r.email.toLowerCase() : null;
      const keyName = r.name ? normalizeName(r.name) : null;

      if (keyEmail) (requesterIndex[keyEmail] ||= new Set()).add(eid);
      if (keyName) (requesterIndex[keyName] ||= new Set()).add(eid);
    }
  }

  // Passo 3: detectar grupos de empresas interligadas
  const grupos = {}; // chaveGrupo → { ids, nomes, requesters }
  const visited = new Set();

  for (const [eid, empresa] of Object.entries(base)) {
    if (visited.has(eid)) continue;

    // encontrar todas as empresas conectadas a esta via requesters
    const stack = [eid];
    const grupo = new Set();

    while (stack.length > 0) {
      const currentEid = stack.pop();
      if (visited.has(currentEid)) continue;
      visited.add(currentEid);
      grupo.add(currentEid);

      // para cada requester desta empresa, verificar se ele aparece em outra
      const reqs = base[currentEid]?.requesters || [];
      for (const r of reqs) {
        const kEmail = r.email ? r.email.toLowerCase() : null;
        const kName = r.name ? normalizeName(r.name) : null;
        const matches = new Set([
          ...(kEmail ? requesterIndex[kEmail] || [] : []),
          ...(kName ? requesterIndex[kName] || [] : [])
        ]);
        for (const matchId of matches) {
          if (!visited.has(matchId)) stack.push(matchId);
        }
      }
    }

    // decidir nome principal do grupo
    const nomesGrupo = Array.from(grupo).map(id => companies[id] || `empresa_${id}`);
    const nomePrincipal =
      nomesGrupo.find(n => !n.startsWith("empresa_")) ||
      nomesGrupo[0] ||
      `empresa_${Array.from(grupo)[0]}`;

    // coletar todos os requesters únicos
    const reqUnificados = [];
    const seenEmails = new Set();
    for (const id of grupo) {
      for (const r of base[id]?.requesters || []) {
        const key = r.email?.toLowerCase() || r.name;
        if (key && !seenEmails.has(key)) {
          seenEmails.add(key);
          reqUnificados.push(r);
        }
      }
    }

    grupos[nomePrincipal] = {
      ids_unificados: Array.from(grupo),
      nomes_empresas: nomesGrupo,
      requesters: reqUnificados.sort((a, b) => a.name.localeCompare(b.name))
    };
  }

  // Passo 4: salvar resultado
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grupos, null, 2), "utf8");

  console.log(`✅ Unificação concluída!`);
  console.log(`📄 ${OUTPUT_FILE}`);
  console.log(`🏢 Total de grupos: ${Object.keys(grupos).length}`);
}

run();
