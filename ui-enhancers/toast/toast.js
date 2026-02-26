/* ui-enhancers/toast/toast.js */
(() => {
  const ensureStack = () => {
    let el = document.querySelector(".toast-stack");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast-stack";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-relevant", "additions");
      document.body.appendChild(el);
    }
    return el;
  };

  const make = ({ title, message, type = "info", duration = 2600 }) => {
    const stack = ensureStack();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", "status");

    const left = document.createElement("div");
    const h = document.createElement("p");
    h.className = "title";
    h.textContent = title ?? (type === "error" ? "Error" : type === "success" ? "Success" : "Notice");

    const p = document.createElement("p");
    p.className = "msg";
    p.textContent = message ?? "";

    left.appendChild(h);
    if (p.textContent) left.appendChild(p);

    const right = document.createElement("button");
    right.className = "x";
    right.type = "button";
    right.setAttribute("aria-label", "Dismiss notification");
    right.textContent = "×";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.animationDuration = `${Math.max(800, duration)}ms`;

    toast.appendChild(left);
    toast.appendChild(right);
    toast.appendChild(bar);

    const remove = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(6px)";
      setTimeout(() => toast.remove(), 140);
    };

    right.addEventListener("click", remove);

    stack.appendChild(toast);

    if (duration !== Infinity) setTimeout(remove, duration);

    return { remove };
  };

  const api = (message, opts = {}) => make({ message, ...opts, type: opts.type ?? "info" });
  api.success = (message, opts = {}) => make({ message, ...opts, type: "success", title: opts.title ?? "Saved" });
  api.error = (message, opts = {}) => make({ message, ...opts, type: "error", title: opts.title ?? "Nope" });
  api.info = (message, opts = {}) => make({ message, ...opts, type: "info", title: opts.title ?? "Heads up" });

  api.promise = async (promise, { pending = "Working…", success = "Done.", error = "Something went wrong." } = {}) => {
    const t = make({ title: "Please wait", message: pending, type: "info", duration: Infinity });
    try {
      const result = await promise;
      t.remove();
      api.success(success);
      return result;
    } catch (e) {
      t.remove();
      api.error(error);
      throw e;
    }
  };

  window.toast = api;
})();