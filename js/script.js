// Preferências de acessibilidade compartilhadas por todas as páginas.
(function () {
    const acoes = document.querySelector(".acoes-cabecalho");
    if (!acoes) return;

    const chave = "retech-tamanho-fonte";
    const chaveContraste = "retech-alto-contraste";
    const minimo = 90;
    const maximo = 125;
    const passo = 5;
    const raiz = document.documentElement;
    const cabecalhoAcessivel = acoes.closest(".cabecalho");
    const controle = document.createElement("div");
    controle.className = "acessibilidade-fontes";
    controle.innerHTML = `
        <button type="button" class="acessibilidade-abrir" aria-label="Opções de acessibilidade" aria-expanded="false" aria-controls="acessibilidade-painel">
            <i class="fa-solid fa-universal-access" aria-hidden="true"></i>
        </button>
        <div id="acessibilidade-painel" class="acessibilidade-painel" role="group" aria-labelledby="acessibilidade-titulo" hidden>
            <h2 id="acessibilidade-titulo">Acessibilidade</h2>
            <p class="acessibilidade-legenda">Tamanho das fontes</p>
            <div class="acessibilidade-opcoes">
                <button type="button" data-fonte="aumentar" aria-label="Aumentar tamanho da fonte">A+</button>
                <button type="button" data-fonte="diminuir" aria-label="Diminuir tamanho da fonte">A−</button>
                <button type="button" data-fonte="restaurar">Restaurar</button>
            </div>
            <button type="button" class="acessibilidade-contraste" aria-pressed="false">
                <i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i>
                Alto contraste <span class="acessibilidade-contraste-estado">Desativado</span>
            </button>
            <p class="acessibilidade-status" role="status" aria-live="polite"></p>
        </div>`;
    acoes.appendChild(controle);
    const botao = controle.querySelector(".acessibilidade-abrir");
    const painel = controle.querySelector(".acessibilidade-painel");
    const aumentar = controle.querySelector('[data-fonte="aumentar"]');
    const diminuir = controle.querySelector('[data-fonte="diminuir"]');
    const restaurar = controle.querySelector('[data-fonte="restaurar"]');
    const contraste = controle.querySelector(".acessibilidade-contraste");
    const estadoContraste = controle.querySelector(".acessibilidade-contraste-estado");
    const status = controle.querySelector(".acessibilidade-status");
    let percentual = 100;
    let altoContraste = false;

    function anunciarEstado() {
        status.textContent = `Fonte: ${percentual}%. Alto contraste ${altoContraste ? "ativado" : "desativado"}.`;
    }

    function aplicarContraste(ativado, salvar = false) {
        altoContraste = ativado === true;
        raiz.toggleAttribute("data-alto-contraste", altoContraste);
        contraste.setAttribute("aria-pressed", String(altoContraste));
        estadoContraste.textContent = altoContraste ? "Ativado" : "Desativado";
        anunciarEstado();
        if (salvar) {
            try {
                if (altoContraste) window.localStorage.setItem(chaveContraste, "true");
                else window.localStorage.removeItem(chaveContraste);
            } catch {
                status.textContent += " A preferência não pôde ser salva neste navegador.";
            }
        }
        posicionar();
    }

    function normalizar(valor) {
        const numero = Number(valor);
        return Number.isFinite(numero) && numero >= minimo && numero <= maximo && numero % passo === 0 ? numero : 100;
    }

    function posicionar() {
        if (painel.hidden) return;
        const limites = botao.getBoundingClientRect();
        const topo = Math.max(12, Math.min(limites.bottom + 8, window.innerHeight - painel.offsetHeight - 12));
        const direita = Math.max(16, Math.min(window.innerWidth - limites.right, window.innerWidth - painel.offsetWidth - 16));
        painel.style.top = `${topo}px`;
        painel.style.right = `${direita}px`;
    }

    function aplicar(valor, salvar = false) {
        percentual = normalizar(valor);
        raiz.style.setProperty("--retech-escala-fonte", String(percentual / 100));
        raiz.toggleAttribute("data-fontes-ampliadas", percentual > 100);
        aumentar.disabled = percentual >= maximo;
        diminuir.disabled = percentual <= minimo;
        anunciarEstado();
        if (salvar) {
            try {
                if (percentual === 100) window.localStorage.removeItem(chave);
                else window.localStorage.setItem(chave, String(percentual));
            } catch {
                status.textContent += ". A preferência não pôde ser salva neste navegador.";
            }
        }
        if (document.activeElement === aumentar && aumentar.disabled) diminuir.focus();
        if (document.activeElement === diminuir && diminuir.disabled) aumentar.focus();
        posicionar();
    }

    function fechar(devolverFoco = false) {
        painel.hidden = true;
        botao.setAttribute("aria-expanded", "false");
        cabecalhoAcessivel?.classList.remove("acessibilidade-aberta");
        if (devolverFoco) botao.focus();
    }

    function abrir(ultimo = false) {
        painel.hidden = false;
        botao.setAttribute("aria-expanded", "true");
        cabecalhoAcessivel?.classList.add("acessibilidade-aberta");
        posicionar();
        const opcoes = [aumentar, diminuir, restaurar, contraste].filter((opcao) => !opcao.disabled);
        (ultimo ? opcoes.at(-1) : opcoes[0]).focus();
    }

    botao.addEventListener("click", () => painel.hidden ? abrir() : fechar());
    aumentar.addEventListener("click", () => aplicar(Math.min(maximo, percentual + passo), true));
    diminuir.addEventListener("click", () => aplicar(Math.max(minimo, percentual - passo), true));
    restaurar.addEventListener("click", () => aplicar(100, true));
    contraste.addEventListener("click", () => aplicarContraste(!altoContraste, true));
    controle.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !painel.hidden) {
            evento.preventDefault();
            fechar(true);
        } else if (document.activeElement === botao && ["ArrowDown", "ArrowUp"].includes(evento.key)) {
            evento.preventDefault();
            abrir(evento.key === "ArrowUp");
        } else if (!painel.hidden && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(evento.key)) {
            const opcoes = [aumentar, diminuir, restaurar, contraste].filter((opcao) => !opcao.disabled);
            const atual = opcoes.indexOf(document.activeElement);
            const proximo = evento.key === "Home" ? 0 : evento.key === "End" ? opcoes.length - 1
                : (atual + (evento.key === "ArrowRight" ? 1 : -1) + opcoes.length) % opcoes.length;
            evento.preventDefault();
            opcoes[proximo].focus();
        }
    });
    controle.addEventListener("focusout", (evento) => {
        if (!controle.contains(evento.relatedTarget)) fechar();
    });
    document.addEventListener("click", (evento) => {
        if (!controle.contains(evento.target)) fechar();
    });
    window.addEventListener("resize", posicionar);
    window.addEventListener("scroll", posicionar, { passive: true });
    window.addEventListener("storage", (evento) => {
        if (evento.key === chave || evento.key === null) aplicar(evento.newValue);
        if (evento.key === chaveContraste || evento.key === null) aplicarContraste(evento.newValue === "true");
    });
    try {
        aplicar(window.localStorage.getItem(chave));
    } catch {
        aplicar(100);
    }
    try {
        aplicarContraste(window.localStorage.getItem(chaveContraste) === "true");
    } catch {
        aplicarContraste(false);
    }
})();

const campoBusca = document.querySelector("#campo-busca");
const ordenacao = document.querySelector("#ordenacao");
const grade = document.querySelector("#grade-catalogo");
const contador = document.querySelector("#resultado-contagem");
const mensagemVazia = document.querySelector("#catalogo-vazio");
const parametrosPagina = new URLSearchParams(window.location.search);

function atualizarCatalogo() {
    if (!grade || !window.location.pathname.toLowerCase().includes("catalogo.html")) return;

    const termo = (campoBusca?.value || "").trim().toLocaleLowerCase("pt-BR");
    const categoria = document.querySelector('input[name="categoria"]:checked')?.value || "todos";
    const estado = document.querySelector('input[name="estado"]:checked')?.value || "todos";
    const produtos = Array.from(grade.querySelectorAll(".produto-catalogo"));
    let encontrados = 0;

    produtos.forEach((produto) => {
        const correspondeBusca = !termo
            || produto.dataset.nome?.toLocaleLowerCase("pt-BR").includes(termo)
            || produto.dataset.categoria?.toLocaleLowerCase("pt-BR").includes(termo);
        const correspondeCategoria = categoria === "todos" || produto.dataset.categoria === categoria;
        const correspondeEstado = estado === "todos" || produto.dataset.estado === estado;
        const visivel = correspondeBusca && correspondeCategoria && correspondeEstado;
        produto.hidden = !visivel;
        if (visivel) encontrados += 1;
    });

    if (ordenacao && encontrados) {
        const produtosVisiveis = produtos.filter((produto) => !produto.hidden);
        produtosVisiveis.sort((a, b) => {
            if (ordenacao.value === "menor-preco") return Number(a.dataset.preco || 0) - Number(b.dataset.preco || 0);
            if (ordenacao.value === "maior-preco") return Number(b.dataset.preco || 0) - Number(a.dataset.preco || 0);
            if (ordenacao.value === "nome") return String(a.dataset.nome || "").localeCompare(String(b.dataset.nome || ""), "pt-BR");
            return 0;
        }).forEach((produto) => grade.appendChild(produto));
    }

    if (contador) {
        contador.textContent = `${encontrados} ${encontrados === 1 ? "produto encontrado" : "produtos encontrados"}`;
    }
    if (mensagemVazia) mensagemVazia.hidden = encontrados > 0;
}

function atualizarDoacaoTroca() {
    if (!grade || !window.location.pathname.toLowerCase().includes("doar-trocar.html")) return;
    const modalidade = document.querySelector('input[name="modalidade"]:checked')?.value || "todos";
    const categoria = document.querySelector('input[name="categoria"]:checked')?.value || "todos";
    const anuncios = Array.from(grade.querySelectorAll(".produto-catalogo"));
    let encontrados = 0;

    anuncios.forEach((anuncio) => {
        const visivel = (modalidade === "todos" || anuncio.dataset.modalidade === modalidade)
            && (categoria === "todos" || anuncio.dataset.categoria === categoria);
        anuncio.hidden = !visivel;
        if (visivel) encontrados += 1;
    });

    if (contador) {
        contador.textContent = `${encontrados} ${encontrados === 1 ? "anúncio encontrado" : "anúncios encontrados"}`;
    }
    if (mensagemVazia) mensagemVazia.hidden = encontrados > 0;
}

const termoInicial = parametrosPagina.get("busca");
if (campoBusca && termoInicial) campoBusca.value = termoInicial;
const categoriaInicial = parametrosPagina.get("categoria");
if (categoriaInicial) {
    const filtroInicial = document.querySelector(`input[name="categoria"][value="${CSS.escape(categoriaInicial)}"]`);
    if (filtroInicial) filtroInicial.checked = true;
}

campoBusca?.addEventListener("input", () => {
    atualizarCatalogo();
    atualizarDoacaoTroca();
});
ordenacao?.addEventListener("change", () => {
    atualizarCatalogo();
    atualizarDoacaoTroca();
});
document.querySelectorAll('input[name="categoria"], input[name="estado"], input[name="modalidade"]')
    .forEach((filtro) => filtro.addEventListener("change", () => {
        atualizarCatalogo();
        atualizarDoacaoTroca();
    }));
document.querySelector("#limpar-filtros")?.addEventListener("click", () => {
    if (campoBusca) campoBusca.value = "";
    document.querySelectorAll('input[name="categoria"][value="todos"], input[name="estado"][value="todos"], input[name="modalidade"][value="todos"]')
        .forEach((filtro) => { filtro.checked = true; });
    if (ordenacao) ordenacao.value = "relevancia";
    atualizarCatalogo();
    atualizarDoacaoTroca();
});
atualizarCatalogo();
atualizarDoacaoTroca();

const cabecalho = document.querySelector(".cabecalho-conteudo");
const botaoMenu = document.querySelector(".menu-toggle");
const botaoMais = document.querySelector(".menu-mais-botao");
const menuMais = document.querySelector(".menu-mais");

if (cabecalho && botaoMenu) {
    botaoMenu.addEventListener("click", () => {
        const aberto = cabecalho.classList.toggle("menu-aberto");
        botaoMenu.setAttribute("aria-expanded", String(aberto));
        botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        botaoMenu.innerHTML = aberto
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });
}

if (botaoMais && menuMais) {
    botaoMais.addEventListener("click", () => {
        const aberto = menuMais.classList.toggle("aberto");
        botaoMais.setAttribute("aria-expanded", String(aberto));
    });
    document.addEventListener("click", (evento) => {
        if (!menuMais.contains(evento.target)) {
            menuMais.classList.remove("aberto");
            botaoMais.setAttribute("aria-expanded", "false");
        }
    });
}
