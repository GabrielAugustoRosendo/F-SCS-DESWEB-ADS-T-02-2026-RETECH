(function () {
    if (!document.body.classList.contains("pagina-inicio")) return;
    const vendas = document.getElementById("inicio-vendas");
    const reutilizacao = document.getElementById("inicio-reutilizacao");
    const statusVendas = document.getElementById("inicio-vendas-status");
    const statusCircular = document.getElementById("inicio-circular-status");
    const contagens = Array.from(document.querySelectorAll("[data-categoria-contagem]"));
    const colunas = "id,nome_anuncio,descricao_anuncio,imagem_url,preco_anuncio,estado,tipo_anuncio,status,created_at,categorias(nome,slug)";
    let atualizando = false;
    let controlador = null;
    let intervalo = null;
    let encerrada = false;

    function mensagem(grade, texto, convidar) {
        delete grade.dataset.assinatura;
        const caixa = document.createElement("div");
        caixa.className = "inicio-vazio";
        const icone = document.createElement("i");
        icone.className = "fa-solid fa-box-open";
        icone.setAttribute("aria-hidden", "true");
        const paragrafo = document.createElement("p");
        paragrafo.textContent = texto;
        caixa.append(icone, paragrafo);
        if (convidar) {
            const link = document.createElement("a");
            link.href = "anunciar.html";
            link.className = "botao botao-verde";
            link.textContent = "Anunciar um produto";
            caixa.appendChild(link);
        }
        grade.replaceChildren(caixa);
    }

    function renderizar(resultado, grade, status, circular) {
        if (resultado.status === "rejected" || resultado.value.error) {
            mensagem(grade, "Não foi possível carregar os anúncios. Verifique sua conexão e tente novamente.", false);
            const repetir = document.createElement("button");
            repetir.type = "button";
            repetir.className = "botao botao-contorno";
            repetir.textContent = "Tentar novamente";
            repetir.addEventListener("click", () => atualizar());
            grade.firstElementChild.appendChild(repetir);
            status.textContent = "Falha ao carregar os anúncios.";
            return;
        }
        // Defesa adicional; o filtro principal e o limite estão na consulta SQL via API.
        const limite = circular ? 3 : 4;
        const anuncios = (resultado.value.data || [])
            .filter((item) => item.status === "ativo" && (circular ? ["doacao", "troca"].includes(item.tipo_anuncio) : item.tipo_anuncio === "venda"))
            .slice(0, limite);
        const assinatura = JSON.stringify(anuncios);
        if (grade.dataset.assinatura === assinatura) {
            status.textContent = anuncios.length ? `${anuncios.length} ${anuncios.length === 1 ? "anúncio disponível" : "anúncios disponíveis"}.` : "";
            return;
        }
        if (!anuncios.length) {
            mensagem(grade, circular
                ? "Ainda não há doações ou trocas por aqui. Seu eletrônico pode começar essa história."
                : "Ainda não temos produtos anunciados. Que tal publicar o primeiro?", true);
        } else {
            const foco = grade.contains(document.activeElement) ? document.activeElement?.getAttribute("href") : null;
            grade.replaceChildren(...anuncios.map((item) => window.retechCriarCard(item, {}, { inicio: true })));
            if (foco) {
                Array.from(grade.querySelectorAll("a")).find((link) => link.getAttribute("href") === foco)?.focus({ preventScroll: true });
            }
        }
        grade.dataset.assinatura = assinatura;
        status.textContent = anuncios.length ? `${anuncios.length} ${anuncios.length === 1 ? "anúncio disponível" : "anúncios disponíveis"}.` : "";
    }

    async function atualizar(silencioso = false) {
        if (atualizando || encerrada) return;
        const db = window.retechDB;
        if (!db || typeof window.retechCriarCard !== "function") {
            [vendas, reutilizacao].forEach((grade) => {
                grade.setAttribute("aria-busy", "false");
                mensagem(grade, "Não foi possível conectar ao catálogo. Atualize a página para tentar novamente.", false);
            });
            statusVendas.textContent = statusCircular.textContent = "Serviço temporariamente indisponível.";
            return;
        }
        atualizando = true;
        controlador = new AbortController();
        const tempoLimite = window.setTimeout(() => controlador?.abort(), 15000);
        [vendas, reutilizacao].forEach((grade) => grade.setAttribute("aria-busy", "true"));
        if (!silencioso) {
            statusVendas.textContent = "Carregando anúncios recentes…";
            statusCircular.textContent = "Carregando doações e trocas…";
        }
        const consulta = (tipos, limite) => db.from("anuncios").select(colunas)
            .eq("status", "ativo").in("tipo_anuncio", tipos)
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .limit(limite).abortSignal(controlador.signal);
        try {
            const resultados = await Promise.allSettled([
                consulta(["venda"], 4),
                consulta(["doacao", "troca"], 3),
                ...contagens.map((campo) => db.from("anuncios")
                    .select("id,categorias!inner(slug)", { count: "exact", head: true })
                    .eq("status", "ativo").eq("tipo_anuncio", "venda")
                    .eq("categorias.slug", campo.dataset.categoriaContagem).abortSignal(controlador.signal))
            ]);
            if (encerrada) return;
            renderizar(resultados[0], vendas, statusVendas, false);
            renderizar(resultados[1], reutilizacao, statusCircular, true);
            contagens.forEach((campo, i) => {
                const resultado = resultados[i + 2];
                const quantidade = resultado.status === "fulfilled" && !resultado.value.error ? resultado.value.count : null;
                campo.textContent = Number.isInteger(quantidade)
                    ? `${quantidade} ${quantidade === 1 ? "anúncio à venda" : "anúncios à venda"}` : "Consultar anúncios";
            });
        } catch {
            if (!encerrada) {
                const falha = { status: "rejected" };
                renderizar(falha, vendas, statusVendas, false);
                renderizar(falha, reutilizacao, statusCircular, true);
            }
        } finally {
            window.clearTimeout(tempoLimite);
            [vendas, reutilizacao].forEach((grade) => grade.setAttribute("aria-busy", "false"));
            atualizando = false;
        }
    }

    function iniciarAtualizacao() {
        encerrada = false;
        if (intervalo) window.clearInterval(intervalo);
        intervalo = window.setInterval(() => {
            if (document.visibilityState === "visible") atualizar(true);
        }, 30000);
        atualizar();
    }
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") atualizar(true);
    });
    window.addEventListener("focus", () => atualizar(true));
    window.addEventListener("pagehide", () => {
        encerrada = true;
        window.clearInterval(intervalo);
        controlador?.abort();
    });
    window.addEventListener("pageshow", (evento) => {
        if (evento.persisted) iniciarAtualizacao();
    });
    iniciarAtualizacao();
})();
