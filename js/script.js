const campoBusca = document.querySelector('#campo-busca');
const ordenacao = document.querySelector('#ordenacao');
const grade = document.querySelector('#grade-catalogo');
const contador = document.querySelector('#resultado-contagem');
const mensagemVazia = document.querySelector('#catalogo-vazio');
const botaoLimpar = document.querySelector('#limpar-filtros');
atualizarCatalogo();

// Recupera a busca enviada pela URL, caso exista.
const parametrosBusca = new URLSearchParams(window.location.search);
const termoInicial = parametrosBusca.get('busca');

if (campoBusca && termoInicial) {
    campoBusca.value = termoInicial;
}

function atualizarCatalogo() {
    if (!grade || !window.location.pathname.toLowerCase().includes('catalogo.html')) return;

    const termo = (campoBusca?.value || '').trim().toLocaleLowerCase('pt-BR');
    const categoriaSelecionada = document.querySelector('input[name="categoria"]:checked')?.value || 'todos';
    const estadoSelecionado = document.querySelector('input[name="estado"]:checked')?.value || 'todos';
    const catalogo = Array.from(grade.querySelectorAll('.produto-catalogo'));

    const encontrados = catalogo.filter((produto) => {
        const correspondeBusca = produto.dataset.nome.toLocaleLowerCase('pt-BR').includes(termo)
            || produto.dataset.categoria.toLocaleLowerCase('pt-BR').includes(termo);
        const correspondeCategoria = categoriaSelecionada === 'todos' || produto.dataset.categoria === categoriaSelecionada;
        const correspondeEstado = estadoSelecionado === 'todos' || produto.dataset.estado === estadoSelecionado;
        produto.hidden = !(correspondeBusca && correspondeCategoria && correspondeEstado);
        return !produto.hidden;
    });

    encontrados.sort((a, b) => {
        if (ordenacao.value === 'menor-preco') return Number(a.dataset.preco) - Number(b.dataset.preco);
        if (ordenacao.value === 'maior-preco') return Number(b.dataset.preco) - Number(a.dataset.preco);
        if (ordenacao.value === 'nome') return a.dataset.nome.localeCompare(b.dataset.nome, 'pt-BR');
        return catalogo.indexOf(a) - catalogo.indexOf(b);
    });
    encontrados.forEach((produto) => grade.appendChild(produto));

    contador.textContent = `${encontrados.length} ${encontrados.length === 1 ? 'produto encontrado' : 'catalogo encontrados'}`;
    mensagemVazia.hidden = encontrados.length > 0;
}

campoBusca?.addEventListener('input', atualizarCatalogo);
ordenacao?.addEventListener('change', atualizarCatalogo);
document.querySelectorAll('input[name="categoria"], input[name="estado"]').forEach((filtro) => {
    filtro.addEventListener('change', atualizarCatalogo);
});
botaoLimpar?.addEventListener('click', () => {
    if (campoBusca) campoBusca.value = '';
    document.querySelector('input[name="categoria"][value="todos"]').checked = true;
    document.querySelector('input[name="estado"][value="todos"]').checked = true;
    if (ordenacao) ordenacao.value = 'relevancia';
    atualizarCatalogo();
});

/* Lê os parâmetros da URL */
const parametrosPagina = new URLSearchParams(window.location.search);
const categoriaInicial = parametrosPagina.get('categoria');
const buscaInicial = parametrosPagina.get('busca') || '';

/* Preenche o campo de busca */
if (campoBusca) {
    campoBusca.value = buscaInicial;
}

/* Seleciona a categoria inicial */
if (categoriaInicial) {
    const filtroInicial = document.querySelector(
        `input[name="categoria"][value="${categoriaInicial}"]`
    );

    if (filtroInicial) {
        filtroInicial.checked = true;
    }
}

/* Aplica os filtros ao abrir o catálogo */
if (buscaInicial || categoriaInicial) {
    atualizarCatalogo();
}


/* Detalhes dos catalogo do ReTech */

(function () {
    const catalogo = {
        iphone: {
            nome: "iPhone 17 128 GB",
            preco: 4699,
            categoria: "Celulares",
            estado: "Usado",
            imagem: "imagens/iphone.jpg",
            descricao: "Smartphone seminovo anunciado na plataforma ReTech.",
            caracteristicas: [
                "Armazenamento de 128 GB",
                "Produto de segunda mão",
                "Incentivo ao reaproveitamento eletrônico"
            ]
        },

        notebook: {
            nome: "Notebook ASUS E510MA",
            preco: 1150,
            categoria: "Computadores",
            estado: "Usado",
            imagem: "imagens/notebook.jpg",
            descricao: "Notebook usado para atividades do dia a dia.",
            caracteristicas: [
                "Modelo ASUS E510MA",
                "Indicado para tarefas cotidianas",
                "Alternativa ao descarte eletrônico"
            ]
        },

        switch: {
            nome: "Nintendo Switch 2",
            preco: 2800,
            categoria: "Games",
            estado: "Usado",
            imagem: "imagens/switch.jpg",
            descricao: "Console de videogame anunciado para reutilização.",
            caracteristicas: [
                "Produto da categoria de games",
                "Equipamento de segunda mão",
                "Reutilização de eletrônicos"
            ]
        },

        camera: {
            nome: "Canon EOS 6D Mark II",
            preco: 3000,
            categoria: "Fotografia",
            estado: "Usado",
            imagem: "imagens/camera.jpg",
            descricao: "Câmera fotográfica usada disponível no catálogo.",
            caracteristicas: [
                "Modelo Canon EOS 6D Mark II",
                "Produto da categoria de fotografia",
                "Incentivo à economia circular"
            ]
        }
    };

    const nomeElemento = document.getElementById("produto-nome");

    // Executa somente na página de detalhes.
    if (!nomeElemento) {
        return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const idProduto = parametros.get("id");
    let anunciosSalvos = [];
    try {
        anunciosSalvos = JSON.parse(localStorage.getItem("retech-anuncios")) || [];
    } catch (erro) {
        anunciosSalvos = [];
    }
    const anuncio = idProduto?.startsWith("anuncio-")
        ? anunciosSalvos.find((item) => item.id === idProduto)
        : null;

    const produto = catalogo[idProduto] || (anuncio ? {
        nome: anuncio.nome,
        preco: anuncio.preco,
        modalidade: anuncio.modalidade,
        categoria: obterNomeCategoria(anuncio.categoria),
        estado: obterNomeEstado(anuncio.estado),
        imagem: anuncio.imagem || "imagens/vitrine.jpg",
        descricao: anuncio.descricao,
        caracteristicas: [
            "Anúncio publicado na plataforma ReTech",
            `Modalidade: ${obterNomeModalidade(anuncio.modalidade)}`,
            `Estado de conservação: ${obterNomeEstado(anuncio.estado)}`
        ]
    } : null);

    const detalhes = document.getElementById("detalhes-produto");
    const mensagemErro = document.getElementById("produto-nao-encontrado");

    if (!produto) {
        detalhes.hidden = true;
        mensagemErro.hidden = false;
        document.title = "Produto não encontrado | ReTech";
        return;
    }

    document.title = produto.nome + " | ReTech";

    document.getElementById("produto-nome").textContent =
        produto.nome;

    document.getElementById("produto-categoria").textContent =
        produto.categoria;

    document.getElementById("produto-estado").textContent =
        "Condição: " + produto.estado;

    const elementoPreco = document.getElementById("produto-preco");
    if (produto.modalidade && produto.modalidade !== "venda") {
        elementoPreco.hidden = true;
    } else if (typeof produto.preco === "number") {
        elementoPreco.hidden = false;
        elementoPreco.textContent = produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    document.getElementById("produto-descricao").textContent =
        produto.descricao;

    const imagem = document.getElementById("produto-imagem");
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;

    const lista = document.getElementById("produto-caracteristicas");

    produto.caracteristicas.forEach(function (caracteristica) {
        const item = document.createElement("li");
        item.textContent = caracteristica;
        lista.appendChild(item);
    });

    if (anuncio) {
        const linkVoltar = document.querySelector(".voltar-catalogo");
        const linkExplorar = document.querySelector(".produto-informacoes .botao");
        if (linkVoltar) {
            linkVoltar.href = anuncio.modalidade === "venda" ? "catalogo.html" : "doar-trocar.html";
            linkVoltar.textContent = anuncio.modalidade === "venda"
                ? "← Voltar para o catálogo"
                : "← Voltar para doações e trocas";
        }
        if (linkExplorar) {
            linkExplorar.href = anuncio.modalidade === "venda" ? "catalogo.html" : "doar-trocar.html";
        }
    }
})();

const CHAVE_ANUNCIOS = "retech-anuncios";

function obterAnuncios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_ANUNCIOS)) || [];
    } catch (erro) {
        return [];
    }
}

function salvarAnuncios(anuncios) {
    localStorage.setItem(CHAVE_ANUNCIOS, JSON.stringify(anuncios));
}

function obterNomeCategoria(categoria) {
    const nomes = {
        celulares: "Celulares",
        computadores: "Computadores",
        notebooks: "Computadores",
        games: "Games",
        cameras: "Câmeras",
        outros: "Outros",
        audio: "Outros",
        acessorios: "Outros"
    };
    return nomes[categoria] || categoria;
}

function obterNomeEstado(estado) {
    const nomes = {
        "muito-bom": "Muito bom",
        bom: "Bom",
        usado: "Usado"
    };
    return nomes[estado] || estado;
}

function obterNomeModalidade(modalidade) {
    return modalidade === "doacao" ? "Doação" : modalidade === "troca" ? "Troca" : "Venda";
}

function criarCardAnuncio(anuncio) {
    const artigo = document.createElement("article");
    artigo.className = "produto produto-catalogo";
    artigo.dataset.modalidade = anuncio.modalidade;
    const categoriasNormalizadas = {
        notebooks: "computadores",
        audio: "outros",
        acessorios: "outros"
    };
    artigo.dataset.categoria = categoriasNormalizadas[anuncio.categoria] || anuncio.categoria;
    artigo.dataset.estado = anuncio.estado;
    artigo.dataset.preco = anuncio.modalidade === "venda" ? String(anuncio.preco) : "0";
    artigo.dataset.nome = anuncio.nome;

    const selo = document.createElement("span");
    selo.className = `selo-produto ${anuncio.modalidade === "venda" ? "selo-neutro" : "selo-verde"}`;
    selo.textContent = anuncio.modalidade === "venda" ? obterNomeEstado(anuncio.estado) : obterNomeModalidade(anuncio.modalidade);

    const imagem = document.createElement("img");
    imagem.src = anuncio.imagem || "imagens/vitrine.jpg";
    imagem.alt = anuncio.nome;

    const informacoes = document.createElement("div");
    informacoes.className = "produto-info";

    const categoria = document.createElement("p");
    categoria.className = "produto-categoria";
    categoria.textContent = obterNomeCategoria(anuncio.categoria);

    const nome = document.createElement("h3");
    nome.textContent = anuncio.nome;

    const descricao = document.createElement("p");
    descricao.textContent = anuncio.descricao;

    const destaque = document.createElement("strong");
    if (anuncio.modalidade === "venda") {
        destaque.textContent = Number(anuncio.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    } else {
        destaque.textContent = anuncio.modalidade === "doacao" ? "Grátis" : "Para trocar";
    }

    const link = document.createElement("a");
    link.href = `produto.html?id=${encodeURIComponent(anuncio.id)}`;
    link.className = "link-produto";
    link.innerHTML = 'Ver detalhes <i class="fa-solid fa-arrow-right"></i>';

    informacoes.append(categoria, nome, descricao, destaque, link);
    artigo.append(selo, imagem, informacoes);
    return artigo;
}

function renderizarAnunciosNasListas() {
    const gradeCatalogo = document.querySelector('#grade-catalogo');
    if (!gradeCatalogo) return;

    const anuncios = obterAnuncios();
    const estaNoCatalogo = window.location.pathname.toLowerCase().includes('catalogo.html');

    if (estaNoCatalogo) {
        anuncios.filter((anuncio) => anuncio.modalidade === "venda")
            .forEach((anuncio) => gradeCatalogo.appendChild(criarCardAnuncio(anuncio)));
    } else if (window.location.pathname.toLowerCase().includes('doar-trocar.html')) {
        anuncios.filter((anuncio) => anuncio.modalidade === "doacao" || anuncio.modalidade === "troca")
            .forEach((anuncio) => gradeCatalogo.appendChild(criarCardAnuncio(anuncio)));
    }
}

function inicializarFiltrosDoacaoTroca() {
    const grade = document.querySelector('#grade-catalogo');
    const paginaDoacao = window.location.pathname.toLowerCase().includes('doar-trocar.html');
    if (!grade || !paginaDoacao) return;

    const contador = document.querySelector('#resultado-contagem');
    const mensagemVazia = document.querySelector('#catalogo-vazio');

    function atualizarAnunciosDoacaoTroca() {
        const modalidade = document.querySelector('input[name="modalidade"]:checked')?.value || 'todos';
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value || 'todos';
        const anuncios = Array.from(grade.querySelectorAll('.produto-catalogo'));

        const encontrados = anuncios.filter((anuncio) => {
            const correspondeModalidade = modalidade === 'todos' || anuncio.dataset.modalidade === modalidade;
            const correspondeCategoria = categoria === 'todos' || anuncio.dataset.categoria === categoria;
            anuncio.hidden = !(correspondeModalidade && correspondeCategoria);
            return !anuncio.hidden;
        });

        if (contador) contador.textContent = `${encontrados.length} ${encontrados.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}`;
        if (mensagemVazia) mensagemVazia.hidden = encontrados.length > 0;

        if (document.querySelector('#ordenacao')?.value === 'nome') {
            encontrados.sort((a, b) => a.dataset.nome.localeCompare(b.dataset.nome, 'pt-BR'))
                .forEach((anuncio) => grade.appendChild(anuncio));
        }
    }

    document.querySelectorAll('input[name="modalidade"], input[name="categoria"]')
        .forEach((filtro) => filtro.addEventListener('change', atualizarAnunciosDoacaoTroca));
    document.querySelector('#ordenacao')?.addEventListener('change', atualizarAnunciosDoacaoTroca);
    document.querySelector('#limpar-filtros')?.addEventListener('click', () => {
        const modalidadeTodos = document.querySelector('input[name="modalidade"][value="todos"]');
        const categoriaTodos = document.querySelector('input[name="categoria"][value="todos"]');
        if (modalidadeTodos) modalidadeTodos.checked = true;
        if (categoriaTodos) categoriaTodos.checked = true;
        const ordenacao = document.querySelector('#ordenacao');
        if (ordenacao) ordenacao.value = 'relevancia';
        atualizarAnunciosDoacaoTroca();
    });
    atualizarAnunciosDoacaoTroca();
}

function inicializarFormularioAnuncio() {
    const formulario = document.querySelector('#formulario-anuncio');
    if (!formulario) return;

    const grupoPreco = document.querySelector('#grupo-preco');
    const campoPreco = document.querySelector('#preco-produto');

    function atualizarModalidade() {
        const modalidade = formulario.querySelector('input[name="modalidade"]:checked')?.value || '';
        const venda = modalidade === 'venda';
        grupoPreco.hidden = !venda;
        campoPreco.required = venda;
        campoPreco.disabled = !venda;
        if (!venda) campoPreco.value = '';
    }

    formulario.querySelectorAll('input[name="modalidade"]')
        .forEach((radio) => radio.addEventListener('change', atualizarModalidade));
    atualizarModalidade();

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        if (!formulario.reportValidity()) return;

        const dados = new FormData(formulario);
        const modalidade = dados.get('modalidade');
        const imagem = formulario.querySelector('#imagem-produto').files[0];

        function publicar(imagemBase64) {
            const anuncio = {
                id: `anuncio-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                nome: dados.get('nome').trim(),
                categoria: dados.get('categoria'),
                descricao: dados.get('descricao').trim(),
                estado: dados.get('estado'),
                modalidade,
                preco: modalidade === 'venda' ? Number(dados.get('preco')) : null,
                imagem: imagemBase64 || '',
                criadoEm: Date.now()
            };
            const anuncios = obterAnuncios();
            anuncios.push(anuncio);
            salvarAnuncios(anuncios);
            window.location.href = modalidade === 'venda' ? 'catalogo.html' : 'doar-trocar.html';
        }

        if (imagem) {
            const leitor = new FileReader();
            leitor.onload = () => publicar(leitor.result);
            leitor.readAsDataURL(imagem);
        } else {
            publicar('');
        }
    });
}

renderizarAnunciosNasListas();
inicializarFiltrosDoacaoTroca();
inicializarFormularioAnuncio();
if (typeof atualizarCatalogo === 'function') atualizarCatalogo();

(function inicializarCabecalho() {
    const cabecalho = document.querySelector('.cabecalho-conteudo');
    const botaoMenu = document.querySelector('.menu-toggle');
    const botaoMais = document.querySelector('.menu-mais-botao');
    const menuMais = document.querySelector('.menu-mais');

    if (!cabecalho || !botaoMenu) return;

    botaoMenu.addEventListener('click', () => {
        const aberto = cabecalho.classList.toggle('menu-aberto');
        botaoMenu.setAttribute('aria-expanded', String(aberto));
        botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        botaoMenu.innerHTML = aberto
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    const paginaMaisAtiva = menuMais?.querySelector('[aria-current="page"]');
    if (paginaMaisAtiva && menuMais) {
        menuMais.classList.add('ativo');
    }

    if (botaoMais && menuMais) {
        const alternarMais = () => {
            const aberto = menuMais.classList.toggle('aberto');
            botaoMais.setAttribute('aria-expanded', String(aberto));
        };

        botaoMais.addEventListener('click', alternarMais);

        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') {
                menuMais.classList.remove('aberto');
                botaoMais.setAttribute('aria-expanded', 'false');
                botaoMais.focus();
            }
        });

        document.addEventListener('click', (evento) => {
            if (!menuMais.contains(evento.target)) {
                menuMais.classList.remove('aberto');
                botaoMais.setAttribute('aria-expanded', 'false');
            }
        });
    }
})();
