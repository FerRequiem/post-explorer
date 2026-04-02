/* ══════════════════════════════════════════════
   COMMENTS-PANEL.JS
   Lista de comentarios de un post.
   Recibe: comments[] y author{} como props.
   No hace fetch — solo presenta datos.
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from "lit";
import { resetStyles } from "../styles/shared.js";

class CommentsPanel extends LitElement {
  static properties = {
    comments: {}, // array de comentarios
    author: {}, // objeto del usuario autor del post
  };

  static styles = [
    resetStyles,
    css`
      .author-box {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        margin-bottom: 4px;
      }

      .avatar {
        width: 36px;
        height: 36px;
        background: var(--accent2);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 14px;
        flex-shrink: 0;
      }

      .author-info {
        line-height: 1.4;
      }
      .author-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--text);
      }
      .author-company {
        font-size: 11px;
        color: var(--muted);
      }

      .comments-title {
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--muted);
        padding: 12px 16px 8px;
      }

      .comment {
        padding: 12px 16px;
        border-top: 1px solid var(--border);
      }
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 4px;
        gap: 8px;
      }
      .comment-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--accent2);
      }
      .comment-email {
        font-size: 10px;
        color: var(--muted);
      }
      .comment-body {
        font-size: 12px;
        color: var(--muted);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
    this.comments = [];
    this.author = null;
  }

  render() {
    return html`
      <!-- Datos del autor -->
      ${this.author
        ? html`
            <div class="author-box">
              <div class="avatar">
                ${this.author.name.charAt(0).toUpperCase()}
              </div>
              <div class="author-info">
                <div class="author-name">${this.author.name}</div>
                <div class="author-company">
                  ${this.author.company?.name ?? ""}
                </div>
              </div>
            </div>
          `
        : ""}

      <!-- Lista de comentarios -->
      <div class="comments-title">
        ${this.comments.length}
        comentario${this.comments.length !== 1 ? "s" : ""}
      </div>

      ${this.comments.map(
        (c) => html`
          <div class="comment">
            <div class="comment-header">
              <span class="comment-name">${c.name}</span>
              <span class="comment-email">${c.email}</span>
            </div>
            <p class="comment-body">${c.body}</p>
          </div>
        `,
      )}
    `;
  }
}

customElements.define("comments-panel", CommentsPanel);
