/* ui-core/copy.js */
(() => {
  const showFallback = (msg, sub = "") => {
    let el = document.querySelector(".ui-copy-fallback");
    if (!el) {
      el = document.createElement("div");
      el.className = "ui-copy-fallback";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.innerHTML = `<div>${escapeHtml(msg)}</div>${sub ? `<small>${escapeHtml(sub)}</small>` : ""}`;
    el.dataset.open = "true";
    clearTimeout(showFallback._t);
    showFallback._t = setTimeout(() => (el.dataset.open = "false"), 1800);
  };

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getTextFromEl = (el, format) => {
    if (!el) return "";
    if (format === "value" && "value" in el) return el.value ?? "";
    if (format === "textContent") return el.textContent ?? "";
    return el.innerText ?? el.textContent ?? "";
  };

  const writeClipboard = async (text) => {
    // Prefer async clipboard API, fallback to execCommand
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback: temporary textarea
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  };

  async function handleCopyClick(btn) {
    const literal = btn.getAttribute("data-copy-text");
    const selector = btn.getAttribute("data-copy");
    const successMsg = btn.getAttribute("data-copy-success") || "Copied!";
    const subMsg = btn.getAttribute("data-copy-sub") || "";
    const trim = btn.getAttribute("data-copy-trim") === "true";
    const format = btn.getAttribute("data-copy-format") || "innerText";

    let text = "";

    if (literal != null) {
      text = literal;
    } else if (selector) {
      const target = document.querySelector(selector);
      text = getTextFromEl(target, format);
    }

    if (trim) text = text.trim();

    if (!text) {
      if (window.toast?.error) window.toast.error("Nothing to copy");
      else showFallback("Nothing to copy");
      return;
    }

    try {
      await writeClipboard(text);

      // Tiny “copied” animation hint
      btn.dataset.copied = "true";
      clearTimeout(btn._copiedTimer);
      btn._copiedTimer = setTimeout(() => (btn.dataset.copied = "false"), 600);

      if (window.toast?.success) window.toast.success(successMsg, { title: "Copied" });
      else showFallback(successMsg, subMsg);

    } catch (e) {
      if (window.toast?.error) window.toast.error("Copy failed");
      else showFallback("Copy failed", "Your browser blocked clipboard access.");
    }
  }

  function initCopyButtons(root = document) {
    root.querySelectorAll("[data-copy], [data-copy-text]").forEach((btn) => {
      if (btn._copyBound) return;
      btn._copyBound = true;
      btn.addEventListener("click", () => handleCopyClick(btn));
    });
  }

  // Auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCopyButtons());
  } else {
    initCopyButtons();
  }

  window.uiCopy = { initCopyButtons };
})();