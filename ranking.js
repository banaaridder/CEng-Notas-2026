// Variável global para armazenar os IDs dos 01 de cada categoria
let donosBadges = {
    elite: null,   // 01 Geral
    cacador: null, // 01 Tiro
    guerreiro: null, // 01 TFM
    mestre: null   // 01 Papiro (Matérias Teóricas)
};

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o ranking no modo Geral
    carregarRanking("media_geral");

    // Configuração dos botões de filtro (centralizados no CSS)
    const buttons = document.querySelectorAll(".opt-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const materia = btn.getAttribute("data-materia");
            carregarRanking(materia);
        });
    });
});

async function carregarRanking(materiaFiltro = "media_geral") {
    const tbody = document.getElementById("ranking-body");
    const labelMedia = document.getElementById("label-media");
    
    const nomesMaterias = {
        "media_geral": "Média Geral",
        "tfm": "Média TFM",
        "tiro": "Média Tiro",
        "papiro": "Média Papiro"
    };
    if (labelMedia) labelMedia.innerText = nomesMaterias[materiaFiltro];
    
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Sincronizando dados...</td></tr>";

    const { data, error } = await window.supabaseClient
        .from("notas")
        .select(`usuario_id, media_geral, dados, usuarios:usuario_id ( nome )`);

    if (error) {
        console.error(error);
        tbody.innerHTML = "<tr><td colspan='3'>Erro ao conectar com o servidor.</td></tr>";
        return;
    }

    // Resetamos os donos das badges (agora como arrays para suportar empates)
    let donosBadges = { elite: [], cacador: [], guerreiro: [], mestre: [] };

    // Função interna para calcular o Papiro ignorando zeros
    const calcularPapiro = (item) => {
        const mats = ["tec", "fund", "ciber", "empre", "pt", "racio"];
        let soma = 0, qtd = 0;
        mats.forEach(m => {
            let n = parseFloat(item.dados?.[`media-${m}`]);
            if(!isNaN(n) && n > 0){ soma += n; qtd++; }
        });
        return qtd > 0 ? soma / qtd : 0;
    };

    // --- IDENTIFICAÇÃO DOS LÍDERES (COM TRATAMENTO DE EMPATE E NOTA > 0) ---

    // 01 Geral (01 CCom)
    const listaGeral = [...data].filter(i => (i.media_geral || 0) > 0).sort((a,b) => b.media_geral - a.media_geral);
    if(listaGeral.length > 0) {
        const max = listaGeral[0].media_geral;
        donosBadges.elite = listaGeral.filter(i => i.media_geral === max).map(i => i.usuario_id);
    }

    // 01 Tiro (Caçador)
    const listaTiro = [...data].filter(i => (parseFloat(i.dados?.['media-tiro']) || 0) > 0).sort((a,b) => (parseFloat(b.dados?.['media-tiro']) || 0) - (parseFloat(a.dados?.['media-tiro']) || 0));
    if(listaTiro.length > 0) {
        const max = parseFloat(listaTiro[0].dados['media-tiro']);
        donosBadges.cacador = listaTiro.filter(i => parseFloat(i.dados['media-tiro']) === max).map(i => i.usuario_id);
    }

    // 01 TFM (Calção Preto)
    const listaTfm = [...data].filter(i => (parseFloat(i.dados?.['media-tfm']) || 0) > 0).sort((a,b) => (parseFloat(b.dados?.['media-tfm']) || 0) - (parseFloat(a.dados?.['media-tfm']) || 0));
    if(listaTfm.length > 0) {
        const max = parseFloat(listaTfm[0].dados['media-tfm']);
        donosBadges.guerreiro = listaTfm.filter(i => parseFloat(i.dados['media-tfm']) === max).map(i => i.usuario_id);
    }

    // 01 Papiro (Papirão)
    const dadosPapiro = data.map(i => ({ uid: i.usuario_id, nota: calcularPapiro(i) })).filter(i => i.nota > 0).sort((a,b) => b.nota - a.nota);
    if(dadosPapiro.length > 0) {
        const max = dadosPapiro[0].nota;
        donosBadges.mestre = dadosPapiro.filter(i => i.nota === max).map(i => i.uid);
    }

    // --- FILTRAGEM DA LISTA DE EXIBIÇÃO ---
    let listaExibicao = [];
    data.forEach(item => {
        let notaFinal = 0;
        if (materiaFiltro === "media_geral") notaFinal = item.media_geral || 0;
        else if (materiaFiltro === "papiro") notaFinal = calcularPapiro(item);
        else notaFinal = parseFloat(item.dados?.[`media-${materiaFiltro}`]) || 0;

        // Só entra na lista se tiver nota preenchida
        if (notaFinal > 0) {
            listaExibicao.push({
                uid: item.usuario_id,
                nome: item.usuarios?.nome ?? "Usuário",
                nota: notaFinal
            });
        }
    });

    listaExibicao.sort((a, b) => b.nota - a.nota);

    tbody.innerHTML = "";

    if (listaExibicao.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; padding: 20px;'>Nenhum registro encontrado para este ranking.</td></tr>";
        return;
    }

    listaExibicao.forEach((aluno, index) => {
        let badgesHtml = "";
        
        // Verificação usando .includes() por causa do sistema de empate (arrays)
        if (donosBadges.elite.includes(aluno.uid)) 
            badgesHtml += ' <span class="badge-pill elite"><i class="fa-solid fa-trophy"></i> 01 CCom</span>';
        
        if (donosBadges.cacador.includes(aluno.uid)) 
            badgesHtml += ' <span class="badge-pill cacador"><i class="fa-solid fa-crosshairs"></i> Caçador</span>';
        
        if (donosBadges.guerreiro.includes(aluno.uid)) 
            badgesHtml += ' <span class="badge-pill guerreiro"><i class="fa-solid fa-person-running"></i> Calção Preto</span>';
        
        if (donosBadges.mestre.includes(aluno.uid)) 
            badgesHtml += ' <span class="badge-pill mestre"><i class="fa-solid fa-book-open"></i> Papirão</span>';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}º</td>
            <td>${aluno.nome}${badgesHtml}</td>
            <td><strong>${aluno.nota.toFixed(3)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}