import xlsx from "xlsx";
import fs from "fs";

const arquivo = "tabela.xlsx";

const workbook = xlsx.readFile(arquivo);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// remove linha de KM
data.shift();

const headers = data[0];
const rows = data.slice(1);

// identifica colunas de horímetro
const horasCols = headers
  .map((h, i) => ({ hora: h, index: i }))
  .filter(col => !isNaN(col.hora));

const resultado = rows.map(row => {

  const item = {
    codigo: row[0],
    grupo: row[1],
    descricao: row[2],
    horas: []
  };

  horasCols.forEach(col => {
    const valor = row[col.index];

    if (valor === "V" || valor === "T") {
      item.horas.push({
        hora: Number(col.hora),
        tipo: valor
      });
    }
  });

  return item;
}).filter(item => item.descricao);

// salva
fs.writeFileSync(
  "plano_manutencao.json",
  JSON.stringify(resultado, null, 2)
);

console.log("✅ JSON completo gerado!");