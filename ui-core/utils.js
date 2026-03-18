(function () {
  const Utils = {
    qs(selector, scope = document) {
      return scope.querySelector(selector);
    },

    qsa(selector, scope = document) {
      return Array.from(scope.querySelectorAll(selector));
    },

    on(parent, eventType, selector, handler) {
      parent.addEventListener(eventType, (event) => {
        const target = event.target.closest(selector);
        if (!target || !parent.contains(target)) return;
        handler(event, target);
      });
    },

    debounce(fn, delay = 250) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    uniqueId(prefix = "fw") {
      return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
    },

    getFocusable(container) {
      return this.qsa(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        container
      ).filter((el) => !el.hasAttribute("hidden"));
    },

    trapFocus(container, event) {
      if (event.key !== "Tab") return;

      const focusable = this.getFocusable(container);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },

    lockBodyScroll() {
      document.documentElement.classList.add("fw-scroll-lock");
      document.body.classList.add("fw-scroll-lock");
    },

    unlockBodyScroll() {
      document.documentElement.classList.remove("fw-scroll-lock");
      document.body.classList.remove("fw-scroll-lock");
    },

    escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (char) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        };
        return map[char];
      });
    }
  };

  window.FWUtils = Utils;
})();