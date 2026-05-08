let filtroCorAtual = 'todos';
const supabaseAdmin = window.supabaseClient;

// --- SEGURANÇA MÁXIMA (admin.js) ---
(function() {
    const id = localStorage.getItem("usuarioLogado");
    const nome = (localStorage.getItem("nomeUsuario") || "").toUpperCase().trim();
    const permitidos = ["ADMIN","P GALVÃO", "TELLES"];

    // Se não tiver ID (não está logado) ou o nome não for permitido
    if (!id || !permitidos.includes(nome)) {
        console.error("Acesso negado para:", nome);
        window.location.replace("index.html"); // Usa replace para não deixar voltar no botão 'voltar'
        return;
    }
    console.log("Acesso Admin confirmado para:", nome);
})();
// ---------------------------------------------

const alunosOficiais = ["VINHOTE", "WERNEK", "G MARINHO", "BALIELO", "GADI", "CARVALHO NUNES", "PETERSON", "MORALES", "GREGORIO", "LAEDSON", "HERCULANO", "VICTOR CARVALHO", "BRAYAN", "BORGES", "PASTOR", "P GALVÃO", "LINDOLPHO", "HUGO SILVA", "KAJOTHA", "ARRUDA", "TELLES", "CALEBE", "VALIM", "KAWAN", "PAULO SANTOS", "MELLO", "LUCAS SOARES", "L SILVA", "STANLEY", "CLAUDIO FEITOSA", "RENZO", "MORAES", "PEDRO CARVALHO", "BRAGANÇA", "FREIRE", "L ROCHA", "VINICIUS", "ARTHUR SILVA", "NIVALDO", "JEVERSON", "P BATISTA", "CLAUDIO BARBOSA", "HENRIQUE BARBOSA", "FELIX", "KENNEDY", "THIAGO OLIVEIRA", "L COUTINHO", "ALEF CUSTÓDIO", "JOÃO", "MACHADO", "FLÁVIO", "SANTOS", "BONIFÁCIO", "CUSTÓDIO", "NAUAN", "D ALMEIDA", "G OLIVEIRA", "HENRIQUE SOUSA", "CANDIDO", "DANIEL MIRANDA", "MURILO AMANCIO", "DANIEL ANDRADE", "CAMELO", "PEDRO RANGEL", "SAMUEL FERREIRA"];

const TABELAS_TFM = {
    corrida: [{aa:660,ac:645,nota:10},{aa:697,ac:680,nota:8.5},{aa:733,ac:716,nota:7},{aa:757,ac:740,nota:6},{aa:820,ac:791,nota:3.5}],
    flexao: [{aa:41,ac:42,nota:10},{aa:35,ac:36,nota:8.5},{aa:29,ac:30,nota:7},{aa:25,ac:26,nota:6},{aa:15,ac:16,nota:3.5}],
    barra: [{aa:10,ac:12,nota:10},{aa:8,ac:9,nota:8.5},{aa:6,ac:7,nota:7},{aa:5,ac:6,nota:6},{aa:2,ac:3,nota:3.5}],
    // Substitua a linha da natacao dentro de TABELAS_TFM por esta:
natacao: [
        { aa: 17, ac: 15, nota: 10 }, { aa: 21, ac: 19, nota: 8.5 }, 
        { aa: 26, ac: 24, nota: 7 }, { aa: 32, ac: 30, nota: 6 }, { aa: 54, ac: 52, nota: 3.5 }
    ],
    corda: [{aa:1,ac:1,nota:10}],
    ppm: [{aa:1,ac:1,nota:10}]
};

function calcularNotaTFM(tipo, valor, modalidade) {
    if (!valor || isNaN(valor) || valor <= 0) return 0;
    const tabela = TABELAS_TFM[modalidade];
    if (!tabela) return 0;
    if (modalidade === 'corda' || modalidade === 'ppm') return valor >= 1 ? 10 : 0;
    let nota = 0;
    for (let ref of tabela) {
        if (modalidade === 'corrida' || modalidade === 'natacao') {
            if (valor <= ref[tipo]) { nota = ref.nota; break; }
        } else {
            if (valor >= ref[tipo]) { nota = ref.nota; break; }
        }
    }
    return nota;
}

async function carregarDados() {
    try {
        const { data: usuarios } = await supabaseAdmin.from("usuarios").select("id, nome");
        const { data: notas } = await supabaseAdmin.from("notas").select("*");
        
        const mapaUsuarios = {};
        usuarios.forEach(u => mapaUsuarios[u.id] = u.nome.toUpperCase().trim());
        
        const restritos = ["ADMIN", "DAVI COSTA"];
        const apenasAlunos = usuarios.filter(u => !restritos.includes(u.nome.toUpperCase().trim()));
        document.getElementById("total-alunos").textContent = apenasAlunos.length;
        document.getElementById("total-notas").textContent = notas.length;
        
        window.dadosUsuarios = mapaUsuarios;
        window.dadosNotas = notas;
        
        gerarCards(mapaUsuarios, notas);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function gerarCards(mapaUsuarios, notas, filtro = "") {
    const grid = document.getElementById("grid-alunos");
    if (!grid) return;
    grid.innerHTML = "";
    
    // 1. Filtra primeiro pela busca de texto (Nome)
    const alunosFiltradosPorNome = alunosOficiais.filter(nome => 
        nome.toUpperCase().includes(filtro.toUpperCase())
    );

    alunosFiltradosPorNome.forEach(alunoNome => {
        const registro = notas.find(n => mapaUsuarios[n.usuario_id] === alunoNome.toUpperCase().trim());
        const mediaGeral = registro ? parseFloat(registro.media_geral) : null;
        
        // 2. Determina a cor do status baseado na nota
        let corStatus = "vazio"; // Padrão para quem não tem nota
        if (mediaGeral !== null && !isNaN(mediaGeral)) {
            if (mediaGeral >= 8.0) corStatus = "verde";
            else if (mediaGeral > 6.0) corStatus = "amarelo";
            else corStatus = "vermelho";
        }

        // 3. Aplica o Filtro de Cor selecionado pelos botões
        if (filtroCorAtual === 'todos' || filtroCorAtual === corStatus) {
            const card = document.createElement("div");
            // Adiciona a classe status-cor para a borda lateral
            card.className = `card-aluno status-${corStatus}`;
            
            card.addEventListener('click', () => {
                abrirModal(alunoNome, registro || null);
            });

            card.innerHTML = `
                <div class="card-header-resumido">
                    <h3>${alunoNome}</h3>
                    <div class="media-badge ${corStatus}">${registro?.media_geral || "--"}</div>
                </div>
                <p class="click-info">Clique para ver detalhes</p>`;
            grid.appendChild(card);
        }
    });
}
// Lógica de Busca
document.getElementById("filtroAluno").addEventListener("input", (e) => {
    gerarCards(window.dadosUsuarios, window.dadosNotas, e.target.value);
});

function abrirModal(nome, registro) {
    const modal = document.getElementById("modalAluno");
    const lista = document.getElementById("modalListaNotas");
    const badgeModal = document.getElementById("modalMediaBadge"); 
    
    if (!modal || !lista) return;

    document.getElementById("modalNomeAluno").textContent = nome;

    if (!registro || !registro.dados) {
        lista.innerHTML = "<p class='vazio'>Nenhum lançamento encontrado para este aluno.</p>";
        if (badgeModal) {
            badgeModal.textContent = "--";
            badgeModal.classList.remove("verde", "amarelo", "vermelho");
        }
        modal.style.display = "flex";
        return;
    }

    // --- LÓGICA DE COR DO BADGE ---
    const mediaGeral = registro.media_geral || "--";
    if (badgeModal) {
        badgeModal.textContent = typeof mediaGeral === 'number' ? mediaGeral.toFixed(3) : mediaGeral;
        badgeModal.classList.remove("verde", "amarelo", "vermelho");
        if (mediaGeral !== "--") {
            const notaNum = parseFloat(mediaGeral);
            if (notaNum >= 8.0) badgeModal.classList.add("verde");
            else if (notaNum > 6.0) badgeModal.classList.add("amarelo");
            else badgeModal.classList.add("vermelho");
        }
    }

    const d = registro.dados;
    let htmlFinal = "";

    // Helper para processar notas de provas teóricas (Acertos/Total)
    const processarProva = (idAcertos, idTotal, label) => {
        const ac = parseFloat(d[idAcertos]), tot = parseFloat(d[idTotal]);
        if (!isNaN(ac) && !isNaN(tot) && tot > 0) {
            const nota = (ac / tot) * 10;
            return { valida: true, valor: nota, html: `<div class="sub-nota"><span>${label}</span><span><span class="nota-valor">${nota.toFixed(2)}</span><span class="detalhe"> (${ac}/${tot})</span></span></div>` };
        }
        return { valida: false };
    };

    const gerarMateriaComMedia = (titulo, provasConfig) => {
        let htmlProvas = "", soma = 0, count = 0;
        provasConfig.forEach(p => {
            const res = processarProva(p.ac, p.tot, p.label);
            if (res.valida) { htmlProvas += res.html; soma += res.valor; count++; }
        });
        return htmlProvas ? `<div class="secao-modal"><div class="secao-header"><span>${titulo}</span><span class="badge-media-item gold">${(soma / count).toFixed(2)}</span></div>${htmlProvas}</div>` : "";
    };

    // --- 1. TÉCNICAS MILITARES (Sincronizado com os novos IDs) ---
    htmlFinal += gerarMateriaComMedia("Técnicas Militares 1", [
        { label: "AA1", ac: "acertos-tec1-aa1", tot: "total-tec1-aa1" }, 
        { label: "AA2", ac: "acertos-tec1-aa2", tot: "total-tec1-aa2" }, 
        { label: "AC", ac: "acertos-tec1-ac", tot: "total-tec1-ac" }
    ]);

    htmlFinal += gerarMateriaComMedia("Técnicas Militares 2", [
        { label: "AC", ac: "acertos-tec2-ac", tot: "total-tec2-ac" }
    ]);

    htmlFinal += gerarMateriaComMedia("Técnicas Militares 3", [
        { label: "AA1", ac: "acertos-tec3-aa1", tot: "total-tec3-aa1" }, 
        { label: "AA2", ac: "acertos-tec3-aa2", tot: "total-tec3-aa2" }, 
        { label: "AC", ac: "acertos-tec3-ac", tot: "total-tec3-ac" }
    ]);

    // --- 2. EMPREGO DA ENGENHARIA ---
    htmlFinal += gerarMateriaComMedia("Emprego da Engenharia", [
        { label: "AC", ac: "acertos-empre-ac", tot: "total-empre-ac" }
    ]);

    // --- 3. ENSINO (PAPIRO) ---
    htmlFinal += gerarMateriaComMedia("Matérias de Ensino", [
        { label: "Português", ac: "acertos-pt-ac", tot: "total-pt-ac" }, 
        { label: "Lógica", ac: "acertos-racio-ac", tot: "total-racio-ac" }, 
        { label: "Didática", ac: "acertos-didat-ac", tot: "total-didat-ac" }
    ]);

    // --- 4. TIRO ---
    let tiroHtml = "", sTiro = 0, cTiro = 0;
    // IDs: tiro-aa (Pst), tiro-ac1 (Fz AA), tiro-ac2 (Fz AC)
    const provasTiro = [
        { id: "tiro-aa", label: "Pst (Pontos)" },
        { id: "tiro-ac1", label: "Fz AA" },
        { id: "tiro-ac2", label: "Fz AC" }
    ];
    provasTiro.forEach(t => {
        const v = parseFloat(d[t.id]);
        if (!isNaN(v)) { 
            sTiro += v; cTiro++; 
            tiroHtml += `<div class="sub-nota"><span>${t.label}</span><span class="nota-valor">${v}</span></div>`; 
        }
    });
    if (tiroHtml) htmlFinal += `<div class="secao-modal"><div class="secao-header"><span>Tiro</span><span class="badge-media-item gold">${(sTiro / cTiro).toFixed(2)}</span></div>${tiroHtml}</div>`;

    // --- 5. TFM (Completo) ---
    let tfmHtml = "", sTfm = 0, cTfm = 0;
    const mods = [
        { id: 'corrida', l: 'Corrida', t: true },
        { id: 'flexao', l: 'Flexão', t: false, u: 'Reps' },
        { id: 'barra', l: 'Barra', t: false, u: 'Reps' },
        { id: 'natacao', l: 'Natação', t: true },
        { id: 'corda', l: 'Corda', t: false, u: 'm' },
        { id: 'ppm', l: 'PPM', t: true }
    ];

    mods.forEach(m => {
        const vAA = d[`${m.id}-aa`], vAC = d[`${m.id}-ac`];
        if (vAA || vAC) {
            const nAA = calcularNotaTFM('aa', vAA, m.id) || 0;
            const nAC = calcularNotaTFM('ac', vAC, m.id) || 0;
            
            let divisor = 0;
            if (vAA) divisor++;
            if (vAC) divisor++;
            
            const mediaMod = (nAA + nAC) / divisor;
            sTfm += mediaMod; cTfm++;

            tfmHtml += `<div class="linha-tfm-detalhe">
                <strong>${m.l}</strong>
                <div class="tfm-bruto">
                    AA: ${vAA || '--'} <span class="laranja">(${nAA.toFixed(1)})</span> | 
                    AC: ${vAC || '--'} <span class="laranja">(${nAC.toFixed(1)})</span>
                </div>
            </div>`;
        }
    });
    if (tfmHtml) htmlFinal += `<div class="secao-modal"><div class="secao-header"><span>TFM</span><span class="badge-media-item gold">${(sTfm / cTfm).toFixed(2)}</span></div>${tfmHtml}</div>`;

    // --- 6. EXTRAS ---
    htmlFinal += `<div class="secao-modal">
        <div class="secao-header"><span>Conceito & Extras</span></div>
        <div class="linha-extra">Básico: <strong>${d["nota-bas"] || '--'}</strong></div>
        <div class="linha-extra">TCC: <strong>${d["nota-tcc"] || '--'}</strong></div>
        <div class="linha-extra">Conceito: <strong>${d["nota-conceito"] || '--'}</strong></div>
    </div>`;

    lista.innerHTML = htmlFinal;
    modal.style.display = "flex";
}

function exportarParaExcel() {
    if (!window.dadosNotas || window.dadosNotas.length === 0) {
        alert("Nenhum dado disponível para exportar.");
        return;
    }

    const dadosPlanilha = window.dadosNotas.map(nota => {
        const d = nota.dados || {};
        
        // Helper para formatar campos de tempo (mm:ss)
        const fmtT = (val) => {
            if (!val) return "--";
            return val; // Já está salvo como string mm:ss no snapshot
        };

        // Helper para calcular nota de acertos (Acertos / Total * 10)
        const calcNota = (ac, tot) => {
            const numAc = parseFloat(d[ac]);
            const numTot = parseFloat(d[tot]);
            if (isNaN(numAc) || isNaN(numTot) || numTot === 0) return 0;
            return ((numAc / numTot) * 10).toFixed(2);
        };

        return {
            "Nome de Guerra": window.dadosUsuarios[nota.usuario_id] || "NÃO ENCONTRADO",
            "Média Geral": parseFloat(nota.media_geral || 0).toFixed(3),
            
            // --- TFM ---
            "Corrida AA": fmtT(d["corrida-aa"]),
            "Corrida AC": fmtT(d["corrida-ac"]),
            "Flexão AA": d["flexao-aa"] || 0,
            "Flexão AC": d["flexao-ac"] || 0,
            "Barra AA": d["barra-aa"] || 0,
            "Barra AC": d["barra-ac"] || 0,
            "Natação AA": fmtT(d["natacao-aa"]),
            "Natação AC": fmtT(d["natacao-ac"]),
            "Corda AA": d["corda-aa"] || 0,
            "Corda AC": d["corda-ac"] || 0,
            "PPM AA": fmtT(d["ppm-aa"]),
            "PPM AC": fmtT(d["ppm-ac"]),

            // --- TIRO ---
            "Tiro Pst (Pontos)": d["tiro-aa"] || 0,
            "Tiro Fz AA": d["tiro-ac1"] || 0,
            "Tiro Fz AC": d["tiro-ac2"] || 0,

            // --- MATÉRIAS AC/TOTAL ---
            "Básico": d["nota-bas"] || 0,
            "Tec Mil 1 AA1": calcNota("acertos-tec1-aa1", "total-tec1-aa1"),
            "Tec Mil 1 AA2": calcNota("acertos-tec1-aa2", "total-tec1-aa2"),
            "Tec Mil 1 AC": calcNota("acertos-tec1-ac", "total-tec1-ac"),
            
            "Tec Mil 2 AC": calcNota("acertos-tec2-ac", "total-tec2-ac"),
            
            "Emprego Eng AC": calcNota("acertos-empre-ac", "total-empre-ac"),
            
            "Tec Mil 3 AA1": calcNota("acertos-tec3-aa1", "total-tec3-aa1"),
            "Tec Mil 3 AA2": calcNota("acertos-tec3-aa2", "total-tec3-aa2"),
            "Tec Mil 3 AC": calcNota("acertos-tec3-ac", "total-tec3-ac"),
            
            "Português AC": calcNota("acertos-pt-ac", "total-pt-ac"),
            "Raciocínio Lógico AC": calcNota("acertos-racio-ac", "total-racio-ac"),
            "Didática AC": calcNota("acertos-didat-ac", "total-didat-ac"),
            
            "TCC": d["nota-tcc"] || 0,
            "Conceito": d["nota-conceito"] || 0
        };
    });

    // Gerar planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Notas");

    // Ajuste automático de largura das colunas
    const colWidths = Object.keys(dadosPlanilha[0]).map(key => ({ wch: key.length + 5 }));
    worksheet['!cols'] = colWidths;

    // Nome do arquivo com data
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(workbook, `Relatorio_Engenharia_${dataAtual}.xlsx`);
}

// Inicialização e Eventos
document.addEventListener("DOMContentLoaded", () => {
    // Esconde o modal imediatamente ao carregar
    const modal = document.getElementById("modalAluno");
    if (modal) modal.style.display = "none";
    
    // Inicia carregamento
    carregarDados();

    // Eventos de fechar
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }

    window.onclick = (e) => { 
        if (e.target == modal) modal.style.display = "none"; 
    };
});


function filtrarPorCor(cor) {
    filtroCorAtual = cor;
    
    // Atualiza o visual dos botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const btnAtivo = document.querySelector(`.filter-btn.${cor === 'todos' ? 'all' : cor}`);
    if (btnAtivo) btnAtivo.classList.add('active');
    
    // Dispara a atualização do grid mantendo o que estiver escrito na busca por nome
    const termoBusca = document.getElementById("filtroAluno").value;
    gerarCards(window.dadosUsuarios, window.dadosNotas, termoBusca);
}




// Função auxiliar para pegar a média das badges no modal
function extrairMedia(secoes, busca) {
    let nota = 0;
    secoes.forEach(s => {
        if (s.innerText.includes(busca)) {
            const badge = s.querySelector(".badge-media-item");
            if (badge) nota = parseFloat(badge.innerText);
        }
    });
    return nota;
}