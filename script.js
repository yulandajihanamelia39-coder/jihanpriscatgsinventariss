const STORAGE_KEY = "inventarisku-data";

const initialData = [
  {
    id: "1",
    name: "Laptop Lenovo ThinkPad",
    code: "LAB-001",
    room: "Lab Komputer",
    quantity: 24,
    condition: "Baik",
    updated: "Hari ini, 09:42",
  },
  {
    id: "2",
    name: "Proyektor Epson",
    code: "KLS-014",
    room: "Ruang Kelas 3A",
    quantity: 2,
    condition: "Baik",
    updated: "Kemarin, 15:20",
  },
  {
    id: "3",
    name: "Kursi Belajar Kayu",
    code: "KLS-032",
    room: "Ruang Kelas 3A",
    quantity: 30,
    condition: "Rusak Ringan",
    updated: "28 Mei 2024",
  },
  {
    id: "4",
    name: "Rak Buku Besi",
    code: "PER-007",
    room: "Perpustakaan",
    quantity: 8,
    condition: "Baik",
    updated: "26 Mei 2024",
  },
  {
    id: "5",
    name: "Kipas Angin Dinding",
    code: "GRU-003",
    room: "Ruang Guru",
    quantity: 4,
    condition: "Rusak Berat",
    updated: "24 Mei 2024",
  },
];

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
let editingId = null;
let deletingId = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  const span = toast.querySelector("span");

  if (span) {
    span.textContent = message;
  }

  toast.hidden = false;

  setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function conditionClass(condition) {
  if (condition === "Baik") {
    return "good";
  }

  if (condition === "Rusak Ringan") {
    return "light";
  }

  return "heavy";
}

function render() {
  const searchInput = $("#searchInput");
  const roomFilter = $("#roomFilter");
  const conditionFilter = $("#conditionFilter");
  const inventoryList = $("#inventoryList");

  if (!searchInput || !roomFilter || !conditionFilter || !inventoryList) {
    return;
  }

  const query = searchInput.value.toLowerCase().trim();
  const room = roomFilter.value;
  const condition = conditionFilter.value;

  const filtered = items.filter((item) => {
    const matchesSearch = `${item.name} ${item.code}`
      .toLowerCase()
      .includes(query);

    const matchesRoom =
      room === "Semua ruangan" || item.room === room;

    const matchesCondition =
      condition === "Semua kondisi" ||
      item.condition === condition;

    return matchesSearch && matchesRoom && matchesCondition;
  });

  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const good = items
    .filter((item) => item.condition === "Baik")
    .reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

  const totalItems = $("#totalItems");
  const goodItems = $("#goodItems");
  const brokenItems = $("#brokenItems");
  const kindItems = $("#kindItems");
  const goodPercent = $("#goodPercent");
  const navCount = $("#navCount");
  const shownCount = $("#shownCount");
  const allCount = $("#allCount");

  if (totalItems) {
    totalItems.textContent = total;
  }

  if (goodItems) {
    goodItems.textContent = good;
  }

  if (brokenItems) {
    brokenItems.textContent = total - good;
  }

  if (kindItems) {
    kindItems.textContent = `${items.length} jenis barang`;
  }

  if (goodPercent) {
    goodPercent.textContent =
      `${total ? Math.round((good / total) * 100) : 0}% dari total`;
  }

  if (navCount) {
    navCount.textContent = items.length;
  }

  if (shownCount) {
    shownCount.textContent = filtered.length;
  }

  if (allCount) {
    allCount.textContent = items.length;
  }

  if (filtered.length) {
    inventoryList.innerHTML = filtered
      .map(
        (item, index) => `
          <div
            class="table-row"
            style="animation-delay:${index * 45}ms"
          >
            <div class="item-cell">
              <div class="item-icon">▦</div>

              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <small>
                  Diperbarui ${escapeHtml(item.updated)}
                </small>
              </div>
            </div>

            <div>
              <strong class="code">
                ${escapeHtml(item.code)}
              </strong>

              <small>
                ${escapeHtml(item.room)}
              </small>
            </div>

            <strong>
              ${item.quantity}
              <small>unit</small>
            </strong>

            <div>
              <span class="status ${conditionClass(item.condition)}">
                ${escapeHtml(item.condition)}
              </span>
            </div>

            <div class="row-actions">
              <button
                title="Edit"
                data-edit="${item.id}"
              >
                ✎
              </button>

              <button
                title="Hapus"
                data-delete="${item.id}"
              >
                ⌫
              </button>
            </div>
          </div>
        `
      )
      .join("");
  } else {
    inventoryList.innerHTML = `
      <div class="empty">
        ▦
        <br>
        <strong>Tidak ada data ditemukan</strong>
        <p>
          Coba ubah kata kunci atau filter pencarian.
        </p>
      </div>
    `;
  }
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      };

      return entities[char];
    }
  );
}

function refreshRooms() {
  const roomFilter = $("#roomFilter");

  if (!roomFilter) return;

  const current = roomFilter.value;

  const rooms = [
    ...new Set(items.map((item) => item.room)),
  ];

  roomFilter.innerHTML =
    "<option>Semua ruangan</option>" +
    rooms
      .map(
        (room) =>
          `<option>${escapeHtml(room)}</option>`
      )
      .join("");

  roomFilter.value = rooms.includes(current)
    ? current
    : "Semua ruangan";
}

function openForm(item = null) {
  const formModal = $("#formModal");

  if (!formModal) return;

  editingId = item ? item.id : null;

  const modalIndex = $("#modalIndex");
  const modalTitle = $("#modalTitle");

  if (modalIndex) {
    modalIndex.textContent = item
      ? "EDIT / 04"
      : "CATAT / 03";
  }

  if (modalTitle) {
    modalTitle.textContent = item
      ? "Perbarui catatan"
      : "Catat barang baru";
  }

  const itemName = $("#itemName");
  const itemCode = $("#itemCode");
  const itemRoom = $("#itemRoom");
  const itemQuantity = $("#itemQuantity");
  const itemCondition = $("#itemCondition");

  if (itemName) {
    itemName.value = item?.name || "";
  }

  if (itemCode) {
    itemCode.value = item?.code || "";
  }

  if (itemRoom) {
    itemRoom.value = item?.room || "";
  }

  if (itemQuantity) {
    itemQuantity.value = item?.quantity || 1;
  }

  if (itemCondition) {
    itemCondition.value = item?.condition || "Baik";
  }

  formModal.hidden = false;

  setTimeout(() => {
    if (itemName) {
      itemName.focus();
    }
  }, 50);
}

function closeModals() {
  const formModal = $("#formModal");
  const deleteModal = $("#deleteModal");

  if (formModal) {
    formModal.hidden = true;
  }

  if (deleteModal) {
    deleteModal.hidden = true;
  }

  editingId = null;
  deletingId = null;
}

const inventoryForm = $("#inventoryForm");

if (inventoryForm) {
  inventoryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const draft = {
      name: $("#itemName").value.trim(),
      code: $("#itemCode").value.trim().toUpperCase(),
      room: $("#itemRoom").value.trim(),
      quantity: Number($("#itemQuantity").value),
      condition: $("#itemCondition").value,
      updated: "Baru saja",
    };

    const wasEditing = Boolean(editingId);

    if (wasEditing) {
      items = items.map((item) =>
        item.id === editingId
          ? { ...item, ...draft }
          : item
      );
    } else {
      items.unshift({
        id: Date.now().toString(),
        ...draft,
      });
    }

    save();
    refreshRooms();
    render();
    closeModals();

    showToast(
      wasEditing
        ? "Perubahan tersimpan"
        : "Barang berhasil dicatat"
    );
  });
}

const inventoryList = $("#inventoryList");

if (inventoryList) {
  inventoryList.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const remove = event.target.closest("[data-delete]");

    if (edit) {
      const item = items.find(
        (item) => item.id === edit.dataset.edit
      );

      if (item) {
        openForm(item);
      }
    }

    if (remove) {
      deletingId = remove.dataset.delete;

      const deleteModal = $("#deleteModal");

      if (deleteModal) {
        deleteModal.hidden = false;
      }
    }
  });
}

const confirmDelete = $("#confirmDelete");

if (confirmDelete) {
  confirmDelete.addEventListener("click", () => {
    items = items.filter(
      (item) => item.id !== deletingId
    );

    save();
    refreshRooms();
    render();
    closeModals();

    showToast("Data inventaris dihapus");
  });
}

const navAdd = $("#navAdd");

if (navAdd) {
  navAdd.addEventListener("click", () => {
    openForm();
  });
}

const heroAdd = $("#heroAdd");

if (heroAdd) {
  heroAdd.addEventListener("click", () => {
    openForm();
  });
}

$$("[data-close]").forEach((button) => {
  button.addEventListener("click", closeModals);
});

const searchInput = $("#searchInput");

if (searchInput) {
  searchInput.addEventListener("input", render);
}

const roomFilter = $("#roomFilter");

if (roomFilter) {
  roomFilter.addEventListener("change", render);
}

const conditionFilter = $("#conditionFilter");

if (conditionFilter) {
  conditionFilter.addEventListener("change", render);
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  const isDark =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "inventarisku-theme",
    isDark ? "dark" : "light"
  );

  const themeIcon = $("#themeIcon");

  if (themeIcon) {
    themeIcon.textContent = isDark ? "☀" : "☾";
  }
}

const themeBtn = $("#themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", toggleTheme);
}

if (
  localStorage.getItem("inventarisku-theme") === "dark"
) {
  document.body.classList.add("dark");

  const themeIcon = $("#themeIcon");

  if (themeIcon) {
    themeIcon.textContent = "☀";
  }
}

$$("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(
      button.dataset.scroll
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

const exportBtn = $("#exportBtn");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify(items, null, 2)],
      {
        type: "application/json",
      }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download =
      `backup-inventaris-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    link.click();

    URL.revokeObjectURL(link.href);

    showToast("Backup berhasil diunduh");
  });
}

const importBtn = $("#importBtn");

if (importBtn) {
  importBtn.addEventListener("click", () => {
    const importFile = $("#importFile");

    if (importFile) {
      importFile.click();
    }
  });
}

const importFile = $("#importFile");

if (importFile) {
  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!Array.isArray(data)) {
          throw new Error("Format data tidak valid");
        }

        items = data;

        save();
        refreshRooms();
        render();

        showToast("Data berhasil dipulihkan");
      } catch (error) {
        showToast("File backup tidak valid");
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  });
}

/* Jalankan aplikasi */
refreshRooms();
render();
