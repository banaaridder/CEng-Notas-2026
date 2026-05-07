document.addEventListener("DOMContentLoaded", () => {
    const nomeUsuario = localStorage.getItem("nomeUsuario");
    const spanUsername = document.getElementById("username");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navLinksDesktop = document.querySelector(".nav-links");
    const spanUsernameMobile = document.getElementById("username-mobile");

    // CONFIGURAÇÃO DE PERMISSÕES
    const listaAdmins = ["ADMIN","P GALVAO", "TELLES", "TEN GABRIEL NOGUEIRA"]; // Quem tem poderes de admin
    const usuarioEhAdmin = listaAdmins.includes(nomeUsuario);

    // Exibe o nome do usuário
    if (nomeUsuario) {
        if (spanUsername) spanUsername.textContent = nomeUsuario;
        if (spanUsernameMobile) spanUsernameMobile.textContent = nomeUsuario;
    }

    // Lógica de RESTRIÇÃO (Esconder abas)
    if (nomeUsuario === "ADMIN") {
        const paginasParaRemover = [];

        const removerLinks = (container) => {
            if (!container) return;
            const links = container.querySelectorAll("a");
            links.forEach(link => {
                if (paginasParaRemover.includes(link.textContent.trim())) {
                    link.remove();
                }
            });
        };

        removerLinks(navLinksDesktop);
        removerLinks(mobileMenu);
    }

    if (nomeUsuario === "ADMIN") {
        
    }

    // Lógica de INJEÇÃO (Botão Painel + Badge)
    // Aplica para todos na listaAdmins (Admin e Davi Costa)
    if (usuarioEhAdmin) {
        
        // --- A. INJETAR LINK DO PAINEL ---
        // Desktop
        if (navLinksDesktop && !navLinksDesktop.querySelector('a[href="admin.html"]')) {
            const linkAdminDesk = document.createElement("a");
            linkAdminDesk.href = "admin.html";
            linkAdminDesk.className = "link-admin-destaque"; // Certifique-se de ter CSS para essa classe se quiser destaque
            linkAdminDesk.style.color = "#ff4757"; // Destaque inline rápido
            linkAdminDesk.innerHTML = '<i class="fa-solid fa-user-shield"></i> Painel';
            navLinksDesktop.append(linkAdminDesk);
        }

        // Mobile
        if (mobileMenu && !mobileMenu.querySelector('a[href="admin.html"]')) {
            const linkAdminMob = document.createElement("a");
            linkAdminMob.href = "admin.html";
            linkAdminMob.style.color = "#ff4757";
            linkAdminMob.innerHTML = '<i class="fa-solid fa-user-shield"></i> Painel Admin';
            mobileMenu.prepend(linkAdminMob);
        }

        // --- B. INJETAR BADGE (DISTINTIVO) ---
        const containerBadgesDesk = document.querySelector(".user-badges");
        const containerBadgesMob = document.querySelector(".user-badges-mobile");

        const badgeAdminHTML = '<span class="badge-pill admin" title="Administrador"><i class="fa-solid fa-crown"></i> ADMIN</span>';

        if (containerBadgesDesk) containerBadgesDesk.innerHTML += badgeAdminHTML;
        if (containerBadgesMob) containerBadgesMob.innerHTML += badgeAdminHTML;
    }
    
});


/* MENU MOBILE */
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
});

menuToggle.addEventListener('click', () => {
    // Alterna a classe 'active' no botão para disparar o CSS do X
    menuToggle.classList.toggle('active');
    
    // Aqui você também pode abrir/fechar seu menu lateral
    // const meuMenu = document.getElementById('navMenu');
    // meuMenu.classList.toggle('open');
});

async function carregarDistintivosHeader() {
    const meuId = localStorage.getItem("usuarioLogado");
    const meuNome = localStorage.getItem("nomeUsuario") || "";
    
    // Identifica os containers reais do seu HTML
    const containerDesktop = document.getElementById("user-badges-header");
    const containerMobile = document.getElementById("user-badges-mobile");
    const containers = [containerDesktop, containerMobile];

    if (!meuId) return;

    // 1. LIMPEZA INICIAL
    containers.forEach(c => { if(c) c.innerHTML = ""; });

    // 2. INJEÇÃO DO DISTINTIVO ADMIN (Para Davi Costa e Admin)
    const admins = ["ADMIN","P GALVAO", "TELLES", "TEN GABRIEL NOGUEIRA"];
    if (admins.includes(meuNome.toUpperCase().trim())) {
        const badgeAdminHTML = '<span class="badge-pill admin" title="Administrador"><i class="fa-solid fa-crown"></i> ADMIN</span>';
        containers.forEach(c => { 
            if(c) c.insertAdjacentHTML('beforeend', badgeAdminHTML); 
        });
    }

    // 3. BUSCA DE DADOS PARA OUTROS DISTINTIVOS (01, Caçador, etc)
    const { data, error } = await window.supabaseClient
        .from("notas")
        .select("usuario_id, media_geral, dados");

    if (error || !data || data.length === 0) return;

    // Funções auxiliares de cálculo
    const calcularPapiro = (item) => {
        const mats = ["tec", "fund", "ciber", "empre", "pt", "racio"];
        let soma = 0, qtd = 0;
        mats.forEach(m => {
            let n = parseFloat(item.dados?.[`media-${m}`]);
            if(!isNaN(n) && n > 0){ soma += n; qtd++; }
        });
        return qtd > 0 ? soma / qtd : 0;
    };

    // Lógica de Identificação de Elites
    const listaGeral = data.filter(i => (i.media_geral || 0) > 0).sort((a,b) => b.media_geral - a.media_geral);
    const maxGeral = listaGeral.length > 0 ? listaGeral[0].media_geral : -1;
    const sou01Geral = listaGeral.some(i => i.usuario_id === meuId && i.media_geral === maxGeral);

    const listaTiro = data.filter(i => (parseFloat(i.dados?.['media-tiro']) || 0) > 0)
                          .sort((a,b) => parseFloat(b.dados['media-tiro']) - parseFloat(a.dados['media-tiro']));
    const maxTiro = listaTiro.length > 0 ? parseFloat(listaTiro[0].dados['media-tiro']) : -1;
    const souCacador = listaTiro.some(i => i.usuario_id === meuId && parseFloat(i.dados['media-tiro']) === maxTiro);

    const listaTfm = data.filter(i => (parseFloat(i.dados?.['media-tfm']) || 0) > 0)
                         .sort((a,b) => parseFloat(b.dados['media-tfm']) - parseFloat(a.dados['media-tfm']));
    const maxTfm = listaTfm.length > 0 ? parseFloat(listaTfm[0].dados['media-tfm']) : -1;
    const souCalcaoPreto = listaTfm.some(i => i.usuario_id === meuId && parseFloat(i.dados['media-tfm']) === maxTfm);

    const listaPapiro = data.map(i => ({ uid: i.usuario_id, nota: calcularPapiro(i) }))
                            .filter(i => i.nota > 0).sort((a,b) => b.nota - a.nota);
    const maxPapiro = listaPapiro.length > 0 ? listaPapiro[0].nota : -1;
    const souPapirao = listaPapiro.some(i => i.uid === meuId && i.nota === maxPapiro);

    // 4. RENDERIZAÇÃO DOS DISTINTIVOS DE CONQUISTA
    const renderizarExtra = (html) => {
        containers.forEach(c => { if(c) c.insertAdjacentHTML('beforeend', html); });
    };

    if (sou01Geral) renderizarExtra('<span class="badge-pill elite"><i class="fa-solid fa-trophy"></i>01 CCom</span>');
    if (souCacador) renderizarExtra('<span class="badge-pill cacador"><i class="fa-solid fa-crosshairs"></i>Caçador</span>');
    if (souCalcaoPreto) renderizarExtra('<span class="badge-pill guerreiro"><i class="fa-solid fa-person-running"></i>Calção Preto</span>');
    if (souPapirao) renderizarExtra('<span class="badge-pill mestre"><i class="fa-solid fa-book-open"></i>Papirão</span>');
}

// Chame a função dentro do seu DOMContentLoaded existente
document.addEventListener("DOMContentLoaded", () => {
    // ... suas outras funções (configurarMediaMobile, carregarNotasDoUsuario, etc)
    carregarDistintivosHeader(); 
}); 


function atualizarBannerMissao() {
    const banner = document.getElementById('bannerContagem');
    const containerTexto = document.getElementById('textoContagem');
    if (!banner || !containerTexto) return;

    const agora = new Date();
    const EVENTOS_CALENDARIO = [
        { nome: "INÍCIO DO CURSO", data: "2026-01-22T00:01:00" },
        { nome: "CARNAVAL", data: "2026-02-14T00:01:00" },
        { nome: "Entrega do Sabre", data: "2026-03-07T00:01:00" },
        { nome: "1° ECD Op Pedra Galena", data: "2026-03-09T00:01:00" },
        { nome: "1° ELD FITCOM", data: "2026-05-11T00:01:00" },
        { nome: "1º SIESP", data: "2026-05-25T00:01:00" },
        { nome: "FÉRIAS", data: "2026-07-13T00:01:00" },
        { nome: "2° ELD Operação Gavião", data: "2026-06-29T00:01:00" },
        { nome: "3° ELD Operação Gavião 2", data: "2026-06-10T00:01:00" },
        { nome: "2º SIESP", data: "2026-09-21T00:01:00" },
        { nome: "FORMATURA", data: "2026-11-21T00:01:00" }
    ];

    let mensagem = "";
    let eventoEncontrado = null;

    // Busca eventos próximos (200 dias)
    for (let ev of EVENTOS_CALENDARIO) {
        const dataEv = new Date(ev.data);
        const diff = Math.ceil((dataEv - agora) / (1000 * 60 * 60 * 24));
        if (diff > 0 && diff <= 200 && ev.nome !== "FORMATURA") {
            eventoEncontrado = `${diff} FORA PARA ${ev.nome}!`;
            break;
        }
    }

    if (!eventoEncontrado) {
        const dataSargento = new Date("2026-11-28T10:00:00");
        const diffS = Math.ceil((dataSargento - agora) / (1000 * 60 * 60 * 24));
        eventoEncontrado = diffS > 0 ? `${diffS} FORA PARA SER SARGENTO!` : "MISSÃO CUMPRIDA!";
    }

    containerTexto.innerHTML = `<i class="fas fa-clock"></i> ${eventoEncontrado}`;
    banner.style.display = 'block';

    // Ajusta as posições logo após mostrar
    setTimeout(ajustarPosicaoSuperior, 50);
}

function ajustarPosicaoSuperior() {
    const banner = document.getElementById('bannerContagem');
    const header = document.querySelector('.header');
    const layout = document.querySelector('.layout, .container-materias, .campos-container');

    if (banner && window.getComputedStyle(banner).display !== 'none') {
        const alturaBanner = banner.offsetHeight;
        
        // Header desce para dar espaço ao banner
        header.style.top = alturaBanner + 'px';
        
        // O conteúdo da página desce (Header + Banner)
        if (layout) {
            const alturaTotal = header.offsetHeight + alturaBanner;
            layout.style.marginTop = (alturaTotal - 50) + 'px';
        }
    } else {
        header.style.top = '0px';
    }
}




// No final da sua função atualizarBannerMissao(), após o display = 'block'
setTimeout(ajustarPosicaoSuperior, 100);

// Também ajuste ao redimensionar a tela (caso o banner mude de altura)
window.onresize = ajustarPosicaoSuperior;

document.addEventListener('DOMContentLoaded', atualizarBannerMissao);

