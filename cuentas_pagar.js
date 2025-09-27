export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>📉 Cuentas por Pagar</h2>
    <div class="header-actions">
      <input type="text" id="search-cxp" placeholder="🔍 Buscar proveedor o documento..." class="search-box">
      <button id="new-cxp">➕ Nueva Cuenta por Pagar</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Documento</th>
          <th>Proveedor</th>
          <th>Total</th>
          <th>Pagado</th>
          <th>Saldo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="cxp-body">
        ${renderRows(state.cuentas_pagar)}
      </tbody>
    </table>

    <!-- Modal Nueva Cuenta -->
    <div id="cxp-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Nueva Cuenta por Pagar</h3>
        <form id="cxp-form">
          <label>Proveedor:</label>
          <input type="text" id="proveedor" required>
          
          <label>Número de documento:</label>
          <input type="text" id="documento" required>
          
          <label>Monto total:</label>
          <input type="number" id="monto" step="0.01" required>
          
          <label>Fecha de vencimiento:</label>
          <input type="date" id="fecha" required>
          
          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel-cxp">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pago -->
    <div id="pago-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Registrar Pago</h3>
        <form id="pago-form">
          <input type="hidden" id="pago-index">
          <label>Monto a pagar:</label>
          <input type="number" id="pago-monto" step="0.01" min="0" required>
          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel-pago">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  function renderRows(data) {
    return data.map((c, i) => `
      <tr>
        <td>${c.documento}</td>
        <td>${c.proveedor}</td>
        <td>$${c.total.toFixed(2)}</td>
        <td>$${c.pagado.toFixed(2)}</td>
        <td>$${(c.total - c.pagado).toFixed(2)}</td>
        <td>${c.estado}</td>
        <td>
          <button class="pago-btn" data-index="${i}">💳 Pago</button>
          <button class="delete-btn" data-index="${i}">🗑️ Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  const tbody = container.querySelector("#cxp-body");
  const modal = container.querySelector("#cxp-modal");
  const form = container.querySelector("#cxp-form");
  const cancelBtn = container.querySelector("#cancel-cxp");

  const pagoModal = container.querySelector("#pago-modal");
  const pagoForm = container.querySelector("#pago-form");
  const cancelPago = container.querySelector("#cancel-pago");

  let editingIndex = null;

  // Nueva cuenta
  document.getElementById("new-cxp").addEventListener("click", () => {
    form.reset();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cuenta = {
      proveedor: form.querySelector("#proveedor").value,
      documento: form.querySelector("#documento").value,
      total: parseFloat(form.querySelector("#monto").value),
      pagado: 0,
      fecha: form.querySelector("#fecha").value,
      estado: "Pendiente"
    };

    state.cuentas_pagar.push(cuenta);
    saveState();
    render(container, state, saveState);
  });

  // Registrar pago
  container.querySelectorAll(".pago-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      pagoForm.reset();
      pagoForm.querySelector("#pago-index").value = index;
      pagoModal.classList.remove("hidden");
    });
  });

  pagoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = pagoForm.querySelector("#pago-index").value;
    const monto = parseFloat(pagoForm.querySelector("#pago-monto").value);

    if (isNaN(monto) || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    const cuenta = state.cuentas_pagar[index];
    cuenta.pagado += monto;
    if (cuenta.pagado >= cuenta.total) {
      cuenta.estado = "Pagada";
      cuenta.pagado = cuenta.total;
    }
    saveState();
    render(container, state, saveState);
  });

  cancelPago.addEventListener("click", () => {
    pagoModal.classList.add("hidden");
  });

  // Eliminar
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar esta cuenta por pagar?")) {
        state.cuentas_pagar.splice(btn.dataset.index, 1);
        saveState();
        render(container, state, saveState);
      }
    });
  });

  // Buscador
  const searchInput = container.querySelector("#search-cxp");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.cuentas_pagar.filter(c =>
        c.proveedor.toLowerCase().includes(term) ||
        c.documento.toLowerCase().includes(term)
      )
    );
  });
}
