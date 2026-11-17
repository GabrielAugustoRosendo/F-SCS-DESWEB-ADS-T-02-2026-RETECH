(function () {
    const formulario = document.getElementById("formulario-pagamento");
    if (!formulario) return;
    const campos = document.getElementById("pagamento-campos");
    const cartao = document.getElementById("pagamento-cartao");
    const pix = document.getElementById("pagamento-pix");
    const status = document.getElementById("pagamento-status");
    const metodos = { pix: "Pix", credito: "cartão de crédito", debito: "cartão de débito" };
    let metodo = "pix";
    const db = window.retechDB;
    const confirmar = document.getElementById("pagamento-simular");
    const atualizar = document.getElementById("pagamento-atualizar");
    const carregamento = document.getElementById("pagamento-carregamento");
    const lista = document.getElementById("pagamento-itens");
    const formatar = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const parametro = new URLSearchParams(window.location.search).get("itens");
    const ids = parametro?.split(",") || [];
    const selecaoValida = ids.length > 0 && ids.length <= 100 && ids.every((id) => /^[1-9]\d*$/.test(id)) && new Set(ids).size === ids.length;
    let itens = [];
    let total = 0;
    let usuarioId = null;
    let pronto = false;
    let ocupado = false;
    let concluido = false;

    async function carregarCompra() {
        if (ocupado || concluido) return;
        pronto = false;
        confirmar.disabled = true;
        atualizar.disabled = true;
        lista.replaceChildren();
        document.getElementById("pagamento-total").textContent = "—";
        carregamento.textContent = "Carregando produtos...";
        try {
            if (!db) throw new Error("A conexão não carregou. Atualize a página.");
            if (!selecaoValida) throw new Error("Selecione os produtos no carrinho ou use Comprar Agora.");
            const { data: auth, error: erroAuth } = await db.auth.getUser();
            if (erroAuth || !auth?.user) throw new Error("Entre na sua conta para continuar a compra.");
            usuarioId = auth.user.id;
            const { data, error } = await db.from("carrinho")
                .select("anuncio_id,anuncios(id,nome_anuncio,imagem_url,preco_anuncio,status,tipo_anuncio,usuario_id)")
                .eq("usuario_id", usuarioId).in("anuncio_id", ids);
            if (error) throw error;
            if (data?.length !== ids.length) throw new Error("O carrinho mudou ou a compra já foi registrada. Confira Meus pedidos antes de tentar novamente.");
            itens = data;
            if (itens.some(({ anuncios: a }) => !a || a.status !== "ativo" || a.tipo_anuncio !== "venda" || a.usuario_id === usuarioId || !Number.isFinite(Number(a.preco_anuncio)) || Number(a.preco_anuncio) <= 0)) {
                throw new Error("Um produto ficou indisponível. Revise seu carrinho.");
            }
            total = itens.reduce((soma, item) => soma + Math.round(Number(item.anuncios.preco_anuncio) * 100), 0) / 100;
            itens.forEach(({ anuncios: a }) => {
                const link = document.createElement("a");
                link.className = "compra-item";
                link.href = "produto.html?id=" + encodeURIComponent(a.id);
                const imagem = document.createElement("img");
                imagem.src = a.imagem_url || "imagens/vitrine.jpg";
                imagem.alt = "";
                const texto = document.createElement("span");
                const nome = document.createElement("strong");
                nome.textContent = a.nome_anuncio;
                const preco = document.createElement("span");
                preco.textContent = formatar(a.preco_anuncio);
                texto.append(nome, preco);
                link.append(imagem, texto);
                lista.appendChild(link);
            });
            document.getElementById("pagamento-total").textContent = formatar(total);
            pronto = true;
            carregamento.textContent = "";
        } catch (erro) {
            carregamento.textContent = erro.message || "Não foi possível carregar a compra.";
        } finally {
            confirmar.disabled = !pronto;
            atualizar.disabled = false;
        }
    }
    atualizar.addEventListener("click", carregarCompra);


    const validade = document.getElementById("pagamento-validade");
    validade.addEventListener("input", (evento) => {
        // Formata a digitação e a colagem, sem validar mês ou ano.
        if (evento.inputType?.startsWith("delete")) return;
        if (/^\d{2}/.test(validade.value) && validade.value[2] !== "/") {
            const posicao = validade.selectionStart;
            validade.value = validade.value.slice(0, 2) + "/" + validade.value.slice(2, 4);
            if (posicao !== null) validade.setSelectionRange(posicao >= 2 ? posicao + 1 : posicao, posicao >= 2 ? posicao + 1 : posicao);
        }
    });

    formulario.querySelectorAll('input[name="metodo"]').forEach((opcao) => {
        opcao.addEventListener("change", () => {
            metodo = opcao.value;
            pix.hidden = metodo !== "pix";
            cartao.hidden = metodo === "pix";
            cartao.disabled = metodo === "pix";
            status.textContent = "";
            document.getElementById("cartao-titulo").textContent = `Dados do ${metodos[metodo]}`;
            document.getElementById("pagamento-resumo-metodo").textContent = metodos[metodo];
            document.getElementById("pagamento-simular").textContent = `Confirmar compra simulada com ${metodos[metodo]}`;
            formulario.querySelectorAll('input[type="text"], input[type="password"]').forEach((campo) => campo.removeAttribute("aria-invalid"));
        });
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        if (ocupado || concluido || !pronto) return;
        // Verifica exclusivamente o comprimento: sem CPF, Luhn, formato ou data.
        const ids = ["pagamento-cpf"];
        if (metodo !== "pix") ids.push("pagamento-nome", "pagamento-numero", "pagamento-validade", "pagamento-cvv");
        let primeiroInvalido = null;
        const erros = [];
        ids.forEach((id) => {
            const campo = document.getElementById(id);
            const tamanho = campo.value.length;
            const valido = tamanho >= campo.minLength && tamanho <= campo.maxLength;
            campo.setAttribute("aria-invalid", String(!valido));
            if (!valido) {
                primeiroInvalido ||= campo;
                const rotulo = formulario.querySelector(`label[for="${id}"]`).textContent;
                erros.push(`${rotulo}: ${campo.minLength === campo.maxLength ? campo.minLength : `${campo.minLength} a ${campo.maxLength}`} caracteres.`);
            }
        });
        status.textContent = erros.length
            ? erros.join(" ")
            : `Campos com o comprimento esperado para ${metodos[metodo]}. Esta é uma simulação: nenhum pagamento foi realizado.`;
        if (primeiroInvalido) { primeiroInvalido.focus(); return; }
        ocupado = true;
        campos.disabled = true;
        atualizar.disabled = true;
        status.textContent = "Registrando compra simulada...";
        try {
            const { data: auth, error: erroAuth } = await db.auth.getUser();
            if (erroAuth || auth?.user?.id !== usuarioId) throw new Error("Sua sessão mudou. Entre novamente e atualize os produtos.");
            // Apenas IDs e total são enviados. CPF e cartão nunca saem do formulário.
            const { data, error } = await db.rpc("finalizar_carrinho", {
                p_anuncio_ids: itens.map((item) => item.anuncio_id),
                p_total_esperado: total
            });
            if (error) throw error;
            if (!Array.isArray(data) || !data.length) throw new Error("O servidor não confirmou o registro.");
            concluido = true;
            status.textContent = "Pedido registrado. Nenhum pagamento foi cobrado.";
            formulario.querySelectorAll('input[type="text"], input[type="password"]').forEach((campo) => { campo.value = ""; });
            window.retechCarrinho?.atualizar().catch(() => {});
            window.location.href = "perfil.html#meus-pedidos";
        } catch (erro) {
            pronto = false;
            status.textContent = "Não foi possível confirmar a compra. " + (erro.message || "Verifique sua conexão.") + " Consulte Meus pedidos antes de repetir; se não houver registro, atualize os produtos.";
        } finally {
            ocupado = false;
            campos.disabled = concluido;
            confirmar.disabled = concluido || !pronto;
            atualizar.disabled = concluido;
        }
    });
    // Os campos só ficam disponíveis após impedir a submissão real do formulário.
    campos.disabled = false;
    carregarCompra();
})();
