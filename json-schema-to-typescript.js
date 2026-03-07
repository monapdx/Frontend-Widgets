const schemaFile = document.getElementById("schemaFile");
const inputMode = document.getElementById("inputMode");
const tsOutput = document.getElementById("tsOutput");
const schemaPreview = document.getElementById("schemaPreview");
const sampleBtn = document.getElementById("sampleSchema");
const copyBtn = document.getElementById("copyTs");
const rootName = document.getElementById("rootName");
const useInterface = document.getElementById("useInterface");
const includeComments = document.getElementById("includeComments");
const schemaStatus = document.getElementById("schemaStatus");

let currentSchema = null;

function setStatus(message) {
  schemaStatus.textContent = message;
}

function toPascalCase(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "GeneratedType";
}

function indent(text, level = 1) {
  const pad = "  ".repeat(level);
  return String(text)
    .split("\n")
    .map(line => pad + line)
    .join("\n");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function looksLikeSchema(obj) {
  if (!isPlainObject(obj)) return false;

  return !!(
    obj.type ||
    obj.properties ||
    obj.required ||
    obj.items ||
    obj.enum ||
    obj.anyOf ||
    obj.oneOf ||
    obj.allOf ||
    obj.$schema
  );
}

function uniqueTypes(types) {
  return Array.from(new Set(types.filter(Boolean)));
}

function mergeSchemas(a, b) {
  if (!a) return b;
  if (!b) return a;

  const typeA = a.type;
  const typeB = b.type;

  if (Array.isArray(typeA) || Array.isArray(typeB)) {
    const combined = uniqueTypes([
      ...(Array.isArray(typeA) ? typeA : [typeA]),
      ...(Array.isArray(typeB) ? typeB : [typeB])
    ]);
    return { type: combined.length === 1 ? combined[0] : combined };
  }

  if (typeA !== typeB) {
    const combined = uniqueTypes([typeA, typeB]);
    return { type: combined.length === 1 ? combined[0] : combined };
  }

  if (typeA === "object") {
    const propsA = a.properties || {};
    const propsB = b.properties || {};
    const mergedProps = {};
    const allKeys = new Set([...Object.keys(propsA), ...Object.keys(propsB)]);

    for (const key of allKeys) {
      if (propsA[key] && propsB[key]) {
        mergedProps[key] = mergeSchemas(propsA[key], propsB[key]);
      } else {
        mergedProps[key] = propsA[key] || propsB[key];
      }
    }

    const requiredA = new Set(a.required || []);
    const requiredB = new Set(b.required || []);
    const mergedRequired = [...allKeys].filter(
      key => requiredA.has(key) && requiredB.has(key)
    );

    return {
      type: "object",
      properties: mergedProps,
      required: mergedRequired
    };
  }

  if (typeA === "array") {
    return {
      type: "array",
      items: mergeSchemas(a.items || { type: "any" }, b.items || { type: "any" })
    };
  }

  return a;
}

function inferSchemaFromJson(value) {
  if (value === null) {
    return { type: "null" };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        type: "array",
        items: { type: "any" }
      };
    }

    let mergedItems = inferSchemaFromJson(value[0]);

    for (let i = 1; i < value.length; i++) {
      mergedItems = mergeSchemas(mergedItems, inferSchemaFromJson(value[i]));
    }

    return {
      type: "array",
      items: mergedItems
    };
  }

  if (isPlainObject(value)) {
    const properties = {};
    const required = Object.keys(value);

    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferSchemaFromJson(val);
    }

    return {
      type: "object",
      properties,
      required
    };
  }

  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };

  return { type: "any" };
}

function convertSchema(schema, name) {
  if (!schema || typeof schema !== "object") return "any";

  const schemaType = schema.type;

  if (Array.isArray(schemaType)) {
    return schemaType
      .map(type => convertSchema({ ...schema, type }, name))
      .join(" | ");
  }

  switch (schemaType) {
    case "string":
      if (Array.isArray(schema.enum) && schema.enum.length) {
        return schema.enum.map(item => JSON.stringify(item)).join(" | ");
      }
      return "string";

    case "number":
    case "integer":
      return "number";

    case "boolean":
      return "boolean";

    case "null":
      return "null";

    case "any":
      return "any";

    case "array":
      return `${convertSchema(schema.items || { type: "any" }, `${name}Item`)}[]`;

    case "object": {
      const props = schema.properties || {};
      const required = new Set(schema.required || []);
      const lines = [];

      for (const [key, value] of Object.entries(props)) {
        const optional = required.has(key) ? "" : "?";
        const comment =
          includeComments.checked && value && value.description
            ? `/** ${value.description} */\n`
            : "";

        lines.push(
          `${comment}${JSON.stringify(key)}${optional}: ${convertSchema(value, toPascalCase(key))};`
        );
      }

      if (!lines.length) {
        return "{\n}";
      }

      return `{\n${indent(lines.join("\n"))}\n}`;
    }

    default:
      if (schema.properties) {
        return convertSchema({ ...schema, type: "object" }, name);
      }
      if (schema.items) {
        return convertSchema({ ...schema, type: "array" }, name);
      }
      return "any";
  }
}

function buildTypes() {
  try {
    if (!currentSchema) {
      tsOutput.textContent = "";
      schemaPreview.textContent = "";
      return;
    }

    const schema = currentSchema;
    const typeName = toPascalCase(rootName.value || schema.title || "GeneratedType");
    const body = convertSchema(schema, typeName);
    const canUseInterface = useInterface.checked && schema.type === "object";

    schemaPreview.textContent = JSON.stringify(schema, null, 2);

    if (canUseInterface && body.startsWith("{")) {
      tsOutput.textContent = `export interface ${typeName} ${body}`;
    } else {
      tsOutput.textContent = `export type ${typeName} = ${body};`;
    }
  } catch (error) {
    tsOutput.textContent = `// Could not generate TypeScript\n// ${error.message}`;
    setStatus(`Error while generating TypeScript: ${error.message}`);
  }
}

async function handleFile(file) {
  if (!file) return;

  try {
    setStatus(`Reading ${file.name}...`);

    const text = await file.text();
    const parsed = JSON.parse(text);

    let mode = inputMode.value;

    if (mode === "auto") {
      mode = looksLikeSchema(parsed) ? "schema" : "data";
    }

    if (mode === "schema") {
      currentSchema = parsed;
      setStatus(`${file.name} loaded as JSON Schema.`);
    } else {
      currentSchema = inferSchemaFromJson(parsed);
      setStatus(`${file.name} loaded as JSON data and converted to schema.`);
    }

    buildTypes();
  } catch (error) {
    currentSchema = null;
    schemaPreview.textContent = "";
    tsOutput.textContent = `// Invalid JSON file\n// ${error.message}`;
    setStatus(`Invalid JSON file: ${error.message}`);
  }
}

schemaFile.addEventListener("change", function () {
  const file = schemaFile.files && schemaFile.files[0];
  if (file) {
    handleFile(file);
  }
});

inputMode.addEventListener("change", function () {
  const file = schemaFile.files && schemaFile.files[0];
  if (file) {
    handleFile(file);
  }
});

rootName.addEventListener("input", buildTypes);
useInterface.addEventListener("change", buildTypes);
includeComments.addEventListener("change", buildTypes);

sampleBtn.addEventListener("click", function () {
  const sampleData = {
    id: 123,
    name: "Ash",
    email: "ash@example.com",
    isActive: true,
    tags: ["frontend", "widgets", "typescript"],
    address: {
      city: "Portland",
      state: "OR"
    },
    scores: [10, 20, 30],
    preferences: {
      darkMode: true,
      accent: "#ff009c"
    }
  };

  currentSchema = inferSchemaFromJson(sampleData);
  rootName.value = "UserProfile";
  useInterface.checked = true;
  includeComments.checked = true;
  setStatus("Sample JSON data loaded and converted to schema.");
  buildTypes();
});

copyBtn.addEventListener("click", function () {
  const text = tsOutput.textContent || "";
  navigator.clipboard.writeText(text).catch(() => {});
});