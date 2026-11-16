// Em desenvolvimento local (ng serve), mantém vazio para usar o fallback http://localhost:8080.
// No container Docker (Nginx), o script docker/gerar-env.sh sobrescreve este arquivo com window.env = { API_URL: "..." }.
window.env = window.env || {};
