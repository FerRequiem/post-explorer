/* ══════════════════════════════════════════════
   STATS-PANEL.JS
   Panel de estadísticas (bonus).
   Recibe todos los posts y calcula:
   - Total de posts
   - Promedio de comentarios (5 por post en
     JSONPlaceholder — dato conocido de la API)
   - Top 3 usuarios con más posts
   ══════════════════════════════════════════════ */

import { LitElement, html, css } from 'lit';

class StatsPanel extends LitElement {

    static properties = {
        posts: {},
    };

    static styles = css`
    :host { display: block; margin-bottom: 24px; }

    .panel {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent2);
      padding: 20px 24px;
      border-radius: var(--radius);
    }

    .panel-title {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--accent2);
      margin-bottom: 18px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 14px 16px;
      border-radius: var(--radius);
    }
    .stat-value {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 1px;
    }

    .top-title {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 10px;
    }

    .top-list { list-style: none; }
    .top-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
    }
    .top-item:last-child { border-bottom: none; }
    .top-rank {
      color: var(--accent2);
      font-weight: 700;
      width: 24px;
      flex-shrink: 0;
    }
    .top-user { color: var(--text); flex: 1; padding: 0 8px; }
    .top-count {
      color: var(--muted);
      font-size: 11px;
    }
  `;

    constructor() {
        super();
        this.posts = [];
    }

    /* Calcula el top 3 usuarios con más posts */
    get _topUsers() {
        // Agrupar posts por userId
        const counts = this.posts.reduce((acc, post) => {
            acc[post.userId] = (acc[post.userId] ?? 0) + 1;
            return acc;
        }, {});

        // Ordenar y tomar los 3 primeros
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([userId, count]) => ({ userId, count }));
    }

    render() {
        if (!this.posts.length) return '';

        // JSONPlaceholder siempre devuelve 5 comentarios por post
        const avgComments = 5;

        return html`
      <div class="panel" role="region" aria-label="Panel de estadísticas">
        <div class="panel-title">▦ Estadísticas</div>

        <!-- Métricas principales -->
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value">${this.posts.length}</div>
            <div class="stat-label">Total de posts</div>
          </div>
          <div class="stat">
            <div class="stat-value">${this.posts.length * avgComments}</div>
            <div class="stat-label">Total comentarios</div>
          </div>
          <div class="stat">
            <div class="stat-value">${avgComments}</div>
            <div class="stat-label">Promedio / post</div>
          </div>
          <div class="stat">
            <div class="stat-value">
              ${new Set(this.posts.map(p => p.userId)).size}
            </div>
            <div class="stat-label">Usuarios únicos</div>
          </div>
        </div>

        <!-- Top usuarios -->
        <div class="top-title">Top 3 usuarios más activos</div>
        <ul class="top-list">
          ${this._topUsers.map((u, i) => html`
            <li class="top-item">
              <span class="top-rank">#${i + 1}</span>
              <span class="top-user">User ${u.userId}</span>
              <span class="top-count">${u.count} posts</span>
            </li>
          `)}
        </ul>
      </div>
    `;
    }
}

customElements.define('stats-panel', StatsPanel);