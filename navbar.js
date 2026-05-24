export function carregarNavbar() {

  const navbarHTML = `
    <div class="navbar">

      <div class="nav-item" data-page="index.html">
        <div>🏠</div>
        <small>Home</small>
      </div>

      <div class="nav-item" data-page="manutencao.html">
        <div>🔧</div>
        <small>Manutenção</small>
      </div>

      <div class="nav-item" data-page="inspecao.html">
        <div>🔍</div>
        <small>Inspeção</small>
      </div>

      <div class="nav-item" data-page="tecnico.html">
        <div>👷🏻‍♂️</div>
        <small>Técnico</small>
      </div>

    </div>

    <!-- Botão de Engrenagem Flutuante -->
<button class="btn-flutuante-config" onclick="toggleMenuConfig(event)">
  ⚙️
</button>

<!-- Menu Flutuante de Configurações -->
<div id="menuAcessibilidade" class="menu-acessibilidade" onclick="event.stopPropagation()">
  <div class="opcao-config">
    <span>Modo Escuro:</span>
    <input type="checkbox" id="switchTema" onchange="alternarTema()" style="cursor: pointer;">
  </div>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 4px 0;">
  <div class="opcao-config">
    <span>Fonte:</span>
    <div>
      <button class="btn-controle-fonte" onclick="alterarTamanhoFonte(-1)">A-</button>
      <button class="btn-controle-fonte" onclick="alterarTamanhoFonte(1)">A+</button>
    </div>
  </div>
</div>

  `;

  document.body.insertAdjacentHTML("beforeend", navbarHTML);

  // 🔁 navegação
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const pagina = item.getAttribute("data-page");
      window.location = pagina;
    });
  });

  // ⭐ destacar ativo
  const path = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach(item => {
    const pagina = item.getAttribute("data-page");

    if (path.includes(pagina)) {
      item.classList.add("ativo");
    }
  });

  
}
// ===============================
// MENU FLUTUANTE
// ===============================

window.toggleMenuConfig = function(event) {
  event.stopPropagation();

  const menu = document.getElementById("menuAcessibilidade");

  menu.classList.toggle("ativo");
};

// fechar clicando fora

document.addEventListener("click", () => {
  const menu = document.getElementById("menuAcessibilidade");

  if (menu) {
    menu.classList.remove("ativo");
  }
});

// ===============================
// TEMA ESCURO
// ===============================

window.alternarTema = function() {

  const dark = document.body.classList.toggle("dark-mode");

  localStorage.setItem("temaEscuro", dark);

};

// carregar tema salvo

function carregarTema() {

  const temaSalvo = localStorage.getItem("temaEscuro") === "true";

  if (temaSalvo) {

    document.body.classList.add("dark-mode");

    const switchTema = document.getElementById("switchTema");

    if (switchTema) {
      switchTema.checked = true;
    }

  }

}

// ===============================
// TAMANHO DA FONTE
// ===============================

window.alterarTamanhoFonte = function(valor) {

  let tamanhoAtual =
    parseFloat(localStorage.getItem("fonteTamanho")) || 16;

  tamanhoAtual += valor;

  // limite mínimo e máximo
  if (tamanhoAtual < 12) tamanhoAtual = 12;
  if (tamanhoAtual > 24) tamanhoAtual = 24;

  aplicarTamanhoFonte(tamanhoAtual);

  localStorage.setItem("fonteTamanho", tamanhoAtual);

};

// carregar fonte salva

function carregarFonte() {

  const tamanho =
    parseFloat(localStorage.getItem("fonteTamanho")) || 16;

  aplicarTamanhoFonte(tamanho);

}

function aplicarTamanhoFonte(tamanho) {
  const valor = tamanho + "px";

  document.documentElement.style.fontSize = valor;
  document.documentElement.style.setProperty("--fonte-app", valor);

  if (document.body) {
    document.body.style.fontSize = valor;
  }
}

// ===============================
// INICIALIZAÇÃO
// ===============================

setTimeout(() => {

  carregarTema();
  carregarFonte();

}, 100);
