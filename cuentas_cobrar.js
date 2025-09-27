export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>💵 Cuentas por Cobrar</h2>
    <div class="header-actions">
      <input type="text" id="search-cxc" placeholder="🔍 Buscar cliente o factura..." class="search-box">
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Factura</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Pagado</th>
          <th>Saldo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="cxc-body">
        ${renderRows(state.cuentas_cobrar)}
      </tbody>
    </table>

    <!-- Modal Registrar Pago -->
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
        <td>${c.facturaId}</td>
        <td>${c.cliente.nombre}</td>
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

  const tbody = container.querySelector("#cxc-body");
  const pagoModal = container.querySelector("#pago-modal");
  const pagoForm = container.querySelector("#pago-form");
  const cancelPago = container.querySelector("#cancel-pago");

  // Abrir modal de pago
  container.querySelectorAll(".pago-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      pagoForm.reset();
      pagoForm.querySelector("#pago-index").value = index;
      pagoModal.classList.remove("hidden");
    });
  });

  // Guardar pago
  pagoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = pagoForm.querySelector("#pago-index").value;
    const monto = parseFloat(pagoForm.querySelector("#pago-monto").value);

    if (isNaN(monto) || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    const cuenta = state.cuentas_cobrar[index];
    cuenta.pagado += monto;
    if (cuenta.pagado >= cuenta.total) {
      cuenta.estado = "Pagada";
      cuenta.pagado = cuenta.total;
    }
    saveState();
    render(container, state, saveState);
  });

  // Cancelar modal
  cancelPago.addEventListener("click", () => {
    pagoModal.classList.add("hidden");
  });

  // Eliminar cuenta
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar esta cuenta por cobrar?")) {
        state.cuentas_cobrar.splice(btn.dataset.index, 1);
        saveState();
        render(container, state, saveState);
      }
    });
  });

  // Buscador
  const searchInput = container.querySelector("#search-cxc");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.cuentas_cobrar.filter(c =>
        c.cliente.nombre.toLowerCase().includes(term) ||
        String(c.facturaId).includes(term)
      )
    );
  });
}
