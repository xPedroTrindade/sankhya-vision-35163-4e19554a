/********************************************************************************************
 * SERVER.JS — Gateway entre Backend (Freshdesk Proxy) e Frontend (Lovable)
 * -----------------------------------------------------------------------------------------
 *  🔹 MODO REAL → Executa scripts verdadeiros (update, transform, split)
 *  🔹 MODO MOCK → Não executa scripts (usado na LOVABLE)
 *  🔹 Tudo baseado na variável: MODE=mock ou MODE=real
 ********************************************************************************************/

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ==================== BASE DO ARQUIVO ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== ENV (FORÇANDO O .env LOCAL) ====================
dotenv.config({
  path: path.join(__dirname, ".env"),
});

// ==================== APP ====================
const app = express();
app.use(cors());
app.use(express.json());

// ==================== CONFIG ====================
const PORT = Number(process.env.PORT || 4000);

// MODE: só aceita "real", qualquer outra coisa vira mock
const MODE_RAW = String(process.env.MODE || "mock").toLowerCase();
const MODE = MODE_RAW === "real" ? "real" : "mock";
const isMock = MODE === "mock";

// (Opcional) Freshdesk
const FRESHDESK_DOMAIN = process.env.FRESHDESK_DOMAIN;
const FRESHDESK_API_KEY = process.env.FRESHDESK_API_KEY;

// ==================== LOG ====================
console.log(
  `🔧 Modo atual do backend: ${MODE.toUpperCase()} ${
    isMock ? "(Lovable / Mock)" : "(Local / Real)"
  }`
);


// ==================== UTILITÁRIOS ====================

function exists(p) {
  return fs.existsSync(p);
}

function safeReadJSON(filePath, fallback = []) {
  try {
    if (exists(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`⚠️ Erro ao ler ${filePath}: ${err?.message || err}`);
  }
  return fallback;
}

function mustExistOrThrow(filePath, friendlyName) {
  if (!exists(filePath)) {
    const msg = `Arquivo não encontrado (${friendlyName}): ${filePath}`;
    const err = new Error(msg);
    err.code = "FILE_NOT_FOUND";
    throw err;
  }
}

function runScript(command) {
  if (isMock) {
    return {
      success: true,
      mock: true,
      output: "Modo MOCK — script não executado.",
    };
  }

  console.log(`⚙️ Executando comando: ${command}`);
  try {
    // IMPORTANTÍSSIMO: fixa o cwd no diretório do backend
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: __dirname,
    });
    return { success: true, output };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Helper para montar paths sempre corretos
const p = (...parts) => path.join(__dirname, ...parts);

// ==================== ROTAS PÚBLICAS ====================

// Status
app.get("/", (_req, res) => {
  res.json({
    status: "✅ Backend operacional",
    mode: MODE,
    port: PORT,
    freshdesk: {
      domainConfigured: Boolean(FRESHDESK_DOMAIN),
      apiKeyConfigured: Boolean(FRESHDESK_API_KEY),
    },
    endpoints: {
      tickets: "/api/tickets",
      companies: "/api/companies",
      groups: "/api/groups",
      tenants: "/api/tenants",
      tenant: "/api/tenant/:nome",
      update: "/api/update/:empresa",
      rebuild: "/api/rebuild",
    },
  });
});

// Tickets simplificados
app.get("/api/tickets", (_req, res) => {
  const file = isMock
    ? p("mock", "tickets.json")
    : p("data", "processed", "tickets_simplificado.json");

  const tickets = safeReadJSON(file, []);
  res.json(tickets);
});

// Empresas
app.get("/api/companies", (_req, res) => {
  const file = isMock
    ? p("mock", "companies.json")
    : p("data", "processed", "companies.json");

  const companies = safeReadJSON(file, []);
  res.json(companies);
});

// Groups (company_and_requesters)
app.get("/api/groups", (_req, res) => {
  const file = isMock
    ? p("mock", "companies.json")
    : p("data", "processed", "company_and_requesters.json");

  const groups = safeReadJSON(file, []);
  res.json(groups);
});

// Tenants
app.get("/api/tenants", (_req, res) => {
  if (isMock) {
    const tenants = safeReadJSON(p("mock", "tenants.json"), []);
    return res.json(tenants);
  }

  const dir = p("data", "tenants");
  if (!exists(dir)) return res.json([]);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  res.json(files.map((f) => f.replace(".json", "")));
});

// Dados de tenant específico
app.get("/api/tenant/:nome", (req, res) => {
  const nome = req.params.nome;

  const file = isMock
    ? p("mock", "tickets.json")
    : p("data", "tenants", `${nome}.json`);

  if (!exists(file)) {
    return res.status(404).json({ error: "Tenant não encontrado", tenant: nome });
  }

  const data = safeReadJSON(file, []);
  res.json(data);
});

// Atualização incremental
app.post("/api/update/:empresa", (req, res) => {
  const empresa = String(req.params.empresa || "").toLowerCase().trim();
  if (!empresa) return res.status(400).json({ ok: false, error: "Empresa inválida" });

  // valida script existir (evita erro “Cannot find module” no real)
  const script = p("src", "core", "updateTickets.js");
  if (!isMock && !exists(script)) {
    return res.status(500).json({
      ok: false,
      error: "Script do modo REAL não encontrado",
      detail: script,
    });
  }

  const result = runScript(`node src/core/updateTickets.js ${empresa}`);

  if (result.success) {
    res.json({ ok: true, log: result.output });
  } else {
    res.status(500).json({ ok: false, error: result.error });
  }
});

// Reprocessar pipeline completo
app.post("/api/rebuild", (_req, res) => {
  if (isMock) {
    return res.json({
      ok: true,
      mock: true,
      message: "Modo MOCK — rebuild desabilitado.",
    });
  }

  try {
    // valida scripts
    mustExistOrThrow(p("src", "core", "transformTickets.js"), "transformTickets.js");
    mustExistOrThrow(p("src", "core", "companyAndRequest.js"), "companyAndRequest.js");
    mustExistOrThrow(p("src", "core", "splitTicketsByCompany.js"), "splitTicketsByCompany.js");

    const a = runScript("node src/core/transformTickets.js");
    if (!a.success) throw new Error(a.error);

    const b = runScript("node src/core/companyAndRequest.js");
    if (!b.success) throw new Error(b.error);

    const c = runScript("node src/core/splitTicketsByCompany.js");
    if (!c.success) throw new Error(c.error);

    res.json({ ok: true, message: "Pipeline reprocessado com sucesso" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Backend ativo em http://localhost:${PORT}`);
  console.log(`💡 Modo atual: ${MODE.toUpperCase()}`);
});
