export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>💰 Ingresos</h2>
    <div class="header-actions">
      <input type="text" id="search-ingresos" placeholder="🔍 Buscar ingreso..." class="search-box">
      <button id="new-ingreso">➕ Nuevo Ingreso</button>
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
      <tbody id="ingresos-body">
        ${renderRows(state.ingresos)}
      </tbody>
    </table>

    <!-- Modal -->
    <div id="ingreso-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Nuevo Ingreso</h3>
        <form id="ingreso-form">
          <label>Fecha:</label>
          <input type="date" id="ingreso-fecha" required>
          
          <label>Descripción:</label>
          <input type="text" id="ingreso-descripcion" required>
          
          <label>Categoría:</label>
          <input type="text" id="ingreso-categoria" required>
          
          <label>Monto:</label>
          <input type="number" id="ingreso-monto" step="0.01" required>
          
          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel-ingreso">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  function renderRows(data) {
    return data.map((i, index) => `
      <tr>
        <td>${i.fecha}</td>
        <td>${i.descripcion}</td>
        <td>${i.categoria}</td>
        <td>$${i.monto.toFixed(2)}</td>
        <td>
          <button class="delete-btn" data-index="${index}">🗑️</button>
        </td>
      </tr>
    `).join("");
  }

  const tbody = container.querySelector("#ingresos-body");
  const modal = container.querySelector("#ingreso-modal");
  const form = container.querySelector("#ingreso-form");
  const cancelBtn = container.querySelector("#cancel-ingreso");

  // Abrir modal
  document.getElementById("new-ingreso").addEventListener("click", () => {
    form.reset();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Guardar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ingreso = {
      fecha: form.querySelector("#ingreso-fecha").value,
      descripcion: form.querySelector("#ingreso-descripcion").value,
      categoria: form.querySelector("#ingreso-categoria").value,
      monto: parseFloat(form.querySelector("#ingreso-monto").value),
    };
    state.ingresos.push(ingreso);
    saveState();
    render(container, state, saveState);
  });

  // Eliminar
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar este ingreso?")) {
        state.ingresos.splice(btn.dataset.index, 1);
        saveState();
        render(container, state, saveState);
      }
    });
  });

  // Buscador
  const searchInput = container.querySelector("#search-ingresos");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.ingresos.filter(i =>
        i.descripcion.toLowerCase().includes(term) ||
        i.categoria.toLowerCase().includes(term)
      )
    );
  });
}
