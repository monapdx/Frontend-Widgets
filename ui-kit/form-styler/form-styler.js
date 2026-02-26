/* ui-kit/form-styler/form-styler.js */
(() => {

  function initFileInputs(root = document) {
    root.querySelectorAll(".ui-file input[type='file']").forEach(input => {
      const label = input.closest(".ui-file")?.querySelector(".ui-file-label span");
      if (!label) return;

      input.addEventListener("change", () => {
        label.textContent = input.files?.[0]?.name || "Choose file";
      });
    });
  }

  function initRanges(root = document) {
    root.querySelectorAll(".ui-range").forEach(range => {
      const output = document.querySelector(`[data-range-output="${range.id}"]`);
      if (!output) return;
      const update = () => output.textContent = range.value;
      range.addEventListener("input", update);
      update();
    });
  }

  function initValidation(root = document) {
    root.querySelectorAll("form[data-ui-validate]").forEach(form => {
      form.addEventListener("submit", (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          if (window.toast?.error)
            toast.error("Please fix the highlighted fields.");
        }
      });
    });
  }

  function initAll() {
    initFileInputs();
    initRanges();
    initValidation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.uiForm = { initAll };

})();