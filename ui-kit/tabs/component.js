(function () {
  class FWTabs {
    constructor(root) {
      this.root = root;
      this.buttons = Array.from(root.querySelectorAll("[role='tab']"));
      this.panels = Array.from(root.querySelectorAll("[role='tabpanel']"));

      this.buttons.forEach((button, index) => {
        button.addEventListener("click", () => this.activate(index));
        button.addEventListener("keydown", (e) => this.onKeydown(e, index));
      });

      const activeIndex = this.buttons.findIndex(btn => btn.getAttribute("aria-selected") === "true");
      this.activate(activeIndex >= 0 ? activeIndex : 0, false);
    }

    activate(index, moveFocus = true) {
      this.buttons.forEach((button, i) => {
        const selected = i === index;
        button.setAttribute("aria-selected", selected ? "true" : "false");
        button.setAttribute("tabindex", selected ? "0" : "-1");
        this.panels[i].hidden = !selected;
      });

      if (moveFocus) this.buttons[index].focus();
    }

    onKeydown(event, index) {
      let next = index;

      if (event.key === "ArrowRight") next = (index + 1) % this.buttons.length;
      if (event.key === "ArrowLeft") next = (index - 1 + this.buttons.length) % this.buttons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = this.buttons.length - 1;

      if (next !== index) {
        event.preventDefault();
        this.activate(next);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".fw-tabs").forEach(root => new FWTabs(root));
  });
})();