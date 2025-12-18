import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// === reconstruindo __dirname no ESM ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------- CONFIGURAR AQUI O ARQUIVO QUE QUER PROCESSAR ----------
const arquivoDesejado = "73001334659.json";
// ---------------------------------------------------------------

// Caminho correto: freshdesk-proxy/data/tenants
const basePath = path.join(__dirname, "..", "..", "data", "tenants");

// Caminho completo do arquivo a processar
const filePath = path.join(basePath, arquivoDesejado);

// Verifica se existe antes de ler
if (!fs.existsSync(filePath)) {
  console.error("❌ Arquivo não encontrado:", filePath);
  process.exit(1);
}

// Lê o JSON
const raw = fs.readFileSync(filePath, "utf-8");
const data = JSON.parse(raw);

// Função para obter dia da semana
function getWeekday(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
}

// Processar itens
const resultado = data.map(item => ({
  id: item.id,
  created_at: item.created_at,
  dia_semana: getWeekday(item.created_at)
}));

// Contagem dos dias
const contador = {};
resultado.forEach(r => {
  contador[r.dia_semana] = (contador[r.dia_semana] || 0) + 1;
});

// Arquivo final
const outputPath = path.join(basePath, "analise_dias.json");

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      arquivo_processado: arquivoDesejado,
      total_tickets: resultado.length,
      dias: resultado,
      totais_por_dia: contador
    },
    null,
    2
  ),
  "utf-8"
);

console.log("✅ Análise concluída com sucesso!");
console.log("📄 Arquivo gerado em:", outputPath);
