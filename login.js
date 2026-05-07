document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnLogin");
    const senhaInput = document.getElementById("senha");
    btn.addEventListener("click", async () => {
        await loginComFeedback(btn);
    });

    senhaInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            // Evita comportamentos padrão e clica no botão
            e.preventDefault();
            btn.click();
        }
    });

});

async function loginComFeedback(btn) {
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const mensagemErro = document.getElementById("mensagem-erro");

    // Reset visual
    mensagemErro.textContent = "";
    mensagemErro.style.opacity = 1;
    usuarioInput.classList.remove("input-erro");
    senhaInput.classList.remove("input-erro");
    btn.className = "btn-feedback salvando";

    const usuario = usuarioInput.value.trim();
    const usuarioDigitado = usuarioInput.value.trim().toUpperCase();
    const senha = senhaInput.value;

    // Validação campos vazios
    let erro = false;
    if (!usuario) { usuarioInput.classList.add("input-erro"); erro = true; }
    if (!senha) { senhaInput.classList.add("input-erro"); erro = true; }
    if (erro) {
        mensagemErro.textContent = "Preencha todos os campos";
        btn.className = "btn-feedback erro";
        resetErroFade(btn, [usuarioInput, senhaInput], mensagemErro, 1000);
        return;
    }

    // Verificar usuário no Supabase
    const { data, error } = await window.supabaseClient
        .from("usuarios")
        .select("*")
        .eq("nome", usuarioDigitado)
        .maybeSingle();

    if (error || !data) {
        mensagemErro.textContent = "Usuário não encontrado";
        btn.className = "btn-feedback erro";
        resetErroFade(btn, [usuarioInput, senhaInput], mensagemErro, 1000);
        return;
    }

    if (data.senha !== senha) {
        mensagemErro.textContent = "Senha incorreta";
        btn.className = "btn-feedback erro";
        resetErroFade(btn, [senhaInput], mensagemErro, 1000);
        return;
    }

// Login bem-sucedido
    btn.className = "btn-feedback salvo";
    localStorage.setItem("usuarioLogado", data.id);
    const nomeFormatado = data.nome.toUpperCase().trim();
    localStorage.setItem("nomeUsuario", nomeFormatado);

    setTimeout(() => {
        // REDIRECIONAMENTO CORRIGIDO
        const admins = ["ADMIN", "DAVI COSTA"];
        
        if (admins.includes(nomeFormatado)) {
            console.log("Redirecionando Admin...");
            window.location.href = "admin.html";
        } else {
            console.log("Redirecionando Aluno...");
            window.location.href = "index.html";
        }
    }, 700);
}

// Função para resetar botão e inputs com fade
function resetErroFade(btn, inputs = [], mensagem, tempo = 1000) {
    setTimeout(() => {
        mensagem.style.transition = "opacity 0.5s";
        mensagem.style.opacity = 0;
        btn.className = "btn-feedback";

        inputs.forEach(input => input.classList.remove("input-erro"));

        // Limpa mensagem após animação
        setTimeout(() => {
            mensagem.textContent = "";
            mensagem.style.opacity = 1;
        }, 500);
    }, tempo);
}
