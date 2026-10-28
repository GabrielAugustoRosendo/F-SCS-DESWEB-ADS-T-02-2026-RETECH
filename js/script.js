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
    if (!grade) return;

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
            categoria: "Informática",
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
    const produto = catalogo[idProduto];

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

    document.getElementById("produto-preco").textContent =
        produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

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
})();
