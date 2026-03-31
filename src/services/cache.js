/* ══════════════════════════════════════════════
   CACHE.JS
   Wrapper sobre sessionStorage.
   - sessionStorage vive mientras el tab esté
     abierto. Al cerrar el tab se borra solo.
   - Evita llamar la misma URL dos veces.
   ══════════════════════════════════════════════ */

const cache = {
    /**
     * Lee un valor del caché.
     * @param {string} key  - normalmente la URL del endpoint
     * @returns {any|null}  - el valor parseado, o null si no existe
     */
    get(key) {
        try {
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            // Si sessionStorage está bloqueado (modo privado estricto),
            // simplemente ignoramos y seguimos sin caché
            return null;
        }
    },

    /**
     * Guarda un valor en el caché.
     * @param {string} key
     * @param {any}    value  - se serializa a JSON automáticamente
     */
    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Si el storage está lleno o bloqueado, fallamos silenciosamente
        }
    },

    /** Borra una entrada específica */
    delete(key) {
        try { sessionStorage.removeItem(key); } catch {}
    },

    /** Borra todo el caché de la app */
    clear() {
        try { sessionStorage.clear(); } catch {}
    }
};

export default cache;