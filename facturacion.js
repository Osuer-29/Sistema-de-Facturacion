// Usar la librería global de jsPDF (cargada desde CDN en index.html)
const { jsPDF } = window.jspdf;

export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>🧾 Facturación</h2>
    <input type="text" id="search-facturas" placeholder="🔍 Buscar factura..." class="search-box">
    <button id="new-invoice">➕ Nueva Factura</button>
    <table class="table">
      <thead>
        <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acciones</th></tr>
      </thead>
      <tbody id="facturas-body">
        ${renderRows(state.facturas)}
      </tbody>
    </table>

    <!-- Modal Factura -->
    <div id="invoice-modal" class="modal hidden">
      <div class="modal-content big">
        <h3 id="invoice-title">Nueva Factura</h3>
        <form id="invoice-form">
          <div class="form-section">
            <h4>👤 Datos del Cliente</h4>
            <select id="cliente" required>
              <option value="">-- Seleccionar Cliente --</option>
              ${state.clientes.map(c => `
                <option value="${c.id}">${c.nombre} - ${c.email}</option>
              `).join("")}
            </select>
          </div>

          <div class="form-section">
            <h4>📦 Selección de Productos</h4>
            <div id="productos-list">
              ${state.inventario.map(p => `
                <div class="product-line">
                  <label>
                    <input type="checkbox" value="${p.sku}" data-precio="${p.precio}">
                    ${p.nombre} ($${p.precio}) [Stock: ${p.stock}]
                  </label>
                  <input type="number" min="1" max="${p.stock}" value="1" class="cantidad hidden">
                </div>
              `).join("")}
            </div>
          </div>

          <div class="form-section">
  <h4>💳 Tipo de Pago</h4>
  <label><input type="radio" name="tipoPago" value="contado" checked> Contado</label>
  <label><input type="radio" name="tipoPago" value="credito"> Crédito</label>
</div>

          <div class="form-section">
            <h4>💰 Total: $<span id="total">0.00</span></h4>
          </div>
          
          <div class="modal-actions">
            <button type="submit">Guardar Factura</button>
            <button type="button" id="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación -->
    <div id="confirm-modal" class="modal hidden">
      <div class="modal-content">
        <h3>⚠️ Confirmación</h3>
        <p>¿Seguro que deseas anular esta factura?</p>
        <div class="modal-actions">
          <button id="confirm-yes">Sí</button>
          <button id="confirm-no">No</button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector("#invoice-modal");
  const form = container.querySelector("#invoice-form");
  const cancelBtn = container.querySelector("#cancel");
  const confirmModal = container.querySelector("#confirm-modal");
  const confirmYes = container.querySelector("#confirm-yes");
  const confirmNo = container.querySelector("#confirm-no");
  const tbody = container.querySelector("#facturas-body");

  let deletingIndex = null;

  // 🔎 --- Buscador de facturas ---
  const searchInput = container.querySelector("#search-facturas");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = renderRows(
      state.facturas.filter(f =>
        String(f.id).toLowerCase().includes(term) ||
        f.cliente.nombre.toLowerCase().includes(term) ||
        f.fecha.toLowerCase().includes(term) ||
        String(f.total).toLowerCase().includes(term)
      )
    );
    attachRowEvents(); // volver a enlazar eventos
  });

  // Abrir nueva factura
  document.getElementById("new-invoice").addEventListener("click", () => {
    form.reset();
    modal.classList.remove("hidden");
  });

  // Cerrar modal
  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Manejo de productos seleccionados
  const checkboxes = container.querySelectorAll("#productos-list input[type=checkbox]");
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const cantidadInput = cb.parentElement.parentElement.querySelector(".cantidad");
      if (cb.checked) {
        cantidadInput.classList.remove("hidden");
      } else {
        cantidadInput.classList.add("hidden");
      }
      calcularTotal();
    });
  });

  const cantidades = container.querySelectorAll("#productos-list .cantidad");
  cantidades.forEach(input => {
    input.addEventListener("input", calcularTotal);
  });

  function calcularTotal() {
    let total = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        const precio = parseFloat(cb.dataset.precio);
        const cantidad = parseInt(cb.parentElement.parentElement.querySelector(".cantidad").value, 10);
        if (!isNaN(precio) && !isNaN(cantidad)) {
          total += precio * cantidad;
        }
      }
    });
    container.querySelector("#total").textContent = total.toFixed(2);
  }

  // Guardar factura
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const clienteId = form.querySelector("#cliente").value;
  if (!clienteId) {
    alert("Selecciona un cliente");
    return;
  }

  const cliente = state.clientes.find(c => c.id == clienteId);
  const productosSeleccionados = [];

  checkboxes.forEach(cb => {
    if (cb.checked) {
      const sku = cb.value;
      const cantidad = parseInt(cb.parentElement.parentElement.querySelector(".cantidad").value, 10);
      const producto = state.inventario.find(p => p.sku === sku);

      if (producto && cantidad <= producto.stock) {
        productosSeleccionados.push({ sku, nombre: producto.nombre, precio: producto.precio, cantidad });
        producto.stock -= cantidad; // Reducir stock
      } else {
        alert("Stock insuficiente para " + producto.nombre);
      }
    }
  });

  if (productosSeleccionados.length === 0) {
    alert("Selecciona al menos un producto");
    return;
  }

  const total = productosSeleccionados.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
  const tipoPago = form.querySelector("input[name=tipoPago]:checked").value;

  const factura = {
    id: Date.now(),
    cliente,
    productos: productosSeleccionados,
    total,
    fecha: new Date().toLocaleString(),
    tipoPago
  };

  state.facturas.push(factura);

  // 🔹 Lógica de cuentas por cobrar
  if (tipoPago === "credito") {
    state.cuentas_cobrar.push({
      facturaId: factura.id,
      cliente: factura.cliente,
      total: factura.total,
      pagado: 0,
      pendiente: factura.total,
      estado: "Pendiente",
      fecha: factura.fecha,
      vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 días después
    });
  } else {
    // Si es contado → va directo como ingreso
    state.ingresos.push({
      id: Date.now(),
      facturaId: factura.id,
      cliente: factura.cliente,
      monto: factura.total,
      fecha: factura.fecha,
      metodo: "Contado"
    });
  }

  saveState();
  render(container, state, saveState);
});


  // --- Función para dibujar filas ---
  function renderRows(facturas) {
    return facturas.map((f, i) => `
      <tr>
        <td>${f.id}</td>
        <td>${f.cliente.nombre}</td>
        <td>${f.fecha}</td>
        <td>$${f.total.toFixed(2)}</td>
        <td>
          <button class="view-btn" data-index="${i}">👁️ Ver</button>
          <button class="pdf-btn" data-index="${i}">📄 PDF</button>
          <button class="delete-btn" data-index="${i}">🗑️ Anular</button>
        </td>
      </tr>
    `).join("");
  }

  // --- Reasignar eventos a botones de la tabla ---
  function attachRowEvents() {
    // Anular factura
    container.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        deletingIndex = btn.dataset.index;
        confirmModal.classList.remove("hidden");
      });
    });

    confirmYes.addEventListener("click", () => {
      if (deletingIndex !== null) {
        const factura = state.facturas[deletingIndex];
        // Revertir stock
        factura.productos.forEach(fp => {
          const producto = state.inventario.find(p => p.sku === fp.sku);
          if (producto) {
            producto.stock += fp.cantidad;
          }
        });
        state.facturas.splice(deletingIndex, 1);
        saveState();
        render(container, state, saveState);
      }
    });

    confirmNo.addEventListener("click", () => {
      confirmModal.classList.add("hidden");
      deletingIndex = null;
    });

    // Descargar factura en PDF
    container.querySelectorAll(".pdf-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const factura = state.facturas[btn.dataset.index];
        generarPDF(factura);
      });
    });
  }

  attachRowEvents();

  // --- PDF ---
  function generarPDF(factura) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("📌 Empresa Ejemplo", 14, 20);
    doc.setFontSize(12);
    doc.text("Factura #" + factura.id, 150, 20);

    doc.text("Cliente: " + factura.cliente.nombre, 14, 40);
    doc.text("Email: " + factura.cliente.email, 14, 48);
    doc.text("Tel: " + factura.cliente.telefono, 14, 56);
    doc.text("Fecha: " + factura.fecha, 150, 40);
    doc.text("Tipo de Pago: " + (factura.tipoPago === "contado" ? "Contado" : "Crédito"), 14, 64);


    const rows = factura.productos.map(p => [
      p.nombre,
      p.cantidad,
      "$" + p.precio.toFixed(2),
      "$" + (p.precio * p.cantidad).toFixed(2)
    ]);

    doc.autoTable({
      head: [["Producto", "Cantidad", "Precio", "Subtotal"]],
      body: rows,
      startY: 70,
    });

    doc.text("TOTAL: $" + factura.total.toFixed(2), 150, doc.autoTable.previous.finalY + 10);

    doc.save(`Factura_${factura.id}.pdf`);
  }
}
