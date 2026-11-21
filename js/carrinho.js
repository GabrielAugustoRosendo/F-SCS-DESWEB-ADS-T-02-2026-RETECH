(function () {
    const db = window.retechDB;
    const acoes = document.querySelector(".acoes-cabecalho");
    if (!db || !acoes) return;

    const formatar = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    function escapar(valor) {
        const elemento = document.createElement("span");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;");
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "carrinho-abrir";
    botao.setAttribute("aria-label", "Abrir carrinho, 0 itens");
    botao.setAttribute("aria-haspopup", "dialog");
    botao.setAttribute("aria-controls", "carrinho-janela");
    botao.setAttribute("aria-expanded", "false");
    botao.innerHTML = '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="carrinho-contador" aria-hidden="true">0</span>';
    acoes.appendChild(botao);

    const janela = document.createElement("dialog");
    janela.id = "carrinho-janela";
    janela.className = "carrinho-janela";
    janela.setAttribute("aria-labelledby", "carrinho-titulo");
    janela.innerHTML = `
        <div class="carrinho-topo"><h2 id="carrinho-titulo">Meu carrinho</h2>
            <button type="button" class="carrinho-fechar" aria-label="Fechar carrinho"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>
        <div class="carrinho-itens"></div>
        <p class="carrinho-status" role="status" aria-live="polite"></p>
        <div class="carrinho-resumo"><p>Total <strong class="carrinho-total">R$ 0,00</strong></p>
            <button type="button" class="botao botao-verde carrinho-finalizar" disabled>Finalizar compra</button>
            <small>Revise os produtos na página de pagamento. A compra é uma simulação, sem cobrança.</small></div>
        <section class="carrinho-confirmacao" aria-labelledby="carrinho-confirmacao-titulo" hidden>
            <p id="carrinho-confirmacao-titulo" role="alert">Você está prestes a remover este produto do carrinho: <strong class="carrinho-confirmacao-nome"></strong></p>
            <div class="carrinho-confirmacao-acoes">
                <button type="button" class="carrinho-confirmar-exclusao">Confirmar exclusão</button>
                <button type="button" class="carrinho-cancelar-exclusao">Cancelar</button>
            </div>
        </section>`;
    document.body.appendChild(janela);

    const lista = janela.querySelector(".carrinho-itens");
    const status = janela.querySelector(".carrinho-status");
    const finalizar = janela.querySelector(".carrinho-finalizar");
    const confirmacao = janela.querySelector(".carrinho-confirmacao");
    const nomeConfirmacao = janela.querySelector(".carrinho-confirmacao-nome");
    const confirmarExclusao = janela.querySelector(".carrinho-confirmar-exclusao");
    const cancelarExclusao = janela.querySelector(".carrinho-cancelar-exclusao");
    let itens = [];
    let usuarioId = null;
    let geracao = 0;
    let ocupado = false;
    let carregado = false;
    let itemPendente = null;
    let botaoRemoverOrigem = null;
    const disponivel = (item) => item.anuncios?.status === "ativo"
        && item.anuncios.tipo_anuncio === "venda" && item.anuncios.usuario_id !== usuarioId
        && Number.isFinite(Number(item.anuncios.preco_anuncio)) && Number(item.anuncios.preco_anuncio) > 0;
    const totalCentavos = () => itens.filter(disponivel).reduce((soma, item) => soma + Math.round(Number(item.anuncios.preco_anuncio) * 100), 0);

    function renderizar() {
        botao.querySelector(".carrinho-contador").textContent = String(itens.length);
        botao.setAttribute("aria-label", `Abrir carrinho, ${itens.length} ${itens.length === 1 ? "item" : "itens"}`);
        janela.querySelector(".carrinho-total").textContent = formatar(totalCentavos() / 100);
        finalizar.disabled = ocupado || !carregado || !itens.length || itens.some((item) => !disponivel(item));
        lista.innerHTML = !usuarioId
            ? '<p>Entre na sua conta para acessar seu carrinho.</p><a class="botao botao-contorno" href="login.html">Entrar</a>'
            : !itens.length ? '<p class="carrinho-vazio">Seu carrinho está vazio.</p>'
                : itens.map((item) => {
                    const anuncio = item.anuncios;
                    const nome = anuncio?.nome_anuncio || "Produto indisponível";
                    return `<article class="carrinho-item">
                        <a class="carrinho-item-link" href="produto.html?id=${encodeURIComponent(item.anuncio_id)}">
                            <img src="${escapar(anuncio?.imagem_url || "imagens/vitrine.jpg")}" alt="">
                            <span><strong>${escapar(nome)}</strong><small>${disponivel(item) ? formatar(anuncio.preco_anuncio) : "Indisponível — remova para continuar"}</small></span></a>
                        <button type="button" class="carrinho-remover" data-id="${escapar(item.id)}" aria-label="Excluir ${escapar(nome)} do carrinho" ${ocupado ? "disabled" : ""}>
                            <i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></article>`;
                }).join("");
    }

    async function carregar() {
        const versao = ++geracao;
        carregado = false;
        finalizar.disabled = true;
        try {
            const { data: auth, error: erroAuth } = await db.auth.getUser();
            if (versao !== geracao) return;
            if (erroAuth && erroAuth.name !== "AuthSessionMissingError") throw erroAuth;
            usuarioId = auth?.user?.id || null;
            if (!usuarioId) {
                itens = [];
                renderizar();
                return;
            }
            const { data, error } = await db.from("carrinho")
                .select("id,anuncio_id,anuncios(id,nome_anuncio,preco_anuncio,imagem_url,tipo_anuncio,status,usuario_id)")
                .eq("usuario_id", usuarioId).order("created_at", { ascending: false });
            if (versao !== geracao) return;
            if (error) throw error;
            itens = data || [];
            carregado = true;
            renderizar();
        } catch (erro) {
            if (versao !== geracao) return;
            finalizar.disabled = true;
            status.textContent = "Não foi possível atualizar o carrinho. " + (erro.message || "Tente novamente.");
            throw erro;
        }
    }

    async function abrir() {
        if (!janela.open) janela.show();
        botao.setAttribute("aria-expanded", "true");
        status.textContent = "Carregando carrinho...";
        try {
            await carregar();
            status.textContent = "";
        } catch { /* A mensagem permanece visível na janela. */ }
    }

    botao.addEventListener("click", () => janela.open ? janela.close() : abrir());
    janela.querySelector(".carrinho-fechar").addEventListener("click", () => janela.close());
    document.addEventListener("click", (evento) => {
        if (janela.open && !janela.contains(evento.target) && !botao.contains(evento.target)) janela.close();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && janela.open) janela.close();
    });
    janela.addEventListener("close", () => {
        confirmacao.hidden = true;
        itemPendente = null;
        botaoRemoverOrigem = null;
        confirmarExclusao.disabled = false;
        cancelarExclusao.disabled = false;
        botao.setAttribute("aria-expanded", "false");
        botao.focus();
    });

    function solicitarConfirmacao(item, origem) {
        itemPendente = item;
        botaoRemoverOrigem = origem;
        nomeConfirmacao.textContent = item.anuncios?.nome_anuncio || "Produto indisponível";
        confirmacao.hidden = false;
        confirmarExclusao.focus();
    }

    function cancelarConfirmacao() {
        const id = itemPendente?.id;
        confirmacao.hidden = true;
        itemPendente = null;
        const origem = botaoRemoverOrigem;
        botaoRemoverOrigem = null;
        const botaoAtual = Array.from(lista.querySelectorAll(".carrinho-remover"))
            .find((elemento) => elemento.dataset.id === String(id));
        (origem?.isConnected ? origem : botaoAtual || janela.querySelector(".carrinho-fechar")).focus();
    }

    cancelarExclusao.addEventListener("click", cancelarConfirmacao);
    confirmarExclusao.addEventListener("click", async () => {
        if (!itemPendente || ocupado) return;
        const item = itemPendente;
        ocupado = true;
        let exclusaoConcluida = false;
        confirmarExclusao.disabled = true;
        cancelarExclusao.disabled = true;
        renderizar();
        try {
            const { data: removido, error } = await db.from("carrinho")
                .delete().eq("id", item.id).eq("usuario_id", usuarioId).select("id").single();
            if (error) throw error;
            if (!removido) throw new Error("Não foi possível confirmar a remoção do produto.");

            itens = itens.filter((registro) => registro.id !== item.id);
            confirmacao.hidden = true;
            itemPendente = null;
            botaoRemoverOrigem = null;
            status.textContent = "Produto removido do carrinho com sucesso.";
            status.dataset.tipo = "sucesso";
            exclusaoConcluida = true;
        } catch (erro) {
            status.textContent = "Não foi possível excluir o produto. " + (erro.message || "Tente novamente.");
            status.dataset.tipo = "erro";
        } finally {
            ocupado = false;
            confirmarExclusao.disabled = false;
            cancelarExclusao.disabled = false;
            renderizar();
            if (exclusaoConcluida) {
                (lista.querySelector(".carrinho-remover") || janela.querySelector(".carrinho-fechar")).focus();
            }
        }
    });

    lista.addEventListener("click", (evento) => {
        const remover = evento.target.closest(".carrinho-remover");
        if (!remover || ocupado) return;
        const item = itens.find((registro) => String(registro.id) === remover.dataset.id);
        if (!item) return;
        status.textContent = "";
        status.dataset.tipo = "";
        solicitarConfirmacao(item, remover);
    });

    finalizar.addEventListener("click", () => {
        if (finalizar.disabled || ocupado) return;
        window.location.href = "pagar.html?itens=" + encodeURIComponent(itens.map((item) => item.anuncio_id).join(","));
    });

    async function adicionar(anuncioId) {
        const { data, error: erroAuth } = await db.auth.getUser();
        if (!data?.user) {
            window.location.href = "login.html";
            return false;
        }
        if (erroAuth) throw erroAuth;
        const { error } = await db.from("carrinho").insert({ usuario_id: data.user.id, anuncio_id: anuncioId });
        if (error && error.code !== "23505") throw error;
        await carregar();
        return true;
    }

    window.retechCarrinho = { abrir, atualizar: carregar, adicionar };
    db.auth.onAuthStateChange((_evento, sessao) => {
        ++geracao;
        usuarioId = sessao?.user?.id || null;
        itens = [];
        renderizar();
        // Sai do callback de Auth antes de fazer novas consultas.
        window.setTimeout(() => carregar().catch(() => {}), 0);
    });
    window.addEventListener("focus", () => carregar().catch(() => {}));
    carregar().catch(() => {});
})();
