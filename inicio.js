export function render(container, state, saveState) {
  container.innerHTML = `
    <h1>🏠 Bienvenido al Sistema de Facturación</h1>
    <p>Selecciona un módulo para comenzar:</p>
    <div class="modules-grid">
      <a href="#" class="module-card" data-module="inventario">
        <i class="fa-solid fa-box"></i>
        <h3>Inventario</h3>
      </a>
      <a href="#" class="module-card" data-module="facturacion">
        <i class="fa-solid fa-file-invoice-dollar"></i>
        <h3>Facturación</h3>
      </a>
      <a href="#" class="module-card" data-module="clientes">
        <i class="fa-solid fa-users"></i>
        <h3>Clientes</h3>
      </a>
      <a href="#" class="module-card" data-module="cotizaciones">
        <i class="fa-solid fa-file-signature"></i>
        <h3>Cotizaciones</h3>
      </a>
      <a href="#" class="module-card" data-module="cuentas_cobrar">
        <i class="fa-solid fa-hand-holding-dollar"></i>
        <h3>Cuentas por Cobrar</h3>
      </a>
      <a href="#" class="module-card" data-module="cuentas_pagar">
        <i class="fa-solid fa-money-check-dollar"></i>
        <h3>Cuentas por Pagar</h3>
      </a>
      <a href="#" class="module-card" data-module="ingresos">
        <i class="fa-solid fa-arrow-trend-up"></i>
        <h3>Ingresos</h3>
      </a>
      <a href="#" class="module-card" data-module="gastos">
        <i class="fa-solid fa-arrow-trend-down"></i>
        <h3>Gastos</h3>
      </a>
    </div>
  `;

  // Navegación desde las tarjetas
  container.querySelectorAll(".module-card").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const module = card.dataset.module;
      import(`./${module}.js`).then(mod => {
        mod.render(container, state, saveState);
      });
    });
  });
}
