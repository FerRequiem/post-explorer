/* ══════════════════════════════════════════════
   SEARCH-BAR.JS
   Input de búsqueda.
   - El debounce vive en app-root (el padre),
     no aquí. Este componente emite el evento
     de inmediato con cada tecla.
   - Patrón: componente "tonto" → solo presenta
     y emite. La lógica la maneja el padre.
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from "lit";
import { resetStyles } from "../styles/shared.js";

class SearchBar extends LitElement {
  static styles = [
    resetStyles,
    css`
      :host {
        display: block;
        flex: 1;
        min-width: 200px;
        max-width: 400px;
      }

      .wrapper {
        position: relative;
      }

      input {
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 13px;
        padding: 9px 36px 9px 14px;
        outline: none;
        border-radius: var(--radius);
        transition: border-color 0.2s;
      }
      input::placeholder {
        color: var(--muted);
      }
      input:focus {
        border-color: var(--accent2);
      }

      .icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--muted);
        font-size: 14px;
        pointer-events: none;
      }

      .clear-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--muted);
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 2px;
      }
      .clear-btn:hover {
        color: var(--accent);
      }
    `,
  ];

  static properties = {
    value: {},
  };

  constructor() {
    super();
    this.value = "";
  }

  _onInput(e) {
    this.value = e.target.value;

    /* Emitir evento custom hacia arriba.
           El padre lo escucha con @search-change=${handler}
           CustomEvent con bubbles:true y composed:true
           para que cruce el Shadow DOM boundary          */
    this.dispatchEvent(
      new CustomEvent("search-change", {
        detail: { query: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _clear() {
    this.value = "";
    this.dispatchEvent(
      new CustomEvent("search-change", {
        detail: { query: "" },
        bubbles: true,
        composed: true,
      }),
    );
    // Enfocar el input después de limpiar
    this.renderRoot.querySelector("input").focus();
  }

  render() {
    return html`
      <div class="wrapper">
        <input
          type="search"
          placeholder="Buscar posts..."
          .value=${this.value}
          @input=${this._onInput}
          aria-label="Buscar posts"
        />
        ${this.value
          ? html`<button
              class="clear-btn"
              @click=${this._clear}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>`
          : html`<span class="icon">⌕</span>`}
      </div>
    `;
  }
}

customElements.define("search-bar", SearchBar);
