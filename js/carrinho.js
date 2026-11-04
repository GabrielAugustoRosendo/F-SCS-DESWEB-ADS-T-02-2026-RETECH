(function () {
    const db = window.retechDB;
    const acoes = document.querySelector(".acoes-cabecalho");
    if (!db || !acoes) return;

    const formatar = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    function escapar(valor) {
        const elemento = document.createElement("span");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
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
            <small>A finalização registra pedidos pendentes. Nenhum pagamento será cobrado pelo site.</small></div>`;
    document.body.appendChild(janela);

    const lista = janela.querySelector(".carrinho-itens");
    const status = janela.querySelector(".carrinho-status");
    const finalizar = janela.querySelector(".carrinho-finalizar");
    let itens = [];
    let usuarioId = null;
    let geracao = 0;
    let ocupado = false;
    let carregado = false;
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
        botao.setAttribute("aria-expanded", "false");
        botao.focus();
    });

    lista.addEventListener("click", async (evento) => {
        const remover = evento.target.closest(".carrinho-remover");
        if (!remover || ocupado) return;
        const item = itens.find((registro) => String(registro.id) === remover.dataset.id);
        if (!item || !window.confirm(`Tem certeza de que deseja excluir "${item.anuncios?.nome_anuncio || "este item"}" do carrinho?`)) return;
        ocupado = true;
        renderizar();
        try {
            const { error } = await db.from("carrinho").delete().eq("id", item.id).eq("usuario_id", usuarioId);
            if (error) throw error;
            await carregar();
            status.textContent = "Item excluído do carrinho.";
        } catch (erro) {
            status.textContent = "Não foi possível excluir o item. " + (erro.message || "Tente novamente.");
        } finally {
            ocupado = false;
            renderizar();
        }
    });

    finalizar.addEventListener("click", async () => {
        if (finalizar.disabled || ocupado) return;
        if (!window.confirm(`Confirmar pedidos no total de ${formatar(totalCentavos() / 100)}? Nenhum pagamento será cobrado pelo site.`)) return;
        ocupado = true;
        renderizar();
        status.textContent = "Registrando pedidos...";
        try {
            const { data, error } = await db.rpc("finalizar_carrinho", {
                p_anuncio_ids: itens.map((item) => item.anuncio_id),
                p_total_esperado: totalCentavos() / 100
            });
            if (error) throw error;
            if (!data?.length) throw new Error("O servidor não confirmou os pedidos.");
            await carregar();
            status.textContent = `Pedidos registrados: ${data.map((pedido) => "#" + pedido.id).join(", ")}. Status: pendente. Nenhum pagamento foi cobrado.`;
        } catch (erro) {
            try { await carregar(); } catch { /* Mantém a mensagem da operação. */ }
            status.textContent = "Não foi possível confirmar a finalização. " + (erro.message || "Tente novamente.") + " Confira seu carrinho antes de repetir.";
        } finally {
            ocupado = false;
            renderizar();
        }
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
