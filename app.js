// Estado global usando LocalStorage
let state = {
  inventario: JSON.parse(localStorage.getItem("inventario") || "[]"),
  clientes: JSON.parse(localStorage.getItem("clientes") || "[]"),
  facturas: JSON.parse(localStorage.getItem("facturas") || "[]"),
  cotizaciones: JSON.parse(localStorage.getItem("cotizaciones") || "[]"),
  cuentas_cobrar: JSON.parse(localStorage.getItem("cuentas_cobrar") || "[]"),
  cuentas_pagar: JSON.parse(localStorage.getItem("cuentas_pagar") || "[]"),
  ingresos: JSON.parse(localStorage.getItem("ingresos") || "[]"),
  gastos: JSON.parse(localStorage.getItem("gastos") || "[]"),
};

function saveState() {
  for (const key in state) {
    localStorage.setItem(key, JSON.stringify(state[key]));
  }
}




// Contenedor principal
const content = document.getElementById("content");

// Cargar módulos dinámicamente
async function loadModule(moduleName) {
  const module = await import(`./modules/${moduleName}.js`);
  module.render(content, state, saveState);
}

// === Navegación Sidebar ===
document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const module = link.dataset.module;
    loadModule(module);
  });
});

// === Navegación Tarjetas en la pantalla principal ===
document.addEventListener("click", (e) => {
  const card = e.target.closest(".module-card");
  if (card) {
    e.preventDefault();
    const module = card.dataset.module;
    loadModule(module);
  }
});

// Mostrar inicio al cargar la página
loadModule("inicio");
