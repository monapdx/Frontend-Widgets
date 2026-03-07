function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current);
      if (row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some(cell => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function inferValue(value, emptyAsNull, quoteStrings) {
  const trimmed = value.trim();

  if (trimmed === "" && emptyAsNull) return "NULL";
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toUpperCase();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  if (quoteStrings) return `'${sqlEscape(trimmed)}'`;
  return trimmed;
}

function slugifyColumn(name, index) {
  const cleaned = (name || `column_${index + 1}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || `column_${index + 1}`;
}

const csvInput = document.getElementById("csvInput");
const tableName = document.getElementById("tableName");
const hasHeader = document.getElementById("hasHeader");
const emptyAsNull = document.getElementById("emptyAsNull");
const quoteStrings = document.getElementById("quoteStrings");
const includeCreate = document.getElementById("includeCreate");
const output = document.getElementById("sqlOutput");
const copyBtn = document.getElementById("copySql");
const sampleBtn = document.getElementById("sampleCsv");
const preview = document.getElementById("columnPreview");

function buildSQL() {
  const raw = csvInput.value.trim();
  if (!raw) {
    output.textContent = "";
    preview.innerHTML = '<p class="small">Paste CSV to preview columns.</p>';
    return;
  }

  const rows = parseCSV(raw);
  if (!rows.length) {
    output.textContent = "-- Could not parse CSV.";
    preview.innerHTML = '<p class="small">Could not parse CSV.</p>';
    return;
  }

  const headerEnabled = hasHeader.checked;
  const columns = headerEnabled
    ? rows[0].map((name, i) => slugifyColumn(name, i))
    : rows[0].map((_, i) => `column_${i + 1}`);

  const dataRows = headerEnabled ? rows.slice(1) : rows;

  preview.innerHTML = columns.map(name => `<div class="panelish"><strong>${name}</strong></div>`).join("");

  const insertRows = dataRows.map(row => {
    const values = columns.map((_, i) => inferValue(row[i] ?? "", emptyAsNull.checked, quoteStrings.checked));
    return `(${values.join(", ")})`;
  });

  let sql = "";

  if (includeCreate.checked) {
    const defs = columns.map(col => `  ${col} TEXT`).join(",\n");
    sql += `CREATE TABLE ${tableName.value.trim() || "my_table"} (\n${defs}\n);\n\n`;
  }

  if (insertRows.length) {
    sql += `INSERT INTO ${tableName.value.trim() || "my_table"} (${columns.join(", ")})\nVALUES\n`;
    sql += insertRows.map(row => `  ${row}`).join(",\n");
    sql += ";";
  } else {
    sql += "-- No data rows found.";
  }

  output.textContent = sql;
}

[csvInput, tableName, hasHeader, emptyAsNull, quoteStrings, includeCreate].forEach(el => {
  el.addEventListener("input", buildSQL);
  el.addEventListener("change", buildSQL);
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.textContent).catch(() => {});
});

sampleBtn.addEventListener("click", () => {
  csvInput.value = `id,name,email,is_active\n1,Ash,ash@example.com,true\n2,Mona,mona@example.com,false\n3,Loki,loki@example.com,true`;
  tableName.value = "users";
  hasHeader.checked = true;
  emptyAsNull.checked = true;
  quoteStrings.checked = true;
  includeCreate.checked = false;
  buildSQL();
});

buildSQL();
