/* ui-kit/tabs-accordion/tabs-accordion.js */
(() => {
  function initTabs(root) {
    const tablist = root.querySelector('[role="tablist"]');
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];

    if (!tablist || !tabs.length || !panels.length) return;

    const activate = (tab) => {
      const targetId = tab.getAttribute("aria-controls");
      tabs.forEach(t => t.setAttribute("aria-selected", String(t === tab)));
      panels.forEach(p => p.dataset.open = String(p.id === targetId));
      tab.focus({ preventScroll: true });
    };

    tabs.forEach(tab => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === "ArrowRight") { e.preventDefault(); activate(tabs[(i + 1) % tabs.length]); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); activate(tabs[(i - 1 + tabs.length) % tabs.length]); }
        if (e.key === "Home")       { e.preventDefault(); activate(tabs[0]); }
        if (e.key === "End")        { e.preventDefault(); activate(tabs[tabs.length - 1]); }
      });
    });

    // default: first selected, else first tab
    const pre = tabs.find(t => t.getAttribute("aria-selected") === "true") || tabs[0];
    activate(pre);
  }

  function initAccordion(root) {
    const items = [...root.querySelectorAll(".ui-acc-item")];
    if (!items.length) return;

    items.forEach(item => {
      const btn = item.querySelector(".ui-acc-btn");
      const panel = item.querySelector(".ui-acc-panel");
      if (!btn || !panel) return;

      const setOpen = (open) => {
        btn.setAttribute("aria-expanded", String(open));
        panel.dataset.open = String(open);
      };

      // If author set aria-expanded="true", respect it
      const initial = btn.getAttribute("aria-expanded") === "true";
      setOpen(initial);

      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        // optional: if you want "only one open at a time", close others:
        if (root.hasAttribute("data-single")) {
          items.forEach(it => {
            const b = it.querySelector(".ui-acc-btn");
            const p = it.querySelector(".ui-acc-panel");
            if (b && p) { b.setAttribute("aria-expanded", "false"); p.dataset.open = "false"; }
          });
        }
        setOpen(open);
      });
    });
  }

  function initAll() {
    document.querySelectorAll("[data-ui-tabs]").forEach(initTabs);
    document.querySelectorAll("[data-ui-accordion]").forEach(initAccordion);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.uiKit = { initAll };
})();