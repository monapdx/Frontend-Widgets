# The new CSS foundation

Open `styles/preview.html` to inspect controls, colors, light/dark themes, and keyboard focus. Open `index.html` for the collection.

Every migrated page loads **one entry point**:

```html
<link rel="stylesheet" href="styles/widgets.css">
```

Use `../styles/widgets.css` from a subfolder. When downloading a widget, include the `styles` folder alongside it; opening the HTML directly works without a build step. Do not copy just `widgets.css`: it imports the other CSS files in that folder.

| File | Responsibility |
| --- | --- |
| `styles/widgets.css` | Entry point, cascade order, visibility, reduced motion |
| `styles/tokens.css` | Colors, typography, spacing, borders, shadows, theme aliases |
| `styles/base.css` | Typography, links, native controls, keyboard focus |
| `styles/components.css` | Shared shells, panels, actions, output areas |
| `styles/catalog.css` | Collection index only, scoped to `.catalog` |
| `styles/cookbook.css` | Cookbook-specific layout |

The default accent is `#e69dfc`. Controls use dark text on purple for readability. Dark mode is explicit: add `data-theme="dark"` to `<html>`. Existing `neon-dark` demos remain supported. The foundation does not fetch fonts, images, or scripts.

## Cascade and widget code

The layer order is `reset, layout, widgets, tokens, base, components, artwork, utilities`. Widget-specific CSS is in `@layer widgets`: it retains custom geometry while shared controls and surfaces take precedence. Default workspace geometry is in `layout`, so widget-specific full-width layouts survive. The `artwork` layer is for generated content such as the button generator's live preview, where user-selected styling must win.

```css
@layer widgets {
  .my-tool-workspace { display: grid; gap: 1rem; }
}
```

Use `--fw-*` tokens for new CSS. Existing aliases such as `--bg`, `--ink`, `--accent`, and `--border` keep older component scripts working. Avoid adding another global override sheet. Limit `!important` to accessibility utilities, such as ensuring `[hidden]` stays hidden and honoring reduced motion.

Do not style `.row`, `.grid`, all headers, all footers, or all canvases globally: those names and elements mean different things in different widgets. Scope collection-card styles to `.catalog`. Keep generated markup independent of the editor stylesheet.

## Migration scope

The previous shared skins (`neo-brutal.css`, `neo-brutal-overrides.css`, `styles-vanilla.css`, `cookbook-shared.css`, `signature-dark.css`, and `ui-core/theme.css`) and the unused `rare.css` were removed. Their HTML consumers now use the new foundation, including the duplicate folders and dark collection. The original downloadable ZIP is an unchanged historical artifact.

This is the foundation reset, not a complete redesign of each widget. Widget-specific CSS, output artwork, scripts, and standalone pages that did not use the old shared sheets remain for individual cleanup. Existing specialist component styles (modal, toast, table, etc.) remain separate. Some older widgets have unrelated script or missing-asset issues; those need their own fixes.

## Checks

Run `python scripts/check-styles.py` from the repository root to verify the new import graph, local stylesheet paths on migrated pages, and removal of retired stylesheet references. Serve with `python -m http.server 8765` for browser review. Check the style preview, catalog, table generator, pixel-to-SVG converter, MBOX viewer, and button generator at desktop and mobile widths before merging.

Browser regression checks are in `scripts/smoke-styles.cjs` (requires Playwright and Chromium). Run `node scripts/smoke-styles.cjs`; optionally set `WIDGET_BROWSER_EXECUTABLE` to an existing Chromium binary. External requests are blocked during these checks. They cover theme/focus/visibility, catalog filtering, table editing, button previews, SVG conversion, chat browsing, quiz downloads, MBOX loading, and desktop/mobile page overflow.
