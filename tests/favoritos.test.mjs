import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const fonte = await readFile(new URL('../js/retech-supabase.js', import.meta.url), 'utf8');
const trecho = (inicio, fim) => fonte.slice(fonte.indexOf(inicio), fonte.indexOf(fim));
const script = new vm.Script(
    trecho('    async function executarAcao(', '    function iniciar(') +
    trecho('    const paginaComFavoritos', '    async function inicializarCatalogo(')
);

const salvos = new Map([['a', new Set()], ['b', new Set([8])]]);
const anuncios = new Map([[7, { id: 7, status: 'ativo' }], [8, { id: 8, status: 'ativo' }]]);
let falha = false;

async function pagina(path, conta) {
    const perfil = path === '/perfil.html';
    const botoes = [];
    function elemento() {
        return {
            filhos: [], dataset: {}, attrs: {},
            appendChild(filho) { this.filhos.push(filho); },
            prepend(filho) { this.filhos.unshift(filho); },
            replaceChildren(...filhos) { this.filhos = filhos; },
            contains(filho) { return this.filhos.some(item => item === filho || item.contains(filho)); },
            querySelector() { return null; },
            addEventListener(evento, fn) { this[evento] = fn; },
            setAttribute(nome, valor) { this.attrs[nome] = valor; }
        };
    }
    const elementos = Object.fromEntries(
        ['perfil-favoritos', 'total-favoritos', 'favoritos-status', 'favoritos-vazio', 'aba-favoritos']
            .map(id => [id, elemento()])
    );
    const sessao = () => conta ? { user: { id: conta } } : null;
    function consulta() {
        assert.ok(conta, 'O visitante não deve consultar ou alterar favoritos');
        let dono, id, excluir;
        return {
            select() { return this; },
            order() { return this; },
            eq(campo, valor) {
                if (campo === 'usuario_id') dono = valor;
                else if (campo === 'anuncio_id') id = valor;
                return this;
            },
            async range() {
                assert.equal(dono, conta);
                return { data: [...salvos.get(dono)].map(anuncio_id => ({ anuncio_id, anuncios: anuncios.get(anuncio_id) })) };
            },
            delete() { excluir = true; return this; },
            then(resolve) {
                assert.equal(excluir, true);
                assert.equal(dono, conta);
                salvos.get(dono).delete(Number(id));
                return Promise.resolve({}).then(resolve);
            },
            async insert(item) {
                assert.equal(item.usuario_id, conta);
                if (falha) return { error: { code: '42501' } };
                if (salvos.get(conta).has(item.anuncio_id)) return { error: { code: '23505' } };
                salvos.get(conta).add(item.anuncio_id);
                return {};
            }
        };
    }
    const ctx = vm.createContext({
        path, setTimeout() {},
        window: { addEventListener() {} },
        document: {
            activeElement: null,
            getElementById: id => perfil ? elementos[id] : null,
            createElement(tag) {
                const el = elemento();
                if (tag === 'button') botoes.push(el);
                return el;
            },
            querySelectorAll: () => botoes
        },
        db: {
            auth: { getSession: async () => ({ data: { session: sessao() } }) },
            from(tabela) { assert.equal(tabela, 'favoritos'); return consulta(); }
        },
        criarCard(anuncio) {
            const card = elemento();
            card.id = anuncio.id;
            card.appendChild(ctx.criarControleFavorito(anuncio.id));
            return card;
        }
    });
    script.runInContext(ctx);
    ctx.atualizarSessaoFavoritos(sessao());
    await ctx.carregarFavoritos();
    return {
        ...elementos, ctx,
        controle: id => ctx.criarControleFavorito(id),
        async autenticar(novaConta) {
            conta = novaConta;
            ctx.atualizarSessaoFavoritos(sessao());
            await ctx.carregarFavoritos();
        }
    };
}

const visitante = (await pagina('/catalogo.html', null)).controle(7);
await visitante.filhos[0].click();
assert.match(visitante.filhos[1].textContent, /Entre na sua conta/);
const catalogo = await pagina('/catalogo.html', 'a');
const [coracao, mensagem] = catalogo.controle(7).filhos;
const [outroCoracao] = catalogo.controle(7).filhos;
assert.equal(coracao.attrs['aria-pressed'], 'false');
falha = true;
await coracao.click();
assert.match(mensagem.textContent, /Não foi possível/);
assert.equal(coracao.attrs['aria-pressed'], 'false');
falha = false;
await coracao.click();
assert.equal(salvos.get('a').has(7), true);
await coracao.click();
assert.equal(salvos.get('a').has(7), false);
salvos.get('a').add(7); // Outra aba gravou depois da leitura inicial.
await coracao.click();
assert.equal(salvos.get('a').size, 1);
assert.equal(outroCoracao.attrs['aria-pressed'], 'true');
assert.equal(coracao.attrs['aria-label'], 'Remover dos favoritos');
const detalhe = await pagina('/produto.html', 'a');
assert.match(detalhe.controle(7).filhos[0].innerHTML, /fa-solid fa-heart/);
await catalogo.autenticar(null);
assert.equal(coracao.attrs['aria-pressed'], 'false');
await catalogo.autenticar('b');
assert.equal(coracao.attrs['aria-pressed'], 'false');
await catalogo.autenticar('a');
assert.equal(coracao.attrs['aria-pressed'], 'true');

const perfil = await pagina('/perfil.html', 'a');
assert.equal(perfil['perfil-favoritos'].filhos[0].id, 7);
assert.equal(perfil['total-favoritos'].textContent, 1);
anuncios.set(7, { id: 7, status: 'pausado' });
const recarregado = await pagina('/perfil.html', 'a');
const indisponivel = recarregado['perfil-favoritos'].filhos[0];
assert.match(indisponivel.innerHTML, /Anúncio indisponível/);
assert.doesNotMatch(indisponivel.innerHTML, /href/);
await indisponivel.filhos[0].filhos[0].click();
assert.equal(recarregado['perfil-favoritos'].filhos.length, 0);
assert.equal(recarregado['favoritos-vazio'].hidden, false);
assert.equal(recarregado['total-favoritos'].textContent, 0);
await catalogo.ctx.carregarFavoritos();
assert.match(coracao.innerHTML, /fa-regular fa-heart/);
assert.deepEqual([...salvos.get('b')], [8]);

console.log('Favoritos: visitante, falha de gravação, duplicidade, sincronização, nova sessão, anúncio pausado, remoção e estado vazio aprovados com Supabase simulado.');
