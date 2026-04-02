/* ══════════════════════════════════════════════
   APP-ROOT.JS
   Componente raíz. Es el "cerebro" de la app:
   - Carga los posts al iniciar
   - Guarda el estado global (posts, búsqueda, página)
   - Pasa datos hacia abajo (props)
   - Escucha eventos que suben desde los hijos
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from "lit";
import { getPosts } from "./services/api.js";
import { resetStyles } from "./styles/shared.js";
import "./components/theme-toggle.js";
import "./components/search-bar.js";
import "./components/post-card.js";
import "./components/stats-panel.js";

/* Cuántos posts mostrar por página */
const PAGE_SIZE = 10;

/* Debounce manual — sin librerías
   Retarda la ejecución de fn hasta que paren
   de llamarla por `delay` milisegundos        */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

class AppRoot extends LitElement {
  /* ── Estado del componente ──
       Cada propiedad aquí es reactiva: cuando
       cambia, Lit re-renderiza solo las partes
       del template que la usan.                */
  static properties = {
    posts: {}, // todos los posts de la API
    filtered: {}, // posts después de aplicar búsqueda
    query: {}, // texto del buscador
    page: { type: Number },
    loading: { type: Boolean },
    error: {},
    showStats: { type: Boolean },
  };

  static styles = [
    resetStyles,
    css`
      :host {
        display: block;
        min-height: 100vh;
        max-height: 100dvh;
      }

      /* ── Layout principal ── */
      .app {
        max-width: 900px;
        margin: 0 auto;
        padding: 32px 20px 80px;
        min-height: inherit;
        max-height: 100dvh;
        display: flex;
        flex-direction: column;
      }

      /* ── Header ── */
      header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 36px;
        gap: 16px;
        flex-wrap: wrap;
      }
      .brand {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 800;
        color: var(--text);
        letter-spacing: -1px;
      }
      .brand span {
        color: var(--accent);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* ── Botón stats ── */
      .btn-stats {
        background: none;
        border: 1px solid var(--border);
        color: var(--muted);
        padding: 6px 14px;
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 1px;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.2s;
      }
      .btn-stats:hover,
      .btn-stats.active {
        border-color: var(--accent2);
        color: var(--accent2);
      }

      /* ── Toolbar (búsqueda + contador) ── */
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 12px;
        flex-wrap: wrap;
      }
      .count {
        font-size: 11px;
        color: var(--muted);
        letter-spacing: 1px;
        white-space: nowrap;
      }
      .count strong {
        color: var(--accent);
      }

      /* ── Grid de posts ── */
      .posts-grid {
        display: grid;
        gap: 12px;
        overflow: auto;
        padding-right: 4px;
        min-height: 0;
      }

      /* ── Estado de carga ── */
      .skeletons {
        display: grid;
        gap: 12px;
      }
      .skeleton {
        height: 88px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        position: relative;
        overflow: hidden;
      }
      /* Efecto shimmer animado */
      .skeleton::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.06) 50%,
          transparent 100%
        );
        animation: shimmer 1.4s infinite;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      /* ── Error ── */
      .error-box {
        border: 1px solid var(--accent);
        padding: 16px 20px;
        color: var(--accent);
        font-size: 13px;
        margin-bottom: 20px;
      }

      /* ── Sin resultados ── */
      .empty {
        text-align: center;
        padding: 60px 0;
        color: var(--muted);
        font-size: 13px;
      }

      /* ── Paginación ── */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 32px;
        flex-wrap: wrap;
      }
      .page-btn {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        width: 36px;
        height: 36px;
        font-family: var(--font-mono);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .page-btn:hover {
        border-color: var(--accent2);
        color: var(--accent2);
      }
      .page-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }
      .page-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    `,
  ];

  constructor() {
    super();
    // Inicializamos todas las propiedades reactivas
    this.posts = [];
    this.filtered = [];
    this.query = "";
    this.page = 1;
    this.loading = true;
    this.error = null;
    this.showStats = false;

    // Creamos el debounce UNA sola vez en el constructor
    // para no recrearlo en cada render
    this._debouncedSearch = debounce((q) => {
      this.query = q;
      this.page = 1; // volver a la página 1 al buscar
      this.filtered = this._filterPosts(q);
    }, 300);
  }

  /* connectedCallback → se ejecuta cuando el componente
       se monta en el DOM. Equivale a useEffect(()=>{}, []) en React */
  async connectedCallback() {
    super.connectedCallback();
    await this._loadPosts();
  }

  /* Carga inicial de posts */
  async _loadPosts() {
    this.loading = true;
    this.error = null;
    try {
      const data = await getPosts();
      this.posts = data;
      this.filtered = data;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  /* Filtra posts por título o cuerpo */
  _filterPosts(query) {
    if (!query.trim()) return this.posts;
    const q = query.toLowerCase();
    return this.posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
  }

  /* Handler del evento 'search-change' que emite <search-bar> */
  _onSearch(e) {
    this._debouncedSearch(e.detail.query);
  }

  /* Calcula los posts de la página actual */
  get _paginated() {
    const start = (this.page - 1) * PAGE_SIZE;
    return this.filtered.slice(start, start + PAGE_SIZE);
  }

  /* Total de páginas */
  get _totalPages() {
    return Math.ceil(this.filtered.length / PAGE_SIZE);
  }

  /* Renderiza los botones de paginación */
  _renderPagination() {
    if (this._totalPages <= 1) return "";
    const pages = Array.from({ length: this._totalPages }, (_, i) => i + 1);
    return html`
      <div class="pagination" role="navigation" aria-label="Paginación">
        <button
          class="page-btn"
          ?disabled=${this.page === 1}
          @click=${() => {
            this.page--;
            window.scrollTo(0, 0);
          }}
          aria-label="Página anterior"
        >
          ←
        </button>

        ${pages.map(
          (p) => html`
            <button
              class="page-btn ${this.page === p ? "active" : ""}"
              @click=${() => {
                this.page = p;
                window.scrollTo(0, 0);
              }}
              aria-current=${this.page === p ? "page" : "false"}
            >
              ${p}
            </button>
          `,
        )}

        <button
          class="page-btn"
          ?disabled=${this.page === this._totalPages}
          @click=${() => {
            this.page++;
            window.scrollTo(0, 0);
          }}
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>
    `;
  }

  /* ── render() ──
       Se llama cada vez que cambia una propiedad reactiva.
       Lit hace diff y solo actualiza lo que cambió.       */
  render() {
    return html`
      <div class="app">
        <!-- Header -->
        <header>
          <div class="brand">Post<span>Explorer</span></div>
          <div class="header-actions">
            <button
              class="btn-stats ${this.showStats ? "active" : ""}"
              @click=${() => (this.showStats = !this.showStats)}
            >
              ${this.showStats ? "✕ Cerrar stats" : "▦ Estadísticas"}
            </button>
            <!-- theme-toggle emite un evento que maneja él mismo
                 (escribe en html[data-theme] y localStorage)    -->
            <theme-toggle></theme-toggle>
          </div>
        </header>

        <!-- Panel de estadísticas (bonus) -->
        ${this.showStats
          ? html` <stats-panel .posts=${this.posts}></stats-panel> `
          : ""}

        <!-- Error global -->
        ${this.error
          ? html`
              <div class="error-box" role="alert">
                ⚠ ${this.error}
                <button @click=${this._loadPosts}>Reintentar</button>
              </div>
            `
          : ""}

        <!-- Toolbar -->
        <div class="toolbar">
          <!-- search-bar emite el evento 'search-change' -->
          <search-bar @search-change=${this._onSearch}></search-bar>
          <span class="count">
            <strong>${this.filtered.length}</strong> / ${this.posts.length}
            posts
          </span>
        </div>

        <!-- Skeletons mientras carga -->
        ${this.loading
          ? html`
              <div class="skeletons">
                ${Array(PAGE_SIZE)
                  .fill(0)
                  .map(() => html`<div class="skeleton"></div>`)}
              </div>
            `
          : ""}

        <!-- Sin resultados -->
        ${!this.loading && this.filtered.length === 0
          ? html`
              <div class="empty">
                No se encontraron posts para "<strong>${this.query}</strong>"
              </div>
            `
          : ""}

        <!-- Grid de posts -->
        ${!this.loading
          ? html`
              <div class="posts-grid">
                ${this._paginated.map(
                  (post) => html`
                    <!-- .post=${post} → prop baja al hijo
                   el punto (.) indica binding de propiedad JS,
                   no atributo HTML                              -->
                    <post-card .post=${post}></post-card>
                  `,
                )}
              </div>
              ${this._renderPagination()}
            `
          : ""}
      </div>
    `;
  }
}

customElements.define("app-root", AppRoot);
