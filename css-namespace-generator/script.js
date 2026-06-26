/**
 * Custom Namespacing Generator
 * Client-side utility for generating safe, namespaced CSS class structures.
 */

/* ==========================================================================
   Constants & State
   ========================================================================== */

const STORAGE_KEY = 'cng-settings';
const RANDOM_PREFIXES = ['otw', 'mml', 'widgetforge', 'storyplay', 'modular', 'projectx', 'nswrap', 'clayui', 'embedkit', 'framebox'];

const PRESET_LABELS = {
  simple: 'Simple',
  hierarchical: 'Hierarchical',
  bem: 'BEM Style',
  scoped: 'Fully Scoped',
  utility: 'Utility Style',
  custom: 'Custom'
};

const NAMESPACE_ELEMENTS = ['h1', 'h2', 'h3', 'p', 'blockquote', 'a', 'ul', 'li', 'img', 'span'];

/** @type {ReturnType<typeof getFormState>} */
let state = {};

/* ==========================================================================
   DOM References
   ========================================================================== */

const els = {
  prefix: document.getElementById('prefix'),
  template: document.getElementById('template'),
  theme: document.getElementById('theme'),
  component: document.getElementById('component'),
  preset: document.getElementById('preset'),
  customPatterns: document.getElementById('custom-patterns'),
  customRoot: document.getElementById('custom-root'),
  customComponent: document.getElementById('custom-component'),
  customTheme: document.getElementById('custom-theme'),
  batchComponents: document.getElementById('batch-components'),
  collisionCss: document.getElementById('collision-css'),
  collisionResults: document.getElementById('collision-results'),
  conventionsOutput: document.getElementById('conventions-output'),
  htmlOutput: document.querySelector('#html-output code'),
  cssOutput: document.querySelector('#css-output code'),
  namespaceOutput: document.querySelector('#namespace-output code'),
  batchOutput: document.querySelector('#batch-output code'),
  batchSection: document.getElementById('batch-section'),
  livePreview: document.getElementById('live-preview'),
  quickRef: document.getElementById('quick-ref'),
  toast: document.getElementById('toast'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  btnRandomPrefix: document.getElementById('btn-random-prefix'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnImportJson: document.getElementById('btn-import-json'),
  btnExportCss: document.getElementById('btn-export-css'),
  btnExportHtml: document.getElementById('btn-export-html'),
  importFile: document.getElementById('import-file')
};

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/** Convert string to kebab-case slug */
function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Apply placeholder substitution to a pattern string */
function applyPattern(pattern, vars) {
  return pattern
    .replace(/\{prefix\}/g, vars.prefix)
    .replace(/\{template\}/g, vars.template)
    .replace(/\{theme\}/g, vars.theme)
    .replace(/\{component\}/g, vars.component);
}

/** Escape HTML for safe insertion */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Show toast notification */
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

/** Copy text to clipboard */
async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
    if (btn) {
      btn.classList.add('copied');
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = btn.dataset.originalText || 'Copy';
      }, 1500);
    }
  } catch {
    showToast('Copy failed — select text manually');
  }
}

/** Trigger file download */
function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`);
}

/* ==========================================================================
   Naming Convention Generators
   ========================================================================== */

/**
 * Generate class names for a given preset.
 * @returns {{ root: string, component: string|null, theme: string|null, all: string[] }}
 */
function generateForPreset(preset, vars) {
  const { prefix, template, theme, component } = vars;
  const p = slugify(prefix);
  const t = slugify(template);
  const th = slugify(theme);
  const c = slugify(component);

  let root = '';
  let componentClass = null;
  let themeClass = null;
  const all = [];

  switch (preset) {
    case 'simple':
      root = `${p}-${t}`;
      if (c) componentClass = `${p}-${c}`;
      if (th) themeClass = `${p}-${th}`;
      break;

    case 'hierarchical':
      root = `${p}-${t}`;
      if (c) componentClass = `${p}-${t}-${c}`;
      if (th) themeClass = `${p}-${t}-${th}`;
      break;

    case 'bem':
      root = `${p}-${t}`;
      if (c) componentClass = `${p}-${t}__${c}`;
      if (th) themeClass = `${p}-${t}--${th}`;
      break;

    case 'scoped':
      root = `${p}-template`;
      if (t) all.push(`${p}-template--${t}`);
      if (th) {
        themeClass = `${p}-template--${th}`;
        all.push(themeClass);
      }
      if (c) componentClass = `${p}-template__${c}`;
      break;

    case 'utility':
      root = `${p}-root`;
      if (t) all.push(`${p}-${t}`);
      if (c) componentClass = `${p}-c-${c}`;
      if (th) themeClass = `${p}-t-${th}`;
      break;

    case 'custom':
      root = applyPattern(els.customRoot.value, { prefix: p, template: t, theme: th, component: c });
      if (c) componentClass = applyPattern(els.customComponent.value, { prefix: p, template: t, theme: th, component: c });
      if (th) themeClass = applyPattern(els.customTheme.value, { prefix: p, template: t, theme: th, component: c });
      break;
  }

  if (root) all.unshift(root);
  if (componentClass && !all.includes(componentClass)) all.push(componentClass);
  if (themeClass && !all.includes(themeClass)) all.push(themeClass);

  return {
    root,
    component: componentClass,
    theme: themeClass,
    modifiers: preset === 'scoped'
      ? [t && `${p}-template--${t}`, th && `${p}-template--${th}`].filter(Boolean)
      : themeClass ? [themeClass] : [],
    all: [...new Set(all.filter(Boolean))]
  };
}

/** Generate all four standard convention previews */
function generateAllConventions(vars) {
  return ['simple', 'hierarchical', 'bem', 'scoped'].map(preset => ({
    preset,
    label: PRESET_LABELS[preset],
    ...generateForPreset(preset, vars)
  }));
}

/* ==========================================================================
   Output Generators
   ========================================================================== */

/** Build HTML structure from active preset classes */
function generateHtml(vars, classes) {
  const { root, component, modifiers } = classes;
  const rootClasses = [root, ...(modifiers || [])];

  if (vars.preset === 'utility' && vars.template) {
    rootClasses.push(`${slugify(vars.prefix)}-${slugify(vars.template)}`);
  }

  const rootClassStr = [...new Set(rootClasses.filter(Boolean))].join(' ');
  const compClass = component || '';

  if (compClass) {
    return `<div class="${rootClassStr}">
    <div class="${compClass}">
        Content
    </div>
</div>`;
  }

  return `<div class="${rootClassStr}">
    Content
</div>`;
}

/** Build starter CSS from active preset classes */
function generateCss(classes, batchItems, vars) {
  const lines = [];
  const seen = new Set();

  function addRule(className) {
    if (!className || seen.has(className)) return;
    seen.add(className);
    lines.push(`.${className} {\n\n}`);
  }

  addRule(classes.root);
  (classes.modifiers || []).forEach(addRule);
  if (vars.preset === 'utility' && vars.template) {
    addRule(`${slugify(vars.prefix)}-${slugify(vars.template)}`);
  }
  if (classes.component) addRule(classes.component);

  // Batch component rules
  for (const item of batchItems) {
    const batchVars = { ...vars, component: item };
    const batchClasses = generateForPreset(vars.preset, batchVars);
    if (batchClasses.component) addRule(batchClasses.component);
  }

  return lines.join('\n\n');
}

/** Build namespace preview selectors */
function generateNamespacePreview(rootClass) {
  if (!rootClass) return '';
  return NAMESPACE_ELEMENTS.map(el => `.${rootClass} ${el}`).join('\n');
}

/** Build batch output listing */
function generateBatchOutput(vars, batchItems) {
  if (!batchItems.length) return '';

  const lines = [];
  const active = generateForPreset(vars.preset, vars);

  lines.push(`/* Root */`);
  lines.push(`.${active.root}`);
  (active.modifiers || []).forEach(mod => lines.push(`.${mod}`));

  lines.push('');
  lines.push(`/* Components */`);

  for (const item of batchItems) {
    const itemVars = { ...vars, component: item };
    const cls = generateForPreset(vars.preset, itemVars);
    if (cls.component) {
      lines.push(`.${cls.component}`);
    }
  }

  return lines.join('\n');
}

/* ==========================================================================
   Collision Checker
   ========================================================================== */

/** Extract class names from CSS text */
function extractCssClasses(css) {
  const classes = new Set();
  const regex = /\.([a-zA-Z_][\w-]*)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

/** Check if a generated class name may conflict with an existing one */
function classesConflict(generated, existing) {
  if (generated === existing) return true;
  if (generated.endsWith(`-${existing}`) || generated.includes(`-${existing}-`)) return true;
  if (existing.endsWith(`-${generated}`) || existing.includes(`-${generated}-`)) return true;
  const segments = generated.split(/[-_]/);
  return segments.includes(existing);
}

/** Check generated names against pasted CSS */
function checkCollisions(css, generatedNames) {
  if (!css.trim()) {
    els.collisionResults.innerHTML = '';
    return;
  }

  const existing = extractCssClasses(css);
  const conflicts = [];

  for (const name of generatedNames) {
    for (const existingClass of existing) {
      if (classesConflict(name, existingClass)) {
        conflicts.push({ generated: name, existing: existingClass });
      }
    }
  }

  if (conflicts.length === 0) {
    els.collisionResults.innerHTML = '<div class="collision-ok">No conflicts detected. Your namespace looks safe.</div>';
    return;
  }

  const unique = [...new Map(conflicts.map(c => [`${c.generated}:${c.existing}`, c])).values()];
  const items = unique.map(c =>
    `<li>Class name '<strong>${escapeHtml(c.existing)}</strong>' already appears in pasted CSS (related to <code>.${escapeHtml(c.generated)}</code>). Consider using a stronger namespace.</li>`
  ).join('');

  els.collisionResults.innerHTML = `<div class="collision-warn"><strong>${unique.length} potential conflict${unique.length > 1 ? 's' : ''} found</strong><ul>${items}</ul></div>`;
}

/* ==========================================================================
   Live Preview
   ========================================================================== */

function renderLivePreview(vars, classes) {
  const { root, component, modifiers } = classes;
  const rootClasses = [root, ...(modifiers || [])];

  if (vars.preset === 'utility' && vars.template) {
    rootClasses.push(`${slugify(vars.prefix)}-${slugify(vars.template)}`);
  }

  const themeLabel = vars.theme ? slugify(vars.theme) : null;

  let html = `<div class="preview-root ${rootClasses.join(' ')}">`;
  if (themeLabel) {
    html += `<span class="preview-theme-badge">${escapeHtml(themeLabel)} theme</span>`;
  }
  html += `<h3 style="margin:0 0 0.25rem;font-size:1rem;">Sample Heading</h3>`;
  html += `<p style="margin:0;font-size:0.875rem;color:#555;">Preview of your namespaced structure.</p>`;

  if (component) {
    html += `<div class="preview-component ${component}">"Sample quoted content inside the component wrapper."</div>`;
  }

  html += '</div>';
  els.livePreview.innerHTML = html;
}

function renderQuickRef(classes) {
  const entries = [
    ['Root / Block', classes.root],
    ...(classes.modifiers || []).map((mod, i) => [`Modifier ${i + 1}`, mod]),
    ['Component', classes.component]
  ].filter(([, v]) => v);

  els.quickRef.innerHTML = entries.map(([label, value]) =>
    `<dt>${escapeHtml(label)}</dt><dd>.${escapeHtml(value)}</dd>`
  ).join('');
}

/* ==========================================================================
   Form State Management
   ========================================================================== */

function getFormState() {
  return {
    prefix: els.prefix.value,
    template: els.template.value,
    theme: els.theme.value,
    component: els.component.value,
    preset: els.preset.value,
    customRoot: els.customRoot.value,
    customComponent: els.customComponent.value,
    customTheme: els.customTheme.value,
    batchComponents: els.batchComponents.value,
    collisionCss: els.collisionCss.value
  };
}

function getBatchItems() {
  return els.batchComponents.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function applyFormState(data) {
  if (data.prefix != null) els.prefix.value = data.prefix;
  if (data.template != null) els.template.value = data.template;
  if (data.theme != null) els.theme.value = data.theme;
  if (data.component != null) els.component.value = data.component;
  if (data.preset != null) els.preset.value = data.preset;
  if (data.customRoot != null) els.customRoot.value = data.customRoot;
  if (data.customComponent != null) els.customComponent.value = data.customComponent;
  if (data.customTheme != null) els.customTheme.value = data.customTheme;
  if (data.batchComponents != null) {
    els.batchComponents.value = Array.isArray(data.batchComponents)
      ? data.batchComponents.join('\n')
      : data.batchComponents;
  }
  if (data.collisionCss != null) els.collisionCss.value = data.collisionCss;
}

/* ==========================================================================
   localStorage Persistence
   ========================================================================== */

function saveSettings() {
  const data = getFormState();
  const theme = document.documentElement.getAttribute('data-theme');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, theme }));
  } catch {
    /* storage full or unavailable */
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    applyFormState(data);
    if (data.theme) setTheme(data.theme);
  } catch {
    /* corrupt data */
  }
}

/* ==========================================================================
   Theme Toggle
   ========================================================================== */

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  saveSettings();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'light' ? 'dark' : 'light');
}

/* ==========================================================================
   Main Render
   ========================================================================== */

function render() {
  state = getFormState();

  const vars = {
    prefix: state.prefix,
    template: state.template,
    theme: state.theme,
    component: state.component,
    preset: state.preset
  };

  const activeClasses = generateForPreset(state.preset, vars);
  const allConventions = generateAllConventions(vars);
  const batchItems = getBatchItems();

  // Convention comparison grid
  els.conventionsOutput.innerHTML = allConventions.map(conv => {
    const isActive = conv.preset === state.preset;
    const classHtml = conv.all.map(c => `<span class="cls">.${escapeHtml(c)}</span>`).join('<br>');
    return `<div class="convention-group${isActive ? ' active' : ''}">
      <div class="convention-label">${escapeHtml(conv.label)}${isActive ? ' (active)' : ''}</div>
      <div class="convention-classes">${classHtml}</div>
    </div>`;
  }).join('');

  // HTML output
  els.htmlOutput.textContent = generateHtml(vars, activeClasses);

  // CSS output
  els.cssOutput.textContent = generateCss(activeClasses, batchItems, vars);

  // Namespace preview
  els.namespaceOutput.textContent = generateNamespacePreview(activeClasses.root);

  // Batch output
  if (batchItems.length > 0) {
    els.batchSection.classList.remove('hidden');
    els.batchOutput.textContent = generateBatchOutput(vars, batchItems);
  } else {
    els.batchSection.classList.add('hidden');
  }

  // Live preview & quick ref
  renderLivePreview(vars, activeClasses);
  renderQuickRef(activeClasses);

  // Collision check — collect all generated names
  const allGenerated = new Set();
  for (const conv of allConventions) {
    conv.all.forEach(c => allGenerated.add(c));
  }
  for (const item of batchItems) {
    const itemVars = { ...vars, component: item };
    generateForPreset(state.preset, itemVars).all.forEach(c => allGenerated.add(c));
  }
  checkCollisions(state.collisionCss, allGenerated);

  // Custom patterns visibility
  els.customPatterns.classList.toggle('hidden', state.preset !== 'custom');

  saveSettings();
}

/* ==========================================================================
   Export / Import
   ========================================================================== */

function buildExportConfig() {
  const batchItems = getBatchItems();
  return {
    prefix: slugify(state.prefix) || state.prefix,
    template: slugify(state.template) || state.template,
    theme: state.theme ? slugify(state.theme) : '',
    component: state.component ? slugify(state.component) : '',
    preset: state.preset,
    components: batchItems,
    customPatterns: state.preset === 'custom' ? {
      root: state.customRoot,
      component: state.customComponent,
      theme: state.customTheme
    } : undefined
  };
}

function exportJson() {
  const config = buildExportConfig();
  const filename = `${config.prefix || 'namespace'}-config.json`;
  downloadFile(filename, JSON.stringify(config, null, 2), 'application/json');
}

function exportCss() {
  const vars = { ...state, preset: state.preset };
  const classes = generateForPreset(state.preset, vars);
  const batchItems = getBatchItems();
  const css = generateCss(classes, batchItems, vars);
  const filename = `${slugify(state.prefix) || 'namespace'}-styles.css`;
  downloadFile(filename, css, 'text/css');
}

function exportHtml() {
  const vars = { ...state, preset: state.preset };
  const classes = generateForPreset(state.preset, vars);
  let html = generateHtml(vars, classes);

  // Include batch components
  const batchItems = getBatchItems();
  if (batchItems.length > 0) {
    const batchHtml = batchItems.map(item => {
      const itemVars = { ...vars, component: item };
      const itemClasses = generateForPreset(state.preset, itemVars);
      return generateHtml(itemVars, itemClasses);
    }).join('\n\n');
    html = html + '\n\n' + batchHtml;
  }

  const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(slugify(state.template) || 'Component')} Preview</title>
  <link rel="stylesheet" href="${slugify(state.prefix) || 'namespace'}-styles.css">
</head>
<body>
${html.split('\n').map(line => '  ' + line).join('\n')}
</body>
</html>`;

  const filename = `${slugify(state.prefix) || 'namespace'}-template.html`;
  downloadFile(filename, fullDoc, 'text/html');
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      applyFormState({
        prefix: data.prefix || '',
        template: data.template || '',
        theme: data.theme || '',
        component: data.component || '',
        preset: data.preset || 'simple',
        batchComponents: data.components || [],
        customRoot: data.customPatterns?.root,
        customComponent: data.customPatterns?.component,
        customTheme: data.customPatterns?.theme
      });
      render();
      showToast('Configuration imported');
    } catch {
      showToast('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   Event Bindings
   ========================================================================== */

function bindEvents() {
  const inputs = [
    els.prefix, els.template, els.theme, els.component,
    els.preset, els.customRoot, els.customComponent, els.customTheme,
    els.batchComponents, els.collisionCss
  ];

  for (const input of inputs) {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  }

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.dataset.originalText = btn.textContent.trim();
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyTarget;
      const target = document.getElementById(targetId);
      if (!target) return;

      let text;
      if (targetId === 'conventions-output') {
        text = [...target.querySelectorAll('.convention-group.active .cls')]
          .map(el => el.textContent)
          .join('\n');
        if (!text) {
          text = [...target.querySelectorAll('.cls')].map(el => el.textContent).join('\n');
        }
      } else if (target.querySelector('code')) {
        text = target.querySelector('code').textContent;
      } else {
        text = target.textContent;
      }

      copyText(text, btn);
    });
  });

  // Theme toggle
  els.btnThemeToggle.addEventListener('click', toggleTheme);

  // Random prefix
  els.btnRandomPrefix.addEventListener('click', () => {
    const suggestion = RANDOM_PREFIXES[Math.floor(Math.random() * RANDOM_PREFIXES.length)];
    els.prefix.value = suggestion;
    render();
    showToast(`Suggested prefix: ${suggestion}`);
  });

  // Export / Import
  els.btnExportJson.addEventListener('click', exportJson);
  els.btnExportCss.addEventListener('click', exportCss);
  els.btnExportHtml.addEventListener('click', exportHtml);
  els.btnImportJson.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importJson(file);
    e.target.value = '';
  });
}

/* ==========================================================================
   Initialize
   ========================================================================== */

function init() {
  loadSettings();

  // Default demo values if nothing saved
  if (!els.prefix.value) {
    els.prefix.value = 'otw';
    els.template.value = 'argument';
    els.theme.value = 'brutalist';
    els.component.value = 'quote-box';
    els.batchComponents.value = 'quote-box\nauthor\ncitation\nheader\nfooter';
  }

  bindEvents();
  render();
}

init();
