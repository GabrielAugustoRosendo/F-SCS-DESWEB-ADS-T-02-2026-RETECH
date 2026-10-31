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
