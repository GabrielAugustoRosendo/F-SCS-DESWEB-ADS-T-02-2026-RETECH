import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const codigo = await readFile(new URL('../js/pagamento.js', import.meta.url), 'utf8');
class Elemento {
    value = ''; minLength = 11; maxLength = 11; disabled = false; children = []; listeners = {}; textContent = '';
    addEventListener(tipo, fn) { this.listeners[tipo] = fn; }
    setAttribute() {} removeAttribute() {} focus() {}
    replaceChildren() { this.children = []; }
    append(...itens) { this.children.push(...itens); }
    appendChild(item) { this.children.push(item); }
    querySelectorAll() { return []; }
    querySelector() { return { textContent: 'CPF' }; }
}
const produto = { anuncio_id: 7, anuncios: { id: 7, nome_anuncio: '<Produto>', preco_anuncio: 25.15, status: 'ativo', tipo_anuncio: 'venda', usuario_id: 'vendedor' } };
async function preparar({ busca = '?itens=7', itens = [produto], erro = null, usuario = true } = {}) {
    const elementos = new Map();
    const get = id => { if (!elementos.has(id)) elementos.set(id, new Elemento()); return elementos.get(id); };
    const chamadas = [];
    const query = { select() { return this; }, eq(campo, valor) { chamadas.push([campo, valor]); return this; }, in(campo, valor) { chamadas.push([campo, valor]); return Promise.resolve({ data: itens }); } };
    const db = { auth: { async getUser() { return { data: { user: usuario ? { id: 'comprador' } : null } }; } }, from(nome) { assert.equal(nome, 'carrinho'); return query; }, async rpc(nome, args) { chamadas.push([nome, args]); return { data: erro ? null : [{ id: 1 }], error: erro }; } };
    const window = { retechDB: db, location: { search: busca, href: '' } };
    vm.runInNewContext(codigo, { window, document: { getElementById: get, createElement: () => new Elemento() }, URLSearchParams });
    await new Promise(resolve => setTimeout(resolve, 0));
    get('pagamento-cpf').value = '00000000000';
    return { get, chamadas, window, async enviar() { await get('formulario-pagamento').listeners.submit({ preventDefault() {} }); } };
}

let f = await preparar();
assert.equal(f.get('pagamento-itens').children.length, 1);
assert.match(f.get('pagamento-total').textContent, /25,15/);
assert.deepEqual(f.chamadas[0], ['usuario_id', 'comprador']);
await f.enviar();
assert.equal(f.window.location.href, 'perfil.html#meus-pedidos');
const rpc = f.chamadas.find(([nome]) => nome === 'finalizar_carrinho');
assert.equal(JSON.stringify(rpc[1]), JSON.stringify({ p_anuncio_ids: [7], p_total_esperado: 25.15 }));
await f.enviar();
assert.equal(f.chamadas.filter(([nome]) => nome === 'finalizar_carrinho').length, 1);

f = await preparar({ erro: { message: 'Preço mudou' } });
await f.enviar();
assert.equal(f.window.location.href, '');
assert.match(f.get('pagamento-status').textContent, /Preço mudou/);
assert.equal(f.get('pagamento-simular').disabled, true);
assert.equal(f.get('pagamento-atualizar').disabled, false);

for (const config of [{ busca: '' }, { busca: '?itens=7,7' }, { itens: [] }, { usuario: false }, { itens: [{ ...produto, anuncios: { ...produto.anuncios, status: 'pausado' } }] }]) {
    f = await preparar(config);
    await f.enviar();
    assert.equal(f.get('pagamento-simular').disabled, true);
    assert.equal(f.chamadas.some(([nome]) => nome === 'finalizar_carrinho'), false);
    assert.ok(f.get('pagamento-carregamento').textContent);
}
f = await preparar();
f.get('pagamento-cpf').value = '123';
await f.enviar();
assert.equal(f.chamadas.some(([nome]) => nome === 'finalizar_carrinho'), false);
assert.match(f.get('pagamento-status').textContent, /11 caracteres/);

const integracao = await readFile(new URL('../js/retech-supabase.js', import.meta.url), 'utf8');
const trecho = integracao.slice(integracao.indexOf('    async function carregarPedidos'), integracao.indexOf('    async function inicializarPerfil'));
for (const erro of [false, true, "pedido"]) {
    const lista = new Elemento(), status = new Elemento(), atualizar = new Elemento();
    const query = { select() { return this; }, eq(campo, valor) { assert.equal(campo, 'comprador_id'); assert.equal(valor, 'comprador'); return this; }, async order() { return { data: erro === "pedido" ? [{ id: 4, total: 25.15, vendedor_id: "vendedor", status: "pendente", created_at: "2026-11-16T12:00:00Z", itens_pedido: [{ anuncio_id: 7, preco_unitario: 25.15, anuncios: { nome_anuncio: "<Produto>", imagem_url: "foto.jpg" } }] }] : [], error: erro === true ? { message: 'Sem conexão' } : null }; } };
    const contexto = vm.createContext({ document: { getElementById: id => ({ 'perfil-pedidos': lista, 'pedidos-status': status, 'pedidos-atualizar': atualizar })[id] }, db: { from: () => query, rpc: async nome => { assert.equal(nome, "listar_vendedores_pedidos"); return { data: [{ id: "vendedor", nome: "Vendedor Público" }] }; } }, escapeHtml: valor => String(valor).replaceAll("<", "&lt;").replaceAll(">", "&gt;"), formatarPreco: valor => String(valor) });
    vm.runInContext(trecho, contexto);
    await contexto.carregarPedidos({ id: 'comprador' });
    if (erro === true) assert.match(status.textContent, /Sem conexão/);
    else if (erro === "pedido") { assert.match(lista.innerHTML, /&lt;Produto&gt;/); assert.match(lista.innerHTML, /25.15/); assert.match(lista.innerHTML, /Pedido registrado/); assert.match(lista.innerHTML, /Vendedor Público/); assert.doesNotMatch(lista.innerHTML, /Pedido #|Produto #/); }
    else assert.match(lista.innerHTML, /ainda não possui pedidos/);
    assert.equal(atualizar.disabled, false);
}
console.log('Compras: sucesso, total, payload seguro, duplicidade, falha, 5 bloqueios, validação e histórico vazio/erro passaram (simulados).');
