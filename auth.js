
document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    const nome = (localStorage.getItem("nomeUsuario") || "").toUpperCase().trim();

    // Se não tiver ID, manda para o login
    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

});