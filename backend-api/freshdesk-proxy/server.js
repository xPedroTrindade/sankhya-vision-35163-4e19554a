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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MODE = process.env.MODE || "mock"; // mock = Lovable | real = local/produção
const isMock = MODE === "mock";

console.log(
  `🔧 Modo atual do backend: ${MODE.toUpperCase()} ${
    isMock ? "(Lovable / Mock)" : "(Local / Real)"
  }`
);

// ==================== UTILITÁRIOS ====================
function safeReadJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`⚠️ Erro ao ler ${filePath}: ${err.message}`);
  }
  return fallback;
}

function runScript(command) {
  if (isMock) {
    return {
      success: true,
      mock: true,
      output: "Modo MOCK — script não executado."
    };
  }

  console.log(`⚙️ Executando comando: ${command}`);
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe" });
    return { success: true, output };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== ROTAS PÚBLICAS ====================

// Status
app.get("/", (req, res) => {
  res.json({
    status: "✅ Backend operacional",
    mode: MODE,
    endpoints: {
      tickets: "/api/tickets",
      companies: "/api/companies",
      tenants: "/api/tenants",
      update: "/api/update/:empresa",
    },
  });
});

// Tickets simplificados
app.get("/api/tickets", (req, res) => {
  const file = isMock
    ? "./mock/tickets.json"
    : "./data/processed/tickets_simplificado.json";

  const tickets = safeReadJSON(file);
  res.json(tickets);
});

// Empresas
app.get("/api/companies", (req, res) => {
  const file = isMock
    ? "./mock/companies.json"
    : "./data/processed/companies.json";

  const companies = safeReadJSON(file);
  res.json(companies);
});

// Groups (company_and_requesters)
app.get("/api/groups", (req, res) => {
  const file = isMock
    ? "./mock/companies.json" // no mock, devolvemos algo representativo
    : "./data/processed/company_and_requesters.json";

  const groups = safeReadJSON(file);
  res.json(groups);
});

// Tenants
app.get("/api/tenants", (req, res) => {
  if (isMock) {
    const tenants = safeReadJSON("./mock/tenants.json", []);
    return res.json(tenants);
  }

  const dir = "./data/tenants";
  if (!fs.existsSync(dir)) return res.json([]);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  res.json(files.map((f) => f.replace(".json", "")));
});

// Dados de tenant específico
app.get("/api/tenant/:nome", (req, res) => {
  const nome = req.params.nome;

  const file = isMock
    ? "./mock/tickets.json"
    : path.join("./data/tenants", `${nome}.json`);

  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "Tenant não encontrado" });
  }

  const data = safeReadJSON(file);
  res.json(data);
});

// Atualização incremental
app.post("/api/update/:empresa", (req, res) => {
  const empresa = req.params.empresa.toLowerCase();
  const result = runScript(`node src/core/updateTickets.js ${empresa}`);

  if (result.success) {
    res.json({ ok: true, log: result.output });
  } else {
    res.status(500).json({ ok: false, error: result.error });
  }
});

// Reprocessar pipeline completo
app.post("/api/rebuild", (req, res) => {
  if (isMock) {
    return res.json({
      ok: true,
      mock: true,
      message: "Modo MOCK — rebuild desabilitado.",
    });
  }

  try {
    runScript("node src/core/transformTickets.js");
    runScript("node src/core/companyAndRequest.js");
    runScript("node src/core/splitTicketsByCompany.js");

    res.json({ ok: true, message: "Pipeline reprocessado com sucesso" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Backend ativo em http://localhost:${PORT}`);
  console.log(`💡 Modo atual: ${MODE.toUpperCase()}`);
});
