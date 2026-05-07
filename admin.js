let filtroCorAtual = 'todos';
const supabaseAdmin = window.supabaseClient;

// --- SEGURANÇA MÁXIMA (admin.js) ---
(function() {
    const id = localStorage.getItem("usuarioLogado");
    const nome = (localStorage.getItem("nomeUsuario") || "").toUpperCase().trim();
    const permitidos = ["ADMIN","P GALVAO", "TELLES"];

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
    const badgeModal = document.getElementById("modalMediaBadge"); // Referência ao badge do modal
    
    if (!modal || !lista) return;

    document.getElementById("modalNomeAluno").textContent = nome;

    // Se não houver registro, mostra aviso e abre o modal
    if (!registro || !registro.dados) {
        lista.innerHTML = "<p class='vazio'>Nenhum lançamento encontrado para este aluno.</p>";
        badgeModal.textContent = "--";
        badgeModal.classList.remove("verde", "amarelo", "vermelho"); // Limpa cores se estiver vazio
        modal.style.display = "flex";
        return;
    }

    // --- LÓGICA DE COR DO BADGE  ---
    const mediaGeral = registro.media_geral || "--";
    badgeModal.textContent = mediaGeral;
    
    // Limpa classes anteriores para não acumular
    badgeModal.classList.remove("verde", "amarelo", "vermelho");
    
    // Aplica a classe baseada na nota
    if (mediaGeral !== "--") {
        const notaNum = parseFloat(mediaGeral);
        if (notaNum >= 8.0) badgeModal.classList.add("verde");
        else if (notaNum > 6.0) badgeModal.classList.add("amarelo");
        else badgeModal.classList.add("vermelho");
    }
    // ----------------------------------------------

    const d = registro.dados;
    let htmlFinal = "";

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

    const gerarMateriaSemMedia = (titulo, provasConfig) => {
        let htmlProvas = "";
        provasConfig.forEach(p => {
            const res = processarProva(p.ac, p.tot, p.label);
            if (res.valida) { htmlProvas += res.html; }
        });
        return htmlProvas ? `<div class="secao-modal"><div class="secao-header"><span>${titulo}</span></div>${htmlProvas}</div>` : "";
    };

    htmlFinal += gerarMateriaComMedia("Técnicas Militares", [{ label: "AA1", ac: "acertos-tec-aa1", tot: "total-tec-aa1" }, { label: "AA2", ac: "acertos-tec-aa2", tot: "total-tec-aa2" }, { label: "AC", ac: "acertos-tec-ac", tot: "total-tec-ac" }]);
    htmlFinal += gerarMateriaComMedia("Fundamentos", [{ label: "AA", ac: "acertos-fund-aa", tot: "total-fund-aa" }, { label: "AC", ac: "acertos-fund-ac", tot: "total-fund-ac" }]);
    htmlFinal += gerarMateriaComMedia("Cibernética", [{ label: "AA1", ac: "acertos-ciber-aa1", tot: "total-ciber-aa1" }, { label: "AA2", ac: "acertos-ciber-aa2", tot: "total-ciber-aa2" }, { label: "AC", ac: "acertos-ciber-ac", tot: "total-ciber-ac" }]);
    htmlFinal += gerarMateriaComMedia("Emprego das Com", [{ label: "AA", ac: "acertos-empre-aa", tot: "total-empre-aa" }, { label: "AC", ac: "acertos-empre-ac", tot: "total-empre-ac" }]);
    htmlFinal += gerarMateriaSemMedia("Ensino", [{ label: "Português", ac: "acertos-pt-ac", tot: "total-pt-ac" }, { label: "Lógica", ac: "acertos-racio-ac", tot: "total-racio-ac" }, { label: "Didática", ac: "acertos-didat-ac", tot: "total-didat-ac" }]);

    let tiroHtml = "", sTiro = 0, cTiro = 0;
    ["aa", "ac1", "ac2"].forEach(t => {
        const v = parseFloat(d[`tiro-${t}`]);
        if (!isNaN(v)) { sTiro += v; cTiro++; tiroHtml += `<div class="sub-nota"><span>${t.toUpperCase()}</span><span class="nota-valor">${v.toFixed(2)}</span></div>`; }
    });
    if (tiroHtml) htmlFinal += `<div class="secao-modal"><div class="secao-header"><span>Tiro</span><span class="badge-media-item gold">${(sTiro / cTiro).toFixed(2)}</span></div>${tiroHtml}</div>`;

    let tfmHtml = "", sTfm = 0, cTfm = 0;
    const mods = [
        { id: 'corrida', l: 'Corrida', t: true },
        { id: 'flexao', l: 'Flexão', t: false, u: 'Reps' },
        { id: 'barra', l: 'Barra', t: false, u: 'Reps' },
        { id: 'natacao', l: 'Natação', t: true },
        { id: 'corda', l: 'Corda', t: false, u: '' },
        { id: 'ppm', l: 'PPM', t: false, u: '' }
    ];

    mods.forEach(m => {
        const vAA = parseFloat(d[`${m.id}-aa`]), vAC = parseFloat(d[`${m.id}-ac`]);
        if (!isNaN(vAA) || !isNaN(vAC)) {
            const nAA = calcularNotaTFM('aa', vAA, m.id);
            const nAC = calcularNotaTFM('ac', vAC, m.id);
            const mediaMod = (nAA + nAC) / ((vAA > 0 ? 1 : 0) + (vAC > 0 ? 1 : 0));
            sTfm += mediaMod; cTfm++;

            const formatarV = (val) => {
                if (!val || val <= 0) return "00:00";
                if (m.t) {
                    let s = val.toFixed(2).replace('.', ':');
                    if (s.indexOf(':') === 1) s = '0' + s;
                    return s;
                }
                return `${val} ${m.u}`.trim();
            };

            tfmHtml += `<div class="linha-tfm-detalhe"><strong>${m.l}</strong><div class="tfm-bruto">AA: ${formatarV(vAA)} <span class="laranja">(${nAA.toFixed(1)})</span> | AC: ${formatarV(vAC)} <span class="laranja">(${nAC.toFixed(1)})</span></div></div>`;
        }
    });
    if (tfmHtml) htmlFinal += `<div class="secao-modal"><div class="secao-header"><span>TFM</span><span class="badge-media-item gold">${(sTfm / cTfm).toFixed(2)}</span></div>${tfmHtml}</div>`;

    htmlFinal += `<div class="secao-modal"><div class="secao-header"><span>Conceito & Extras</span></div><div class="linha-extra">Básico: <strong>${d["nota-bas"] || '--'}</strong></div><div class="linha-extra">TCC: <strong>${d["nota-tcc"] || '--'}</strong></div><div class="linha-extra">Conceito: <strong>${d["nota-conceito"] || '--'}</strong></div></div>`;

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
        const fmtT = (val) => {
            if(!val) return "--";
            let s = parseFloat(val).toFixed(2).replace('.', ':');
            return s.indexOf(':') === 1 ? '0' + s : s;
        };

        return {
            "Nome de Guerra": window.dadosUsuarios[nota.usuario_id] || "NÃO ENCONTRADO",
            "Média Geral": nota.media_geral || 0,
            "Corrida AA": fmtT(d["corrida-aa"]),
            "Corrida AC": fmtT(d["corrida-ac"]),
            "Flexão AA": d["flexao-aa"] || 0,
            "Flexão AC": d["flexao-ac"] || 0,
            "Barra AA": d["barra-aa"] || 0,
            "Barra AC": d["barra-ac"] || 0,
            "Natação AA": fmtT(d["natacao-aa"]),
            "Natação AC": fmtT(d["natacao-ac"]),
            "Tiro Pst": (parseFloat(d["tiro-aa"])/4 || 0).toFixed(3),
            "Tiro Fz AA": d["tiro-ac1"] || "--",
            "Tiro Fz AC": d["tiro-ac2"] || "--",
            "Tec. Mil AA1": (parseFloat(d["acertos-tec-aa1"])/parseFloat(d["total-tec-aa1"])*10 || 0).toFixed(2),
            "Tec. Mil AC": (parseFloat(d["acertos-tec-ac"])/parseFloat(d["total-tec-ac"])*10 || 0).toFixed(2),
            "Português": (parseFloat(d["acertos-pt-ac"])/parseFloat(d["total-pt-ac"])*10 || 0).toFixed(2),
            "Lógica": (parseFloat(d["acertos-racio-ac"])/parseFloat(d["total-racio-ac"])*10 || 0).toFixed(2),
            "Didática": (parseFloat(d["acertos-didat-ac"])/parseFloat(d["total-didat-ac"])*10 || 0).toFixed(2),
            "Básico": d["nota-bas"] || "--",
            "TCC": d["nota-tcc"] || "--",
            "Conceito": d["nota-conceito"] || "--"
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notas Alunos");
    const colWidths = Object.keys(dadosPlanilha[0]).map(key => ({ wch: key.length + 5 }));
    worksheet['!cols'] = colWidths;
    const dataAtual = new Date().toLocaleDateString().replace(/\//g, '-');
    XLSX.writeFile(workbook, `Relatorio_Notas_Monitorizacao_${dataAtual}.xlsx`);
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