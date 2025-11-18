/********************************************************************************************
 * SPLIT TICKETS BY COMPANY (MULTI-TENANT UNIFICADO + NOMES AUTOMÁTICOS)
 * -----------------------------------------------------------------------------------------
 * 1️⃣ Lê tickets_simplificado.json
 * 2️⃣ Lê company_and_requesters.json (empresas unificadas)
 * 3️⃣ Agrupa tickets por empresa real ou grupo
 * 4️⃣ Gera um JSON por empresa em ./data/tenants/
 * 5️⃣ NÃO altera companies.json (mantido pelo transform)
 ********************************************************************************************/

import fs from "fs";
import path from "path";

const INPUT_TICKETS = "./data/processed/tickets_simplificado.json";
const COMPANY_UNIFIED_FILE = "./data/processed/company_and_requesters.json";
const COMPANIES_FILE = "./data/processed/companies.json";
const OUTPUT_DIR = "./data/tenants/";

/* ================== Helpers ================== */
function sanitizeFilename(name) {
  if (!name) return "empresa_desconhecida";
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase()
    .trim();
}

function toTitleCase(str) {
  return String(str || "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

function loadJson(p, allowEmpty = false) {
  if (!fs.existsSync(p)) {
    if (allowEmpty) return [];
    console.error(`❌ Arquivo não encontrado: ${p}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    console.error(`❌ Erro ao ler ${p}:`, err.message);
    process.exit(1);
  }
}

/* ================== Main ================== */
function splitByCompany() {
  console.log("🚀 Iniciando geração de tenants (com nomes automáticos)");

  // 1️⃣ Carregar dados
  const tickets = loadJson(INPUT_TICKETS);
  const unified = loadJson(COMPANY_UNIFIED_FILE, true);
  const companiesBase = loadJson(COMPANIES_FILE, true);

  if (!Array.isArray(tickets)) {
    console.error("❌ Estrutura inválida: esperado array de tickets.");
    process.exit(1);
  }

  // 2️⃣ Mapeia company_id → grupo
  const mapCompanyIdToGroup = {};
  const groupLabels = {}; // nome do grupo → nome do tenant final (arquivo)

  for (const [groupName, info] of Object.entries(unified)) {
    const ids = info.ids_unificados || [];
    const nomes = info.nomes_empresas || [];

    // 🔹 Nome dominante = nome mais longo
    const nomeDominante = nomes.length
      ? nomes.sort((a, b) => b.length - a.length)[0]
      : groupName;

    // 🔹 Se for grupo (mais de 1 empresa) → prefixo grupo_
    const fileBase =
      ids.length > 1
        ? "grupo_" + sanitizeFilename(nomeDominante)
        : sanitizeFilename(nomeDominante);

    groupLabels[groupName] = fileBase;

    for (const id of ids) {
      mapCompanyIdToGroup[String(id)] = groupName;
    }
  }

  // 3️⃣ Agrupar tickets conforme grupo
  const porGrupo = {};
  for (const t of tickets) {
    const empresaId = String(t.empresa_id ?? "sem_empresa");
    const nomeGrupo = mapCompanyIdToGroup[empresaId] || `empresa_${empresaId}`;
    (porGrupo[nomeGrupo] ||= []).push(t);
  }

  // 4️⃣ Garante diretório de saída
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 5️⃣ Cria os tenants
  for (const [nomeGrupo, listaTickets] of Object.entries(porGrupo)) {
    let nomeArquivo = groupLabels[nomeGrupo]; // tenta nome do grupo
    let nomeEmpresa = toTitleCase(nomeGrupo.replace(/^empresa_/, ""));

    if (!nomeArquivo) {
      // fallback: tenta achar no companies.json
      const ref = companiesBase.find(
        (c) =>
          c.id === nomeGrupo ||
          c.nome.toLowerCase() === nomeGrupo.toLowerCase()
      );
      nomeArquivo = ref
        ? sanitizeFilename(ref.nome)
        : sanitizeFilename(nomeEmpresa);
    }

    const destino = path.join(OUTPUT_DIR, `${nomeArquivo}.json`);
    fs.writeFileSync(destino, JSON.stringify(listaTickets, null, 2), "utf8");

    const ehGrupo = nomeArquivo.startsWith("grupo_");
    console.log(
      `💾 ${destino} → ${listaTickets.length} tickets ${
        ehGrupo ? "(grupo unificado)" : ""
      }`
    );
  }

  console.log(`✅ Separação concluída! Tenants criados: ${Object.keys(porGrupo).length}`);
}

splitByCompany();
