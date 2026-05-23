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

      <div class="nav-item theme-toggle" id="themeToggle" title="Alternar tema">
        <div id="themeIcon">🌙</div>
        <small id="themeLabel">Tema</small>
      </div>

      <div class="nav-item font-decrease" id="fontDecrease" title="Diminuir fonte">
        <div>A-</div>
        <small>Fonte</small>
      </div>

      <div class="nav-item font-increase" id="fontIncrease" title="Aumentar fonte">
        <div>A+</div>
        <small>Fonte</small>
      </div>

    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", navbarHTML);

  // 🔁 navegação
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const pagina = item.getAttribute("data-page");
      if (pagina) window.location = pagina;
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

  // --- Tema (claro / escuro) e tamanho da fonte
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const themePalettes = {
    light: {
      '--bg': '#f1f3f6',
      '--text': '#111827',
      '--text-muted': '#555555',
      '--primary': '#2196f3',
      '--surface': '#ffffff',
      '--card-bg': '#ffffff',
      '--filter-bg': '#ffffff',
      '--input-bg': '#f9fafb',
      '--input-border': '#d1d5db',
      '--button-bg': '#2196f3',
      '--button-text': '#ffffff',
      '--button-border': '#2196f3',
      '--nav-bg': '#ffffff',
      '--nav-text': '#555',
      '--nav-active': '#2196f3',
      '--nav-border': '#e5e7eb',
      '--topbar-bg': '#1f2937',
      '--topbar-text': '#ffffff',
      '--banner-bg': '#2196f3',
      '--banner-text': '#ffffff'
    },
    dark: {
      '--bg': '#071226',
      '--text': '#e6eef6',
      '--text-muted': '#aab8c2',
      '--primary': '#3aa0ff',
      '--surface': '#0b1220',
      '--card-bg': '#0f1522',
      '--filter-bg': '#0e192f',
      '--input-bg': '#111b2e',
      '--input-border': '#18304f',
      '--button-bg': '#3aa0ff',
      '--button-text': '#ffffff',
      '--button-border': '#3aa0ff',
      '--nav-bg': '#081225',
      '--nav-text': '#aab8c2',
      '--nav-active': '#3aa0ff',
      '--nav-border': '#122232',
      '--topbar-bg': '#081225',
      '--topbar-text': '#e6eef6',
      '--banner-bg': '#1f6fd8',
      '--banner-text': '#ffffff'
    }
  };

  function applyTheme(theme) {
    const palette = themePalettes[theme] || themePalettes.light;
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#081225' : '#1f2937');
  }

  function applyFontSize(scale) {
    const clamped = Math.min(1.4, Math.max(0.8, scale));
    document.body.style.zoom = clamped;
    localStorage.setItem('fontZoom', clamped);
  }

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

  const savedZoom = parseFloat(localStorage.getItem('fontZoom')) || 1;
  applyFontSize(savedZoom);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  const decrease = document.getElementById('fontDecrease');
  const increase = document.getElementById('fontIncrease');
  if (decrease) {
    decrease.addEventListener('click', () => {
      const current = parseFloat(localStorage.getItem('fontZoom')) || 1;
      applyFontSize(current - 0.05);
    });
  }
  if (increase) {
    increase.addEventListener('click', () => {
      const current = parseFloat(localStorage.getItem('fontZoom')) || 1;
      applyFontSize(current + 0.05);
    });
  }
}