import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const inicio = await readFile(new URL('../js/inicio.js', import.meta.url), 'utf8');
const integracao = await readFile(new URL('../js/retech-supabase.js', import.meta.url), 'utf8');
const componente = integracao.slice(integracao.indexOf('    function criarCard('), integracao.indexOf('    async function inicializarCatalogo('));
const tratamentoTexto = integracao.slice(integracao.indexOf('    function escapeHtml('), integracao.indexOf('    function mostrarMensagem('));
const resultados = [];

class Elemento {
    constructor(tag = 'div') {
        this.tag = tag;
        this.children = [];
        this.dataset = {};
        this.attrs = {};
        this.listeners = {};
        this.textContent = '';
    }
    setAttribute(chave, valor) { this.attrs[chave] = valor; }
    getAttribute(chave) { return this.attrs[chave]; }
    append(...filhos) { this.children.push(...filhos); }
    appendChild(filho) { this.children.push(filho); }
    replaceChildren(...filhos) { this.children = filhos; this.textContent = ''; }
    get firstElementChild() { return this.children[0]; }
    addEventListener(evento, callback) { this.listeners[evento] = callback; }
    contains() { return false; }
    querySelector() { return this.imagem ||= new Elemento('img'); }
    querySelectorAll() { return []; }
    focus() {}
    set innerHTML(valor) { this.html = valor; }
    get innerHTML() { return this.html ?? this.textContent.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
}

const novo = (id, tipo = 'venda', status = 'ativo', extras = {}) => ({
    id, tipo_anuncio: tipo, status, nome_anuncio: `Produto ${id}`,
    descricao_anuncio: 'Eletrônico usado com informações reais do anúncio.',
    preco_anuncio: 100 + id, imagem_url: 'imagens/vitrine.jpg', estado: 'bom',
    created_at: new Date(Date.now() - id * 60000).toISOString(),
    categorias: { nome: 'Computadores', slug: 'computadores' }, ...extras
});

async function ambiente(opcoes = {}) {
    const estado = { dados: opcoes.dados || [], erroVendas: false, erroCircular: false, erroContagem: false, rejeitar: false, consultas: [] };
    Object.assign(estado, opcoes);
    const elementos = Object.fromEntries(['inicio-vendas', 'inicio-reutilizacao', 'inicio-vendas-status', 'inicio-circular-status'].map(id => [id, new Elemento()]));
    const contagens = ['celulares', 'computadores', 'games', 'cameras', 'outros'].map(slug => {
        const el = new Elemento('small');
        el.dataset.categoriaContagem = slug;
        return el;
    });
    const document = {
        body: { classList: { contains: () => !opcoes.outraPagina } },
        visibilityState: 'visible', listeners: {}, activeElement: null,
        createElement: tag => new Elemento(tag),
        getElementById: id => elementos[id], querySelectorAll: () => contagens,
        addEventListener(evento, callback) { this.listeners[evento] = callback; }
    };
    const window = {
        listeners: {}, intervalos: [], tempos: new Map(),
        setTimeout(fn) { const id = this.tempos.size + 1; this.tempos.set(id, fn); return id; },
        clearTimeout(id) { this.tempos.delete(id); },
        setInterval(fn, ms) { this.intervalos.push({ fn, ms }); return this.intervalos.length; },
        clearInterval() {}, addEventListener(evento, callback) { this.listeners[evento] = callback; }
    };
    class Consulta {
        constructor() { this.filtros = []; this.ordens = []; this.limite = Infinity; estado.consultas.push(this); }
        select(colunas, config) { this.colunas = colunas; this.config = config; return this; }
        eq(campo, valor) { this.filtros.push([campo, [valor]]); return this; }
        in(campo, valores) { this.filtros.push([campo, valores]); return this; }
        order(campo, config) { this.ordens.push([campo, config]); return this; }
        limit(valor) { this.limite = valor; return this; }
        abortSignal(signal) { this.signal = signal; return this; }
        then(resolve, reject) {
            if (estado.rejeitar) return Promise.reject(new Error('fetch failed')).then(resolve, reject);
            const tipos = this.filtros.find(([chave]) => chave === 'tipo_anuncio')?.[1];
            if ((this.config?.head && estado.erroContagem) || (!this.config?.head && (tipos?.includes('venda') ? estado.erroVendas : estado.erroCircular))) {
                return Promise.resolve({ error: { message: 'Falha simulada' } }).then(resolve, reject);
            }
            let dados = estado.dados.filter(item => this.filtros.every(([campo, valores]) => valores.includes(campo === 'categorias.slug' ? item.categorias?.slug : item[campo])));
            dados = [...dados].sort((a, b) => {
                for (const [campo] of this.ordens) {
                    const diferenca = campo === 'created_at' ? new Date(b[campo]) - new Date(a[campo]) : b[campo] - a[campo];
                    if (diferenca) return diferenca;
                }
                return 0;
            });
            return Promise.resolve(this.config?.head ? { count: dados.length, error: null } : { data: dados.slice(0, this.limite), error: null }).then(resolve, reject);
        }
    }
    if (!opcoes.semCliente) window.retechDB = { from(tabela) { assert.equal(tabela, 'anuncios'); return new Consulta(); } };
    const ctx = vm.createContext({ document, window, AbortController, Date,
        nomeEstado: { bom: 'Bom', usado: 'Usado', 'muito-bom': 'Muito bom' },
        nomeTipo: { venda: 'Venda', doacao: 'Doação', troca: 'Troca' },
        formatarPreco: valor => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    });
    new vm.Script(tratamentoTexto + componente).runInContext(ctx);
    new vm.Script(inicio).runInContext(ctx);
    await new Promise(resolve => setImmediate(resolve));
    return { estado, elementos, window, document, contagens, ctx };
}

const texto = el => el.textContent + el.innerHTML + el.children.map(texto).join(' ');
const gradeVendas = a => a.elementos['inicio-vendas'];
const gradeCircular = a => a.elementos['inicio-reutilizacao'];

{
    const a = await ambiente({ dados: [novo(8), novo(3), novo(1), novo(5), novo(2), novo(0, 'venda', 'pausado'), novo(7, 'doacao'), novo(9, 'troca')] });
    assert.equal(gradeVendas(a).children.length, 4);
    assert.deepEqual(gradeVendas(a).children.map(el => Number(el.dataset.nome.split(' ')[1])), [1, 2, 3, 5]);
    assert.equal(gradeCircular(a).children.length, 2);
    assert.ok(!texto(gradeVendas(a)).includes('Produto 0'));
    assert.ok(texto(gradeVendas(a)).includes('produto.html?id=1'));
    assert.ok(texto(gradeVendas(a)).includes('Bom'));
    assert.ok(texto(gradeVendas(a)).includes('Recém-anunciado'));
    assert.ok(texto(gradeCircular(a)).includes('Grátis'));
    assert.ok(texto(gradeCircular(a)).includes('Para trocar'));
    assert.equal(a.contagens[1].textContent, '5 anúncios à venda');
    assert.equal(a.contagens[0].textContent, '0 anúncios à venda');
    assert.equal(a.estado.consultas[0].limite, 4);
    assert.equal(a.estado.consultas[1].limite, 3);
    assert.ok(a.estado.consultas.slice(2).every(q => q.config.head && q.config.count === 'exact'));
    assert.equal(gradeVendas(a).attrs['aria-busy'], 'false');
    resultados.push('Limites, ordenação, vendas ativas, doação/troca, links e contagens reais');

    const anterior = gradeVendas(a).children[0];
    await a.window.listeners.focus();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(gradeVendas(a).children[0], anterior);
    a.estado.dados.push(novo(20, 'venda', 'ativo', { created_at: new Date(Date.now() + 1).toISOString() }));
    a.estado.dados.find(el => el.id === 1).status = 'pausado';
    a.window.intervalos[0].fn();
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(texto(gradeVendas(a)).includes('Produto 20'));
    assert.ok(!texto(gradeVendas(a)).includes('Produto 1<'));
    assert.equal(a.window.intervalos[0].ms, 30000);
    const consultas = a.estado.consultas.length;
    a.document.visibilityState = 'hidden';
    a.window.intervalos[0].fn();
    assert.equal(a.estado.consultas.length, consultas);
    resultados.push('Atualização automática, saída de inativos, preservação dos cards e pausa em aba oculta');
}

{
    const a = await ambiente();
    assert.match(texto(gradeVendas(a)), /Ainda não temos produtos anunciados/);
    assert.equal(gradeVendas(a).firstElementChild.children.at(-1).href, 'anunciar.html');
    assert.match(texto(gradeCircular(a)), /Ainda não há doações ou trocas/);
    assert.ok(!texto(gradeVendas(a)).includes('R$'));
    resultados.push('Estados vazios convidam a anunciar, sem preços ou produtos fictícios');
}

for (const modo of ['erroVendas', 'erroCircular', 'erroContagem', 'rejeitar']) {
    const a = await ambiente({ dados: [novo(1), novo(2, 'doacao')], [modo]: true });
    if (modo === 'erroVendas' || modo === 'rejeitar') assert.match(texto(gradeVendas(a)), /Não foi possível/);
    if (modo === 'erroCircular' || modo === 'rejeitar') assert.match(texto(gradeCircular(a)), /Não foi possível/);
    if (modo === 'erroVendas') assert.match(texto(gradeCircular(a)), /Grátis/);
    if (modo === 'erroCircular') assert.match(texto(gradeVendas(a)), /Produto 1/);
    if (modo === 'erroContagem') assert.equal(a.contagens[1].textContent, 'Consultar anúncios');
    assert.equal(gradeVendas(a).attrs['aria-busy'], 'false');
    resultados.push(`Falhas tratadas sem dados inventados: ${modo}`);
    if (modo === 'erroVendas') {
        a.estado.erroVendas = false;
        await gradeVendas(a).firstElementChild.children.at(-1).listeners.click();
        await new Promise(resolve => setImmediate(resolve));
        assert.match(texto(gradeVendas(a)), /Produto 1/);
        resultados.push('Botão Tentar novamente recupera o carregamento');
    }
}

{
    const a = await ambiente({ semCliente: true });
    assert.match(texto(gradeVendas(a)), /Não foi possível conectar/);
    assert.equal(a.estado.consultas.length, 0);
    const b = await ambiente({ outraPagina: true });
    assert.equal(b.estado.consultas.length, 0);
    resultados.push('Configuração ausente tem mensagem e script não roda fora da home');
}

{
    const a = await ambiente({ dados: [novo(1, 'venda', 'ativo', { nome_anuncio: '<img src=x onerror=alert(1)>', imagem_url: '" onerror="alert(1)', descricao_anuncio: '<script>malicioso</script>', preco_anuncio: null })] });
    const card = gradeVendas(a).children[0];
    assert.ok(card.innerHTML.includes('&lt;img'));
    assert.ok(!card.innerHTML.includes('<script>'));
    assert.ok(card.innerHTML.includes('src="&quot; onerror=&quot;alert(1)"'));
    assert.ok(card.innerHTML.includes('Preço não informado'));
    assert.equal((card.innerHTML.match(/<a /g) || []).length, 1);
    card.imagem.listeners.error();
    assert.equal(card.imagem.src, 'imagens/vitrine.jpg');
    resultados.push('Conteúdo escapado, cartão sem links aninhados, preço ausente e imagem com fallback');
}

{
    const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    assert.ok(!/produto\.html\?id=(iphone|notebook|switch|camera)/.test(html));
    assert.match(html, /action="catalogo.html" method="get"/);
    assert.match(html, /name="busca"/);
    for (const slug of ['celulares', 'computadores', 'games', 'cameras', 'outros']) {
        assert.ok(html.includes(`catalogo.html?categoria=${slug}`));
    }
    const links = Array.from(html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g), m => m[1]);
    for (const link of links) {
        if (!link.startsWith('http')) await readFile(new URL('../' + link.split('?')[0], import.meta.url));
    }
    assert.ok(html.indexOf('js/supabase.js') < html.indexOf('js/retech-supabase.js'));
    assert.ok(html.indexOf('js/retech-supabase.js') < html.indexOf('js/inicio.js'));
    for (const titulo of ['Anúncios recentes', 'Doe, troque e faça a tecnologia circular', 'Como funciona o ReTech?', 'Eletrônicos reutilizados. Benefícios renovados.', 'Seu eletrônico pode ter uma nova história.']) {
        assert.ok(html.includes(titulo));
    }
    resultados.push('Links e arquivos existentes, busca GET, categorias, seções e ordem dos scripts');
}

{
    function controle() {
        const classes = new Set();
        return {
            listeners: {}, attrs: {},
            classList: { toggle(classe) { if (classes.has(classe)) { classes.delete(classe); return false; } classes.add(classe); return true; }, remove(classe) { classes.delete(classe); } },
            addEventListener(evento, callback) { this.listeners[evento] = callback; },
            setAttribute(chave, valor) { this.attrs[chave] = valor; }, contains() { return false; }
        };
    }
    const cabecalho = controle(), menu = controle(), mais = controle(), submenu = controle();
    const controles = { '.cabecalho-conteudo': cabecalho, '.menu-toggle': menu, '.menu-mais-botao': mais, '.menu-mais': submenu };
    const document = { listeners: {}, querySelector: seletor => controles[seletor] || null, querySelectorAll: () => [], addEventListener(evento, fn) { this.listeners[evento] = fn; } };
    const ctx = vm.createContext({ document, window: { location: { pathname: '/index.html', search: '' } }, URLSearchParams });
    new vm.Script(await readFile(new URL('../js/script.js', import.meta.url), 'utf8')).runInContext(ctx);
    menu.listeners.click();
    assert.equal(menu.attrs['aria-expanded'], 'true');
    menu.listeners.click();
    assert.equal(menu.attrs['aria-expanded'], 'false');
    mais.listeners.click();
    assert.equal(mais.attrs['aria-expanded'], 'true');
    document.listeners.click({ target: {} });
    assert.equal(mais.attrs['aria-expanded'], 'false');
    resultados.push('Menu mobile e Mais alternam o estado acessível e fecham corretamente');
}

console.log(`${resultados.length} grupos de testes da home aprovados:\n- ${resultados.join('\n- ')}`);
