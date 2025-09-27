export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>📦 Inventario</h2>
    <input type="text" id="search-inventario" placeholder="🔍 Buscar producto..." class="search-box">
    <button id="add-product">➕ Nuevo Producto</button>
    <table class="table">
      <thead>
        <tr><th>SKU</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
      </thead>
      <tbody id="inventario-body">
        ${renderRows(state.inventario)}
      </tbody>
    </table>

    <!-- Modal Producto (Agregar/Editar) -->
    <div id="product-modal" class="modal hidden">
      <div class="modal-content">
        <h3 id="modal-title">Nuevo Producto</h3>
        <form id="product-form">
          <label>SKU</label>
          <input type="text" id="sku" required>
          
          <label>Nombre</label>
          <input type="text" id="nombre" required>
          
          <label>Precio</label>
          <input type="number" id="precio" required>
          
          <label>Stock</label>
          <input type="number" id="stock" required>
          
          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación -->
    <div id="confirm-modal" class="modal hidden">
      <div class="modal-content">
        <h3>⚠️ Confirmación</h3>
        <p id="confirm-message">¿Seguro que deseas eliminar este producto?</p>
        <div class="modal-actions">
          <button id="confirm-yes">Sí</button>
          <button id="confirm-no">No</button>
        </div>
      </div>
    </div>
  `;

  // Función para renderizar filas
  function renderRows(data) {
    return data.map((p, i) => `
      <tr>
        <td>${p.sku}</td>
        <td>${p.nombre}</td>
        <td>${p.precio}</td>
        <td>${p.stock}</td>
        <td>
          <button class="edit-btn" data-index="${i}">✏️ Editar</button>
          <button class="delete-btn" data-index="${i}">🗑️ Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  const modal = container.querySelector("#product-modal");
  const form = container.querySelector("#product-form");
  const cancelBtn = container.querySelector("#cancel");
  const confirmModal = container.querySelector("#confirm-modal");
  const confirmYes = container.querySelector("#confirm-yes");
  const confirmNo = container.querySelector("#confirm-no");
  const modalTitle = container.querySelector("#modal-title");
  const tbody = container.querySelector("#inventario-body");
  const searchInput = container.querySelector("#search-inventario");

  let editingIndex = null;
  let deletingIndex = null;

  // Abrir modal "nuevo producto"
  document.getElementById("add-product").addEventListener("click", () => {
    editingIndex = null;
    modalTitle.textContent = "Nuevo Producto";
    form.reset();
    modal.classList.remove("hidden");
  });

  // Cerrar modal producto
  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Guardar producto (nuevo o editado)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const sku = form.querySelector("#sku").value.trim();
    const nombre = form.querySelector("#nombre").value.trim();
    const precio = parseFloat(form.querySelector("#precio").value);
    const stock = parseInt(form.querySelector("#stock").value, 10);

    if (!sku || !nombre || isNaN(precio) || isNaN(stock)) {
      alert("Por favor completa todos los campos correctamente");
      return;
    }

    if (editingIndex !== null) {
      // Editar producto
      state.inventario[editingIndex] = { sku, nombre, precio, stock };
    } else {
      // Nuevo producto
      state.inventario.push({ sku, nombre, precio, stock });
    }

    saveState();
    render(container, state, saveState);
  });

  // Editar producto
  container.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      editingIndex = btn.dataset.index;
      const p = state.inventario[editingIndex];

      modalTitle.textContent = "Editar Producto";
      form.querySelector("#sku").value = p.sku;
      form.querySelector("#nombre").value = p.nombre;
      form.querySelector("#precio").value = p.precio;
      form.querySelector("#stock").value = p.stock;

      modal.classList.remove("hidden");
    });
  });

  // Eliminar producto
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deletingIndex = btn.dataset.index;
      confirmModal.classList.remove("hidden");
    });
  });

  // Confirmar eliminación
  confirmYes.addEventListener("click", () => {
    if (deletingIndex !== null) {
      state.inventario.splice(deletingIndex, 1);
      saveState();
      render(container, state, saveState);
    }
  });

  // Cancelar eliminación
  confirmNo.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
    deletingIndex = null;
  });

  // 🔎 Buscador
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.inventario.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        String(p.precio).includes(term) ||
        String(p.stock).includes(term)
      )
    );
  });
}
