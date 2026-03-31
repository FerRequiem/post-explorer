/* ══════════════════════════════════════════════
   API.JS
   Todas las llamadas a JSONPlaceholder viven
   aquí. Los componentes nunca llaman fetch()
   directamente — siempre usan estas funciones.
   Así, si el día de mañana cambia la API,
   solo tocas este archivo.
   ══════════════════════════════════════════════ */

import cache from './cache.js';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * fetch con caché automático.
 * Si la URL ya fue pedida en esta sesión,
 * devuelve el resultado guardado sin ir a la red.
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchWithCache(url) {
    // 1. Intentar caché primero
    const cached = cache.get(url);
    if (cached) {
        console.log(`[cache hit] ${url}`);
        return cached;
    }

    // 2. Si no hay caché, ir a la red
    const res = await fetch(url);

    // 3. Si la respuesta no es 2xx, lanzar error con detalle
    if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText} — ${url}`);
    }

    const data = await res.json();

    // 4. Guardar en caché para futuras llamadas
    cache.set(url, data);

    return data;
}

/* ── Funciones públicas ── */

/**
 * Obtiene todos los posts (100 en total).
 * @returns {Promise<Post[]>}
 */
export async function getPosts() {
    return fetchWithCache(`${BASE_URL}/posts`);
}

/**
 * Obtiene los comentarios de un post específico.
 * @param {number} postId
 * @returns {Promise<Comment[]>}
 */
export async function getComments(postId) {
    return fetchWithCache(`${BASE_URL}/posts/${postId}/comments`);
}

/**
 * Obtiene los datos de un usuario por su ID.
 * @param {number} userId
 * @returns {Promise<User>}
 */
export async function getUser(userId) {
    return fetchWithCache(`${BASE_URL}/users/${userId}`);
}