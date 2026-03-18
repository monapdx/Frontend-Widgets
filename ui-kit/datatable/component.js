(function () {
  if (!window.FWUtils) {
    console.warn("FWUtils is required for datatable.");
    return;
  }

  class FWDataTable {
    constructor(root) {
      this.root = root;
      this.searchInput = root.querySelector("[data-datatable-search]");
      this.meta = root.querySelector("[data-datatable-meta]");
      this.table = root.querySelector("table");
      this.tbody = this.table.querySelector("tbody");
      this.rows = Array.from(this.tbody.querySelectorAll("tr"));
      this.currentSort = { index: null, direction: "asc" };

      this.bindEvents();
      this.updateMeta();
    }

    bindEvents() {
      if (this.searchInput) {
        this.searchInput.addEventListener(
          "input",
          FWUtils.debounce(() => this.filterRows(), 180)
        );
      }

      this.root.addEventListener("click", (event) => {
        const button = event.target.closest("[data-sort-index]");
        if (!button) return;

        const index = Number(button.dataset.sortIndex);
        this.sortBy(index);
      });
    }

    filterRows() {
      const term = (this.searchInput?.value || "").trim().toLowerCase();

      this.rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        row.hidden = term ? !text.includes(term) : false;
      });

      this.updateMeta();
      this.updateEmptyState();
    }

    sortBy(index) {
      const nextDirection =
        this.currentSort.index === index && this.currentSort.direction === "asc"
          ? "desc"
          : "asc";

      this.currentSort = { index, direction: nextDirection };

      const visibleRows = this.rows.slice();

      visibleRows.sort((a, b) => {
        const aText = a.children[index]?.innerText.trim() || "";
        const bText = b.children[index]?.innerText.trim() || "";

        const aNum = Number(aText.replace(/[^0-9.-]/g, ""));
        const bNum = Number(bText.replace(/[^0-9.-]/g, ""));
        const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum) && aText !== "" && bText !== "";

        let comparison;
        if (bothNumeric) {
          comparison = aNum - bNum;
        } else {
          comparison = aText.localeCompare(bText, undefined, { numeric: true, sensitivity: "base" });
        }

        return nextDirection === "asc" ? comparison : -comparison;
      });

      visibleRows.forEach((row) => this.tbody.appendChild(row));
      this.rows = visibleRows;
    }

    updateMeta() {
      const visibleCount = this.rows.filter((row) => !row.hidden).length;
      const totalCount = this.rows.length;

      if (this.meta) {
        this.meta.textContent = `${visibleCount} of ${totalCount} rows shown`;
      }
    }

    updateEmptyState() {
      let empty = this.root.querySelector(".fw-empty");
      const visibleCount = this.rows.filter((row) => !row.hidden).length;

      if (visibleCount === 0) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "fw-empty";
          empty.textContent = "No matching results.";
          this.root.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".fw-datatable").forEach((root) => {
      new FWDataTable(root);
    });
  });
})();