/* ui-enhancers/modal-drawer/modal.js */
(() => {
  let lastFocus = null;

  const trapFocus = (container, e) => {
    if (e.key !== "Tab") return;
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const makeOverlay = () => {
    const overlay = document.createElement("div");
    overlay.className = "ui-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="ui-modal" role="document">
        <header>
          <h3 class="ui-title">Modal</h3>
          <button class="ui-close" type="button" aria-label="Close">Close</button>
        </header>
        <div class="body"></div>
        <div class="footer"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  };

  const ensure = () => {
    let overlay = document.querySelector(".ui-overlay");
    if (!overlay) overlay = makeOverlay();
    return overlay;
  };

  const openModal = ({ title = "Modal", content = "", footer = null, onClose = null } = {}) => {
    const overlay = ensure();
    lastFocus = document.activeElement;

    const modal = overlay.querySelector(".ui-modal");
    overlay.querySelector(".ui-title").textContent = title;

    const body = overlay.querySelector(".body");
    body.innerHTML = typeof content === "string" ? content : "";
    if (content instanceof Node) {
      body.innerHTML = "";
      body.appendChild(content);
    }

    const foot = overlay.querySelector(".footer");
    foot.innerHTML = "";
    if (footer === null) {
      // default: just Close
      const closeBtn = document.createElement("button");
      closeBtn.className = "ui-btn";
      closeBtn.textContent = "Close";
      closeBtn.type = "button";
      closeBtn.addEventListener("click", () => close());
      foot.appendChild(closeBtn);
    } else if (footer instanceof Node) {
      foot.appendChild(footer);
    } else if (typeof footer === "string") {
      foot.innerHTML = footer;
    }

    const close = () => {
      overlay.dataset.open = "false";
      overlay.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKeydown);
      overlay.removeEventListener("keydown", onTrap);

      if (typeof onClose === "function") onClose();
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const onOverlayClick = (e) => {
      if (e.target === overlay) close();
    };

    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };

    const onTrap = (e) => trapFocus(modal, e);

    overlay.dataset.open = "true";
    overlay.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeydown);
    overlay.addEventListener("keydown", onTrap);

    // focus close button
    overlay.querySelector(".ui-close").onclick = close;
    setTimeout(() => overlay.querySelector(".ui-close")?.focus(), 0);

    return { close, overlay };
  };

  const confirmModal = (message, { title = "Confirm", okText = "OK", cancelText = "Cancel" } = {}) => {
    return new Promise((resolve) => {
      const footer = document.createElement("div");
      footer.style.display = "flex";
      footer.style.gap = "10px";
      footer.style.justifyContent = "flex-end";
      footer.style.width = "100%";

      const cancel = document.createElement("button");
      cancel.className = "ui-btn";
      cancel.type = "button";
      cancel.textContent = cancelText;

      const ok = document.createElement("button");
      ok.className = "ui-btn primary";
      ok.type = "button";
      ok.textContent = okText;

      footer.appendChild(cancel);
      footer.appendChild(ok);

      const { close } = openModal({
        title,
        content: `<p style="margin:0; color:var(--muted); line-height:1.4">${escapeHtml(message)}</p>`,
        footer,
        onClose: () => resolve(false),
      });

      cancel.onclick = () => { close(); resolve(false); };
      ok.onclick = () => { close(); resolve(true); };
    });
  };

  // Drawer
  const ensureDrawer = () => {
    let d = document.querySelector(".ui-drawer");
    if (d) return d;

    d = document.createElement("aside");
    d.className = "ui-drawer";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
    d.innerHTML = `
      <header>
        <h3 class="ui-drawer-title">Drawer</h3>
        <button class="ui-close" type="button">Close</button>
      </header>
      <div class="body"></div>
      <div class="footer"></div>
    `;
    document.body.appendChild(d);
    return d;
  };

  const openDrawer = ({ title = "Drawer", content = "", footer = "" } = {}) => {
    const d = ensureDrawer();
    lastFocus = document.activeElement;

    d.querySelector(".ui-drawer-title").textContent = title;

    const body = d.querySelector(".body");
    body.innerHTML = typeof content === "string" ? content : "";
    if (content instanceof Node) {
      body.innerHTML = "";
      body.appendChild(content);
    }

    const foot = d.querySelector(".footer");
    foot.innerHTML = typeof footer === "string" ? footer : "";
    if (footer instanceof Node) {
      foot.innerHTML = "";
      foot.appendChild(footer);
    }

    const close = () => {
      d.dataset.open = "false";
      document.removeEventListener("keydown", onKeydown);
      d.removeEventListener("keydown", onTrap);
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const onKeydown = (e) => { if (e.key === "Escape") close(); };
    const onTrap = (e) => trapFocus(d, e);

    d.dataset.open = "true";
    d.querySelector(".ui-close").onclick = close;
    document.addEventListener("keydown", onKeydown);
    d.addEventListener("keydown", onTrap);

    setTimeout(() => d.querySelector(".ui-close")?.focus(), 0);

    return { close, drawer: d };
  };

  const escapeHtml = (str) =>
    String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  window.uiModal = { openModal, confirmModal, openDrawer };
})();