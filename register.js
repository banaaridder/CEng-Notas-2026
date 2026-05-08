document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn");
    const senhaInput = document.getElementById("senha");
    
    btn.addEventListener("click", async () => {
        await registrarComFeedback(btn);
    });

    // Atalho com a tecla Enter
    [document.getElementById("usuario"), senhaInput, document.getElementById("confirmar-senha")].forEach(el => {
        el.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btn.click();
            }
        });
    });
});

async function registrarComFeedback(btn) {
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const confirmarInput = document.getElementById("confirmar-senha");
    const mensagemErro = document.getElementById("mensagem-erro");

    // 1. PADRONIZAÇÃO TOTAL (Maiúsculo e sem espaços)
    const usuarioRaw = usuarioInput.value.trim().toUpperCase();
    const senha = senhaInput.value;
    const confirmar = confirmarInput.value;

    // Reset Visual
    mensagemErro.textContent = "";
    mensagemErro.style.opacity = 1;
    btn.className = "btn-feedback salvando";

    // 2. VALIDAÇÕES BÁSICAS
    if (!usuarioRaw || !senha || !confirmar) {
        exibirErro("Preencha todos os campos!", [usuarioInput, senhaInput, confirmarInput]);
        return;
    }

    if (senha !== confirmar) {
        exibirErro("As senhas não conferem!", [confirmarInput]);
        return;
    }

    // 3. LISTA DE ALUNOS AUTORIZADOS
const alunosOficiais = ["ADMIN", "VINHOTE", "WERNEK", "G MARINHO", "BALIELO", "GADI", "CARVALHO NUNES", "PETERSON", "MORALES", "GREGORIO", "LAEDSON", "HERCULANO", "VICTOR CARVALHO", "BRAYAN", "BORGES", "PASTOR", "P GALVÃO", "LINDOLPHO", "HUGO SILVA", "KAJOTHA", "ARRUDA", "TELLES", "CALEBE", "VALIM", "KAWAN", "PAULO SANTOS", "MELLO", "LUCAS SOARES", "L SILVA", "STANLEY", "CLAUDIO FEITOSA", "RENZO", "MORAES", "PEDRO CARVALHO", "BRAGANÇA", "FREIRE", "L ROCHA", "VINICIUS", "ARTHUR SILVA", "NIVALDO", "JEVERSON", "P BATISTA", "CLAUDIO BARBOSA", "HENRIQUE BARBOSA", "FELIX", "KENNEDY", "THIAGO OLIVEIRA", "L COUTINHO", "ALEF CUSTÓDIO", "JOÃO", "MACHADO", "FLÁVIO", "SANTOS", "BONIFÁCIO", "CUSTÓDIO", "NAUAN", "D ALMEIDA", "G OLIVEIRA", "HENRIQUE SOUSA", "CANDIDO", "DANIEL MIRANDA", "MURILO AMANCIO", "DANIEL ANDRADE", "CAMELO", "PEDRO RANGEL", "SAMUEL FERREIRA", "PEDRO COSTA"];

    if (!alunosOficiais.includes(usuarioRaw)) {
        exibirErro("Nome de guerra não autorizado.", [usuarioInput]);
        return;
    }

    try {
        // 4. VERIFICAÇÃO REAL NO BANCO
        // Usamos .maybeSingle() para não disparar erro caso não encontre
        const { data: usuarioExistente, error: erroBusca } = await window.supabaseClient
            .from("usuarios")
            .select("nome")
            .eq("nome", usuarioRaw)
            .maybeSingle();

        if (erroBusca) throw erroBusca;

        if (usuarioExistente) {
            exibirErro("Este aluno já possui conta!", [usuarioInput]);
            return;
        }

        // 5. INSERÇÃO (CRIAR CONTA)
        const { error: erroInsert } = await window.supabaseClient
            .from("usuarios")
            .insert([{ nome: usuarioRaw, senha: senha }]);

        if (erroInsert) throw erroInsert;

        // SUCESSO
        btn.className = "btn-feedback salvo";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        console.error("Erro no Supabase:", error);
        exibirErro("Erro na rede. Tente novamente.", []);
    }

    // Função interna para facilitar a exibição de erros
    function exibirErro(msg, inputs) {
        mensagemErro.textContent = msg;
        btn.className = "btn-feedback erro";
        inputs.forEach(i => i.classList.add("input-erro"));
        
        setTimeout(() => {
            mensagemErro.style.opacity = 0;
            btn.className = "btn-feedback";
            inputs.forEach(i => i.classList.remove("input-erro"));
        }, 2500);
    }
}