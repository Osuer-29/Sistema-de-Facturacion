export function render(container, state, saveState) {
  container.innerHTML = `
    <h2>📑 Cotizaciones</h2>
    <div class="header-actions">
      <input type="text" id="search-cotizaciones" placeholder="🔍 Buscar cotización..." class="search-box">
      <button id="new-quote">➕ Nueva Cotización</button>
    </div>
    <table class="table">
      <thead>
        <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acciones</th></tr>
      </thead>
      <tbody id="cotizaciones-body">
        ${state.cotizaciones.map((q, i) => `
          <tr>
            <td>${q.id}</td>
            <td>${q.cliente.nombre}</td>
            <td>${q.fecha}</td>
            <td>$${q.total.toFixed(2)}</td>
            <td>
              <button class="pdf-btn" data-index="${i}">📄 PDF</button>
              <button class="convert-btn" data-index="${i}">💰 Convertir</button>
              <button class="delete-btn" data-index="${i}">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Modal Cotización -->
    <div id="quote-modal" class="modal hidden">
      <div class="modal-content big">
        <h3>Nueva Cotización</h3>
        <form id="quote-form">
          <div class="form-section">
            <h4>👤 Cliente</h4>
            <select id="cliente" required>
              <option value="">-- Seleccionar Cliente --</option>
              ${state.clientes.map(c => `
                <option value="${c.id}">${c.nombre} - ${c.email}</option>
              `).join("")}
            </select>
          </div>

          <div class="form-section">
            <h4>📦 Productos</h4>
            <div id="productos-list">
              ${state.inventario.map(p => `
                <div class="product-line">
                  <label>
                    <input type="checkbox" value="${p.sku}" data-precio="${p.precio}">
                    ${p.nombre} ($${p.precio})
                  </label>
                  <input type="number" min="1" value="1" class="cantidad hidden">
                </div>
              `).join("")}
            </div>
          </div>

          <div class="form-section">
            <h4>💰 Total: $<span id="total">0.00</span></h4>
          </div>

          <div class="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" id="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmación -->
    <div id="confirm-modal" class="modal hidden">
      <div class="modal-content">
        <h3>⚠️ Confirmación</h3>
        <p>¿Seguro que deseas eliminar esta cotización?</p>
        <div class="modal-actions">
          <button id="confirm-yes">Sí</button>
          <button id="confirm-no">No</button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector("#quote-modal");
  const form = container.querySelector("#quote-form");
  const cancelBtn = container.querySelector("#cancel");
  const confirmModal = container.querySelector("#confirm-modal");
  const confirmYes = container.querySelector("#confirm-yes");
  const confirmNo = container.querySelector("#confirm-no");

  let deletingIndex = null;

  // Abrir modal
  document.getElementById("new-quote").addEventListener("click", () => {
    form.reset();
    modal.classList.remove("hidden");
  });

  // Cerrar modal
  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Selección productos
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

  // Guardar
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
        if (producto) {
          productosSeleccionados.push({ sku, nombre: producto.nombre, precio: producto.precio, cantidad });
        }
      }
    });

    if (productosSeleccionados.length === 0) {
      alert("Selecciona al menos un producto");
      return;
    }

    const total = productosSeleccionados.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    const cotizacion = {
      id: Date.now(),
      cliente,
      productos: productosSeleccionados,
      total,
      fecha: new Date().toLocaleString()
    };

    state.cotizaciones.push(cotizacion);
    saveState();
    render(container, state, saveState);
  });

  // Eliminar
  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deletingIndex = btn.dataset.index;
      confirmModal.classList.remove("hidden");
    });
  });

  confirmYes.addEventListener("click", () => {
    if (deletingIndex !== null) {
      state.cotizaciones.splice(deletingIndex, 1);
      saveState();
      render(container, state, saveState);
    }
  });

  confirmNo.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
    deletingIndex = null;
  });

  // Convertir a factura
  container.querySelectorAll(".convert-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = state.cotizaciones[btn.dataset.index];
      state.facturas.push({ ...q, id: "F" + Date.now() });
      saveState();
      alert("Cotización convertida en factura ✅");
    });
  });

  // PDF
  container.querySelectorAll(".pdf-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = state.cotizaciones[btn.dataset.index];
      generarPDF(q);
    });
  });

  function generarPDF(cotizacion) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("📌 Empresa Ejemplo", 14, 20);
    doc.setFontSize(12);
    doc.text("Cotización #" + cotizacion.id, 150, 20);

    doc.text("Cliente: " + cotizacion.cliente.nombre, 14, 40);
    doc.text("Email: " + cotizacion.cliente.email, 14, 48);
    doc.text("Tel: " + cotizacion.cliente.telefono, 14, 56);
    doc.text("Fecha: " + cotizacion.fecha, 150, 40);

    const rows = cotizacion.productos.map(p => [p.nombre, p.cantidad, "$" + p.precio.toFixed(2), "$" + (p.precio * p.cantidad).toFixed(2)]);
    doc.autoTable({
      head: [["Producto", "Cantidad", "Precio", "Subtotal"]],
      body: rows,
      startY: 70,
    });

    doc.text("TOTAL: $" + cotizacion.total.toFixed(2), 150, doc.autoTable.previous.finalY + 10);

    doc.save(`Cotizacion_${cotizacion.id}.pdf`);
  }

  // Buscador
  const searchInput = container.querySelector("#search-cotizaciones");
  const tbody = container.querySelector("#cotizaciones-body");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    tbody.innerHTML = state.cotizaciones
      .filter(q =>
        q.cliente.nombre.toLowerCase().includes(term) ||
        String(q.id).includes(term)
      )
      .map((q, i) => `
        <tr>
          <td>${q.id}</td>
          <td>${q.cliente.nombre}</td>
          <td>${q.fecha}</td>
          <td>$${q.total.toFixed(2)}</td>
          <td>
            <button class="pdf-btn" data-index="${i}">📄 PDF</button>
            <button class="convert-btn" data-index="${i}">💰 Convertir</button>
            <button class="delete-btn" data-index="${i}">🗑️ Eliminar</button>
          </td>
        </tr>
      `).join("");
  });
}
