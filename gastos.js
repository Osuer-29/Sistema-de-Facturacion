export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>💸 Gastos</h2>
    <div class="header-actions">
      <input type="text" id="search-gastos" placeholder="🔍 Buscar gasto..." class="search-box">
      <button id="new-gasto">➕ Nuevo Gasto</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Monto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="gastos-body">
        ${renderRows(state.gastos)}
      </tbody>
    </table>

    <!-- Modal -->
    <div id="gasto-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Nuevo Gasto</h3>
        <form id="gasto-form">
          <label>Fecha:</label>
          <input type="date" id="gasto-fecha" required>
          
          <label>Descripción:</label>
          <input type="text" id="gasto-descripcion" required>
          
          <label>Categoría:</label>
          <input type="text" id="gasto-categoria" required>
          
          <label>Monto:</label>
          <input type="number" id="gasto-monto" step="0.01" required>
          
          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel-gasto">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  function renderRows(data) {
    return data.map((g, index) => `
      <tr>
        <td>${g.fecha}</td>
        <td>${g.descripcion}</td>
        <td>${g.categoria}</td>
        <td>$${g.monto.toFixed(2)}</td>
        <td>
          <button class="delete-btn" data-index="${index}">🗑️</button>
        </td>
      </tr>
    `).join("");
  }

  const tbody = container.querySelector("#gastos-body");
  const modal = container.querySelector("#gasto-modal");
  const form = container.querySelector("#gasto-form");
  const cancelBtn = container.querySelector("#cancel-gasto");

  // Abrir modal
  document.getElementById("new-gasto").addEventListener("click", () => {
    form.reset();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Guardar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const gasto = {
      fecha: form.querySelector("#gasto-fecha").value,
      descripcion: form.querySelector("#gasto-descripcion").value,
      categoria: form.querySelector("#gasto-categoria").value,
      monto: parseFloat(form.querySelector("#gasto-monto").value),
    };
    state.gastos.push(gasto);
    saveState();
    render(container, state, saveState);
  });

  // Eliminar
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar este gasto?")) {
        state.gastos.splice(btn.dataset.index, 1);
        saveState();
        render(container, state, saveState);
      }
    });
  });

  // Buscador
  const searchInput = container.querySelector("#search-gastos");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.gastos.filter(g =>
        g.descripcion.toLowerCase().includes(term) ||
        g.categoria.toLowerCase().includes(term)
      )
    );
  });
}
