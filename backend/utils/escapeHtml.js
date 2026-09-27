// Escapes user-supplied text before it is interpolated into an HTML email body.
const HTML_ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);
