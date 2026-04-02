/* ══════════════════════════════════════════════
   POST-CARD.JS
   Tarjeta de un post.
   - Recibe el objeto post como prop
   - Al hacer clic, carga comentarios y autor
   - Delega la presentación de comentarios
     a <comments-panel>
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from "lit";
import { getComments, getUser } from "../services/api.js";
import { resetStyles } from "../styles/shared.js";
import "./comments-panel.js";

class PostCard extends LitElement {
  static properties = {
    post: {},
    expanded: { type: Boolean },
    comments: {},
    author: {},
    loading: { type: Boolean },
    error: {},
  };

  static styles = [
    resetStyles,
    css`
      :host {
        display: block;
      }

      .card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        transition:
          box-shadow 0.2s,
          border-color 0.2s;
      }
      .card:hover {
        box-shadow: var(--shadow);
        border-color: var(--muted);
      }
      .card.expanded {
        border-color: var(--accent2);
      }

      /* ── Cabecera clickeable ── */
      .card-header {
        padding: 16px 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        user-select: none;
      }

      .post-id {
        font-size: 10px;
        color: var(--muted);
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .post-title {
        font-family: var(--font-display);
        font-size: 15px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.3;
        margin-bottom: 6px;
        /* Capitalizar primera letra del título */
        text-transform: capitalize;
      }

      .post-excerpt {
        font-size: 12px;
        color: var(--muted);
        line-height: 1.6;
        /* Cortar en 100 chars con CSS por si el JS falla */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .chevron {
        color: var(--muted);
        font-size: 18px;
        flex-shrink: 0;
        transition: transform 0.2s;
        margin-top: 2px;
      }
      .chevron.open {
        transform: rotate(180deg);
        color: var(--accent2);
      }

      /* ── Cuerpo expandible ── */
      .card-body {
        border-top: 1px solid var(--border);
        /* Animación de apertura */
        animation: slideDown 0.2s ease-out;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Loading dentro de la tarjeta ── */
      .inner-loading {
        padding: 24px;
        text-align: center;
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 2px;
      }
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--border);
        border-top-color: var(--accent2);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        vertical-align: middle;
        margin-right: 8px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Error dentro de la tarjeta ── */
      .inner-error {
        padding: 16px 20px;
        color: var(--accent);
        font-size: 12px;
        border-top: 1px solid var(--border);
      }
    `,
  ];

  constructor() {
    super();
    this.post = null;
    this.expanded = false;
    this.comments = [];
    this.author = null;
    this.loading = false;
    this.error = null;
  }

  /* Al hacer clic en la cabecera:
       - Si ya está abierto, solo lo cierra (sin re-fetch)
       - Si está cerrado, carga datos y abre               */
  async _toggle() {
    if (this.expanded) {
      this.expanded = false;
      return;
    }

    this.expanded = true;

    // Si ya tenemos los datos (caché en memoria del componente),
    // no volvemos a llamar la API
    if (this.comments.length > 0) return;

    this.loading = true;
    this.error = null;

    try {
      // Llamadas en paralelo con Promise.all — más rápido que await secuencial
      const [comments, author] = await Promise.all([
        getComments(this.post.id),
        getUser(this.post.userId),
      ]);
      this.comments = comments;
      this.author = author;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (!this.post) return "";

    // Extracto: máximo 100 caracteres
    const excerpt =
      this.post.body.length > 100
        ? this.post.body.slice(0, 100) + "…"
        : this.post.body;

    return html`
      <article class="card ${this.expanded ? "expanded" : ""}">
        <!-- Cabecera clickeable -->
        <div
          class="card-header"
          @click=${this._toggle}
          role="button"
          tabindex="0"
          aria-expanded=${this.expanded}
          @keydown=${(e) => e.key === "Enter" && this._toggle()}
        >
          <div>
            <div class="post-id">
              #${this.post.id} · user ${this.post.userId}
            </div>
            <div class="post-title">${this.post.title}</div>
            <div class="post-excerpt">${excerpt}</div>
          </div>
          <span class="chevron ${this.expanded ? "open" : ""}">⌄</span>
        </div>

        <!-- Contenido expandido -->
        ${this.expanded
          ? html`
              <div class="card-body">
                ${this.loading
                  ? html`
                      <div class="inner-loading">
                        <span class="spinner"></span> Cargando...
                      </div>
                    `
                  : ""}
                ${this.error
                  ? html` <div class="inner-error">⚠ ${this.error}</div> `
                  : ""}
                ${!this.loading && !this.error
                  ? html`
                      <comments-panel
                        .comments=${this.comments}
                        .author=${this.author}
                      ></comments-panel>
                    `
                  : ""}
              </div>
            `
          : ""}
      </article>
    `;
  }
}

customElements.define("post-card", PostCard);
