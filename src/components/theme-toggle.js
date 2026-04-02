/* ══════════════════════════════════════════════
   THEME-TOGGLE.JS
   Botón que alterna entre tema claro y oscuro.
   - Lee/escribe en localStorage para persistir
   - Pone data-theme="dark" en <html>
   - No necesita comunicarse con app-root porque
     actúa directamente sobre el DOM global
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from "lit";
import { resetStyles } from "../styles/shared.js";

class ThemeToggle extends LitElement {
  static properties = {
    dark: { type: Boolean },
  };

  static styles = [
    resetStyles,
    css`
      button {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        width: 38px;
        height: 38px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s;
        border-radius: var(--radius);
      }
      button:hover {
        border-color: var(--accent);
      }
    `,
  ];

  constructor() {
    super();
    // Leer preferencia guardada. Si no hay nada,
    // usar la preferencia del sistema operativo
    const saved = localStorage.getItem("theme");
    if (saved) {
      this.dark = saved === "dark";
    } else {
      this.dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    // Aplicar el tema inmediatamente al cargar
    this._applyTheme();
  }

  _applyTheme() {
    document.documentElement.setAttribute(
      "data-theme",
      this.dark ? "dark" : "light",
    );
    localStorage.setItem("theme", this.dark ? "dark" : "light");
  }

  _toggle() {
    this.dark = !this.dark;
    this._applyTheme();
  }

  render() {
    return html`
      <button
        @click=${this._toggle}
        aria-label="${this.dark
          ? "Cambiar a modo claro"
          : "Cambiar a modo oscuro"}"
        title="${this.dark ? "Modo claro" : "Modo oscuro"}"
      >
        ${this.dark ? "☀️" : "🌙"}
      </button>
    `;
  }
}

customElements.define("theme-toggle", ThemeToggle);
