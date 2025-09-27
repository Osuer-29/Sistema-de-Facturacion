export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>👥 Clientes</h2>
    <input type="text" id="search-clientes" placeholder="🔍 Buscar cliente..." class="search-box">
    <button id="add-client">➕ Nuevo Cliente</button>
    <table class="table">
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
      </thead>
      <tbody id="clientes-body">
        ${renderRows(state.clientes)}
      </tbody>
    </table>

    <!-- Modal Cliente (Agregar/Editar) -->
    <div id="client-modal" class="modal hidden">
      <div class="modal-content">
        <h3 id="modal-title">Nuevo Cliente</h3>
        <form id="client-form">
          <label>Nombre</label>
          <input type="text" id="nombre" required>
          
          <label>Email</label>
          <input type="email" id="email" required>
          
          <label>Teléfono</label>
          <input type="text" id="telefono" required>
          
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
        <p id="confirm-message">¿Seguro que deseas eliminar este cliente?</p>
        <div class="modal-actions">
          <button id="confirm-yes">Sí</button>
          <button id="confirm-no">No</button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector("#client-modal");
  const form = container.querySelector("#client-form");
  const cancelBtn = container.querySelector("#cancel");
  const confirmModal = container.querySelector("#confirm-modal");
  const confirmYes = container.querySelector("#confirm-yes");
  const confirmNo = container.querySelector("#confirm-no");
  const modalTitle = container.querySelector("#modal-title");
  const tbody = container.querySelector("#clientes-body");

  let editingIndex = null;
  let deletingIndex = null;

  // 🔎 --- Buscador de clientes ---
  const searchInput = container.querySelector("#search-clientes");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.clientes.filter(c =>
        String(c.id).toLowerCase().includes(term) ||
        c.nombre.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.telefono.toLowerCase().includes(term)
      )
    );
    attachRowEvents(); // re-asignar eventos a los botones
  });

  // Abrir modal "nuevo cliente"
  document.getElementById("add-client").addEventListener("click", () => {
    editingIndex = null;
    modalTitle.textContent = "Nuevo Cliente";
    form.reset();
    modal.classList.remove("hidden");
  });

  // Cerrar modal cliente
  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Guardar cliente (nuevo o editado)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = form.querySelector("#nombre").value.trim();
    const email = form.querySelector("#email").value.trim();
    const telefono = form.querySelector("#telefono").value.trim();

    if (!nombre || !email || !telefono) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (editingIndex !== null) {
      // Editar cliente
      state.clientes[editingIndex] = { 
        ...state.clientes[editingIndex], 
        nombre, email, telefono 
      };
    } else {
      // Nuevo cliente
      const id = Date.now();
      state.clientes.push({ id, nombre, email, telefono });
    }

    saveState();
    render(container, state, saveState);
  });

  // --- Render filas de clientes ---
  function renderRows(clientes) {
    return clientes.map((c, i) => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>${c.telefono}</td>
        <td>
          <button class="edit-btn" data-index="${i}">✏️ Editar</button>
          <button class="delete-btn" data-index="${i}">🗑️ Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  // --- Asignar eventos de tabla ---
  function attachRowEvents() {
    // Editar cliente
    container.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        editingIndex = btn.dataset.index;
        const c = state.clientes[editingIndex];

        modalTitle.textContent = "Editar Cliente";
        form.querySelector("#nombre").value = c.nombre;
        form.querySelector("#email").value = c.email;
        form.querySelector("#telefono").value = c.telefono;

        modal.classList.remove("hidden");
      });
    });

    // Eliminar cliente
    container.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        deletingIndex = btn.dataset.index;
        confirmModal.classList.remove("hidden");
      });
    });
  }

  attachRowEvents();

  // Confirmar eliminación
  confirmYes.addEventListener("click", () => {
    if (deletingIndex !== null) {
      state.clientes.splice(deletingIndex, 1);
      saveState();
      render(container, state, saveState);
    }
  });

  // Cancelar eliminación
  confirmNo.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
    deletingIndex = null;
  });
}
