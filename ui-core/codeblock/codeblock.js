/* ui-kit/codeblock/codeblock.js */
(() => {
  function initCodeBlocks(root = document) {
    root.querySelectorAll("[data-ui-codeblock]").forEach((wrap) => {
      if (wrap._cbInit) return;
      wrap._cbInit = true;

      const pre = wrap.querySelector("pre");
      const toggle = wrap.querySelector("[data-codeblock-toggle]");
      if (!pre) return;

      // If collapsible, auto-collapse only when content is tall
      const collapsible = wrap.getAttribute("data-collapsible") === "true";
      if (collapsible) {
        // Wait a tick so layout is measured correctly
        requestAnimationFrame(() => {
          const max = parseInt(getComputedStyle(pre).maxHeight || "0", 10) || 240;
          const shouldCollapse = pre.scrollHeight > max + 20;
          wrap.dataset.collapsed = String(shouldCollapse);
          if (toggle) toggle.style.display = shouldCollapse ? "" : "none";
        });
      } else if (toggle) {
        toggle.style.display = "none";
      }

      if (toggle) {
        toggle.addEventListener("click", () => {
          const now = wrap.dataset.collapsed !== "true";
          wrap.dataset.collapsed = String(now);
          toggle.textContent = now ? "Show less" : "Show more";
        });
      }

      // Ensure copy buttons inside codeblocks get bound (if copy.js loaded)
      if (window.uiCopy?.initCopyButtons) window.uiCopy.initCopyButtons(wrap);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCodeBlocks());
  } else {
    initCodeBlocks();
  }

  window.uiCodeBlock = { initCodeBlocks };
})();