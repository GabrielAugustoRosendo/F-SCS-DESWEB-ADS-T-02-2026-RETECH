import * as vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = await readFile(new URL('../js/retech-supabase.js', import.meta.url), 'utf8');
const authTests = [];
async function testarAuth(caso) {
 const user = { id: 'u1', email: 'teste@example.com', identities: [{}], user_metadata: { nome: 'Teste' } };
 const status = { textContent: '', className: '' };
 const botao = { disabled: false };
 let submit, callback, gravacoes = 0, chamadasAuth = 0;
 const link = { classList: { remove() {}, toggle() {} } };
 const form = { id: caso.login ? 'formulario-login' : 'formulario-cadastro', reportValidity: () => true,
  querySelector: s => s === '[role=status]' ? status : botao,
  addEventListener: (_e, fn) => { submit = fn; }, reset() {} };
 const db = {
  auth: {
   onAuthStateChange(fn) { callback = fn; },
   getSession: async () => ({ data: { session: caso.sessaoInicial ? {user} : null } }),
   getUser: async () => { chamadasAuth++; return {data:{user}}; },
   signUp: async () => caso.duplicada ? {data:{user:{...user, identities:[]}},error:null} :
     caso.falhaAuth ? {error:{message:'User already registered'}} :
     {data:{user,session: caso.semSessao ? null : {user}}},
   signInWithPassword: async () => caso.senhaErrada ? {error:{message:'Invalid login credentials'}} : {data:{user,session:{user}}},
   signOut: async () => ({error: caso.falhaSaida ? {message:'Falha ao sair'} : null})
  },
  from() { return {
   select() { return this; }, eq() { return this; },
   maybeSingle: async () => ({data:caso.perfilExiste ? {id:user.id}:null,error:null}),
   upsert() { gravacoes++; return this; },
   single: async () => caso.falhaPerfil ? {error:{message:'RLS negou'}} : {data:{id:user.id}}
  }; }
 };
 const loc = {pathname:caso.home ? '/index.html':'/login.html',href:'',search:''};
 const document = {
  querySelectorAll(s) { if(s === '.formulario-login') return [form]; if(s === '.acoes-cabecalho .entrar') return [link]; return []; },
  querySelector() {return null;},
  getElementById(id) {return ['email','senha'].includes(id)?{value:'',focus(){}}:null;}
 };
 const context = vm.createContext({window:{retechDB:db,location:loc},document,URLSearchParams,
  FormData:class{get(key){return {nome:'Teste',email:user.email,senha:'senha123','confirmar-senha':caso.senhasDiferentes?'outra':'senha123'}[key];}}
 });
 new vm.Script(source).runInContext(context);
 await Promise.resolve(); await Promise.resolve();
 if(caso.home) {
  assert.equal(link.href,'perfil.html');
  callback('SIGNED_OUT',null); assert.equal(link.href,'login.html');
  callback('SIGNED_IN',{user}); assert.equal(link.href,'perfil.html');
  assert.equal(chamadasAuth,0);
 } else {
  await submit({preventDefault(){}});
  assert.equal(botao.disabled,false);
  if(caso.sucesso) assert.match(status.textContent,/Conta e perfil criados com sucesso/);
  else if(caso.login && !caso.senhaErrada && !caso.falhaPerfil) assert.equal(loc.href,'perfil.html');
  else {assert.notEqual(status.className,'perfil-status-sucesso'); assert.ok(status.textContent);}
  if(caso.duplicada || caso.semSessao || caso.falhaAuth || caso.senhasDiferentes || caso.senhaErrada) assert.equal(gravacoes,0);
  if(caso.falhaPerfil) assert.equal(loc.href,'');
 }
 authTests.push(caso.nome);
}
for (const caso of [
  {
    "nome": "Sessão inicial, saída e nova entrada no cabeçalho",
    "home": true,
    "sessaoInicial": true
  },
  {
    "nome": "Cadastro com perfil confirmado",
    "sucesso": true
  },
  {
    "nome": "Cadastro com perfil já existente",
    "sucesso": true,
    "perfilExiste": true
  },
  {
    "nome": "Resposta ofuscada de e-mail duplicado",
    "duplicada": true
  },
  {
    "nome": "Erro de e-mail já cadastrado",
    "falhaAuth": true
  },
  {
    "nome": "Cadastro sem sessão",
    "semSessao": true
  },
  {
    "nome": "Falha de gravação do perfil",
    "falhaPerfil": true
  },
  {
    "nome": "Falha de saída após cadastro",
    "falhaSaida": true
  },
  {
    "nome": "Confirmação de senha diferente",
    "senhasDiferentes": true
  },
  {
    "nome": "Login válido recupera perfil ausente",
    "login": true
  },
  {
    "nome": "Login com senha incorreta",
    "login": true,
    "senhaErrada": true
  },
  {
    "nome": "Login com falha de perfil não redireciona",
    "login": true,
    "falhaPerfil": true
  }
]) await testarAuth(caso);
console.log(authTests.length + ' cenários de autenticação aprovados.');


// Regressões de integração: todas as respostas são simuladas, sem rede ou gravações reais.
function funcao(nome, proximo) {
    return source.slice(source.indexOf('    ' + nome), source.indexOf('    ' + proximo, source.indexOf('    ' + nome) + 1));
}
const helpers = funcao('async function executarAcao(', 'async function usuarioAtual(');
function ambiente(valores) {
    const ctx = vm.createContext({ ...valores });
    new vm.Script(helpers).runInContext(ctx);
    return ctx;
}

for (const area of ['contato', 'newsletter']) {
    for (const modo of ['rede', 'servidor', 'sucesso', 'sem-consentimento']) {
        let enviar, gravacoes = 0, resets = 0;
        const status = { textContent: '' }, botao = { disabled: false };
        const formulario = {
            reportValidity: () => true,
            querySelector(s) { return s.includes('submit') ? botao : s.includes('consentimento') ? { checked: modo !== 'sem-consentimento' } : status; },
            addEventListener(_evento, fn) { enviar = fn; },
            reset() { resets++; }
        };
        const ctx = ambiente({
            path: area === 'contato' ? '/contato.html' : '/blog.html',
            document: { querySelector(s) { return s === '.blog-grade' ? null : formulario; } },
            usuarioAtual: async () => null,
            db: { from() { return { insert: async () => {
                gravacoes++;
                if (modo === 'rede') throw new Error('fetch failed');
                return { error: modo === 'servidor' ? { message: 'Permissão negada' } : null };
            } }; } },
            FormData: class { get(k) { return { nome: 'Teste', email: 'teste@example.com', mensagem: 'Mensagem de teste com tamanho suficiente.', assunto: 'conta' }[k]; } }
        });
        const nome = area === 'contato' ? 'inicializarContato' : 'inicializarBlog';
        const trecho = area === 'contato'
            ? source.slice(source.indexOf('    async function inicializarContato('), source.indexOf('    db.auth.getSession()'))
            : funcao('async function inicializarBlog(', 'async function inicializarContato(');
        new vm.Script(trecho).runInContext(ctx);
        await ctx[nome]();
        await enviar({ preventDefault() {} });
        assert.equal(botao.disabled, false, area + ' deve permitir nova tentativa');
        assert.equal(gravacoes, modo === 'sem-consentimento' ? 0 : 1);
        assert.equal(resets, modo === 'sucesso' ? 1 : 0);
        if (modo === 'rede') assert.match(status.textContent, /conexão/);
        if (modo === 'servidor') assert.match(status.textContent, /Permissão negada/);
        authTests.push(area + ': ' + modo);
    }
}

{
    let chamadas = 0;
    const ctx = ambiente({});
    await ctx.executarAcao({ disabled: true }, {}, async () => { chamadas++; });
    assert.equal(chamadas, 0);
    const botao = { disabled: false }, status = {};
    await ctx.executarAcao(botao, status, async () => { chamadas++; });
    assert.equal(chamadas, 1);
    assert.equal(botao.disabled, false);
    authTests.push('Ações bloqueiam envio duplicado e restauram o botão');
}

for (const falhaRPC of [false, true]) {
    const grade = { replaceChildren(...cards) { this.cards = cards; } };
    let filtroCompra = 0, filtroDoacao = 0;
    const ctx = ambiente({
        path: '/catalogo.html',
        document: { getElementById(id) { return id === 'grade-catalogo' ? grade : {}; } },
        db: {
            from() { return { select() { return this; }, in() { return this; }, eq() { return this; }, order: async () => ({ data: [{ id: 1, usuario_id: 'u1' }] }) }; },
            rpc: async () => ({ data: [], error: falhaRPC ? { message: 'RPC indisponível' } : null })
        },
        criarCard: v => v,
        escapeHtml: v => v,
        atualizarCatalogo() { filtroCompra++; },
        atualizarDoacaoTroca() { filtroDoacao++; }
    });
    new vm.Script(funcao('async function inicializarCatalogo(', 'async function inicializarProduto(')).runInContext(ctx);
    if (falhaRPC) {
        await assert.rejects(() => ctx.inicializarCatalogo(), /anunciantes/);
    } else {
        await ctx.inicializarCatalogo();
        assert.equal(filtroCompra, 1);
        assert.equal(filtroDoacao, 1);
        assert.equal(grade.cards.length, 1);
    }
    authTests.push('Catálogo: ' + (falhaRPC ? 'erro de anunciante visível' : 'filtros reaplicados'));
}

for (const falha of [false, true]) {
    let salvar, payload;
    const dados = { id: 'u1', nome: 'Teste', local: '', telefone: '', sobre: '' };
    const elementos = Object.fromEntries([
        'nome-perfil', 'email-perfil', 'local-perfil', 'telefone-perfil', 'sobre-perfil',
        'campo-nome', 'campo-local', 'campo-email', 'campo-telefone', 'campo-sobre',
        'perfil-status', 'perfil-anuncios', 'total-anuncios', 'total-vendidos', 'total-favoritos'
    ].map(id => [id, { value: '', textContent: '' }]));
    const botao = { disabled: false };
    elementos['formulario-perfil'] = { reportValidity: () => true, addEventListener(_e, fn) { salvar = fn; }, querySelector() { return botao; } };
    const ctx = ambiente({
        path: '/perfil.html',
        window: { addEventListener() {} },
        document: {
            getElementById(id) { return elementos[id] || null; },
            querySelectorAll() { return []; }
        },
        usuarioAtual: async () => ({ id: 'u1', email: 'teste@example.com' }),
        garantirPerfil: async () => {},
        mostrarMensagem(el, msg) { el.textContent = msg; },
        inicializarSolicitacoes: async () => {}, inicializarCarrinho: async () => {},
        db: { from(tabela) { return {
            select() { return this; }, eq() { return this; },
            maybeSingle: async () => ({ data: { ...dados } }),
            order: async () => ({ data: [] }),
            update(valores) { payload = valores; return this; },
            single: async () => falha ? { error: { message: 'RLS negou' } } : { data: { id: 'u1', ...payload } }
        }; } }
    });
    new vm.Script(funcao('async function inicializarPerfil(', 'async function inicializarSolicitacoes(')).runInContext(ctx);
    await ctx.inicializarPerfil();
    elementos['campo-local'].value = 'São Paulo';
    await salvar({ preventDefault() {} });
    assert.equal(Object.hasOwn(payload, 'id'), false, 'id não deve ser enviado no UPDATE');
    assert.equal(botao.disabled, false);
    assert.match(elementos['perfil-status'].textContent, falha ? /RLS negou/ : /sucesso/);
    assert.equal(elementos['local-perfil'].textContent, falha ? '' : 'São Paulo');
    authTests.push('Perfil: ' + (falha ? 'falha não altera resumo' : 'update somente de campos editáveis'));
}

for (const imagem of [{ type: 'image/gif', size: 100 }, { type: 'image/png', size: 5242881 }, { type: 'image/png', size: 0 }]) {
    let enviar;
    const status = { setAttribute() {} };
    const formulario = { appendChild() {}, querySelectorAll() { return []; }, reportValidity() { return true; }, addEventListener(_e, fn) { enviar = fn; } };
    const ctx = ambiente({
        path: '/anunciar.html',
        usuarioAtual: async () => ({ id: 'u1' }),
        document: {
            getElementById(id) { return id === 'formulario-anuncio' ? formulario : { files: [imagem] }; },
            createElement() { return status; }
        },
        FormData: class { get() { return 'venda'; } }
    });
    new vm.Script(funcao('async function inicializarAnuncio(', 'function criarCard(')).runInContext(ctx);
    await ctx.inicializarAnuncio();
    await enviar({ preventDefault() {} });
    assert.match(status.textContent, /JPEG, PNG ou WebP/);
    authTests.push('Upload rejeita arquivo inválido: ' + imagem.type + '/' + imagem.size);
}
console.log(authTests.length + ' cenários totais aprovados; nenhuma chamada ao banco real.');


for (const falha of [false, true]) {
    const elementos = {};
    let acao, chamadas = 0;
    const info = { querySelector() { return elementos.status || null; }, appendChild(el) { if (el.type === 'button') acao = el.click; else elementos.status = el; }, prepend() {} };
    const ctx = ambiente({
        path: '/produto.html',
        window: { location: { search: '?id=1' }, prompt: () => 'Gostaria de solicitar este equipamento.' },
        URLSearchParams,
        usuarioAtual: async () => ({ id: 'u1' }),
        formatarPreco: () => '', escapeHtml: v => v, nomeEstado: {}, nomeTipo: {},
        document: {
            getElementById(id) { return elementos[id] ||= {}; },
            querySelector() { return info; },
            createElement() { return { dataset: {}, setAttribute() {}, addEventListener(_e, fn) { this.click = fn; } }; }
        },
        db: {
            from() { return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { id: 1, usuario_id: 'v1', tipo_anuncio: 'doacao', status: 'ativo' } }) }; },
            rpc: async (nome) => {
                if (nome === 'listar_vendedores_publicos') return { data: [] };
                assert.equal(nome, 'criar_solicitacao_com_mensagem');
                chamadas++;
                return falha ? { error: { message: 'Transação recusada' } } : { data: 1 };
            }
        }
    });
    new vm.Script(funcao('async function inicializarProduto(', 'async function inicializarBlog(')).runInContext(ctx);
    await ctx.inicializarProduto();
    assert.ok(acao);
    await acao();
    assert.equal(chamadas, 1);
    assert.match(elementos.status.textContent, falha ? /recusada/ : /enviadas/);
    authTests.push('Solicitação usa uma única transação: ' + (falha ? 'erro' : 'sucesso'));
}

for (const cenario of ['remover', 'publicado', 'consulta-falhou']) {
    let enviar, remocoes = 0;
    const status = { textContent: '', setAttribute() {} }, botao = { disabled: false };
    const formulario = {
        reportValidity: () => true, appendChild() {}, querySelectorAll: () => [],
        querySelector: () => botao, addEventListener(_e, fn) { enviar = fn; }
    };
    const ctx = ambiente({
        path: '/anunciar.html',
        window: { location: {} }, crypto: { randomUUID: () => 'imagem-teste' },
        usuarioAtual: async () => ({ id: 'u1' }),
        document: {
            getElementById(id) { return id === 'formulario-anuncio' ? formulario : { files: [{ type: 'image/png', size: 100 }] }; },
            createElement() { return status; }
        },
        FormData: class { get(k) { return { modalidade: 'venda', categoria: 'computadores', nome: 'Notebook', descricao: 'Equipamento para estudo', estado: 'bom', preco: '100' }[k]; } },
        db: {
            from(tabela) { return {
                select() { return this; }, eq() { return this; },
                maybeSingle: async () => ({ data: { id: 1 } }),
                insert() { return this; },
                single: async () => ({ error: { message: 'Resposta da gravação interrompida' } }),
                then(resolve) { resolve(cenario === 'consulta-falhou' ? { error: { message: 'Sem conexão' } } : { data: cenario === 'publicado' ? [{ id: 1 }] : [] }); }
            }; },
            storage: { from() { return {
                upload: async () => ({ error: null }),
                getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/imagem.png' } }),
                remove: async () => { remocoes++; return { error: null }; }
            }; } }
        }
    });
    new vm.Script(funcao('async function inicializarAnuncio(', 'function criarCard(')).runInContext(ctx);
    await ctx.inicializarAnuncio();
    await enviar({ preventDefault() {} });
    assert.equal(remocoes, cenario === 'remover' ? 1 : 0);
    assert.equal(botao.disabled, false);
    if (cenario === 'publicado') assert.match(status.textContent, /foi publicado/);
    if (cenario === 'consulta-falhou') assert.match(status.textContent, /limpeza/);
    authTests.push('Limpeza de upload: ' + cenario);
}
console.log(authTests.length + ' cenários totais aprovados; nenhum dado real criado.');


async function testarCarrinhoFlutuante() {
    const codigo = await readFile(new URL('../js/carrinho.js', import.meta.url), 'utf8');
    const estado = {
        usuario: { id: 'u1' }, confirmar: false, exclusoes: 0, compras: 0,
        itens: [{ id: 1, anuncio_id: 10, anuncios: { id: 10, usuario_id: 'v1', nome_anuncio: 'Notebook', preco_anuncio: 100, status: 'ativo', tipo_anuncio: 'venda', imagem_url: '' } }]
    };
    function elemento() {
        return {
            listeners: {}, attrs: {}, dataset: {}, disabled: false, textContent: '',
            setAttribute(k, v) { this.attrs[k] = v; },
            addEventListener(k, fn) { this.listeners[k] = fn; },
            appendChild() {}, focus() {}, contains(alvo) { return this === alvo; },
            get innerHTML() { return this.html ?? this.textContent.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); },
            set innerHTML(v) { this.html = v; }
        };
    }
    const badge = elemento(), lista = elemento(), status = elemento(), total = elemento();
    const finalizar = elemento(), fechar = elemento(), acoes = elemento(), janela = elemento(), botao = elemento();
    janela.open = false;
    janela.show = () => { janela.open = true; };
    janela.close = () => { janela.open = false; janela.listeners.close(); };
    janela.querySelector = s => ({
        '.carrinho-itens': lista, '.carrinho-status': status, '.carrinho-finalizar': finalizar,
        '.carrinho-fechar': fechar, '.carrinho-total': total
    })[s];
    botao.querySelector = () => badge;
    let primeiroBotao = true;
    const document = {
        querySelector: () => acoes, listeners: {}, body: { appendChild() {} },
        addEventListener(k, fn) { this.listeners[k] = fn; },
        createElement(tipo) {
            if (tipo === 'button' && primeiroBotao) { primeiroBotao = false; return botao; }
            if (tipo === 'dialog') return janela;
            return elemento();
        }
    };
    const window = {
        location: { href: '' }, listeners: {}, confirm: () => estado.confirmar,
        setTimeout: fn => setTimeout(fn, 0), addEventListener(k, fn) { this.listeners[k] = fn; }
    };
    const db = {
        auth: {
            getUser: async () => ({ data: { user: estado.usuario } }),
            onAuthStateChange(fn) { estado.authCallback = fn; }
        },
        from() {
            let operacao = 'select', id;
            return {
                select() { return this; },
                eq(col, valor) { if (col === 'id') id = valor; return this; },
                order: async () => {
                    if (estado.falhaLeitura) throw new Error('fetch failed');
                    return { data: [...estado.itens] };
                },
                insert: async (item) => {
                    if (estado.itens.some(i => i.anuncio_id === item.anuncio_id)) return { error: { code: '23505' } };
                    estado.itens.push({ id: 2, anuncio_id: item.anuncio_id, anuncios: { id: item.anuncio_id, usuario_id: 'v1', nome_anuncio: 'Celular', preco_anuncio: 50, status: 'ativo', tipo_anuncio: 'venda' } });
                    return { error: null };
                },
                delete() { operacao = 'delete'; return this; },
                then(resolve) {
                    if (operacao === 'delete') {
                        estado.exclusoes++;
                        estado.itens = estado.itens.filter(i => i.id !== id);
                    }
                    resolve({ error: null });
                }
            };
        },
        rpc: async (nome, args) => {
            assert.equal(nome, 'finalizar_carrinho');
            assert.equal(args.p_total_esperado, 150);
            assert.equal(args.p_anuncio_ids.length, 2);
            estado.compras++;
            estado.itens = [];
            return { data: [{ id: 99, total: 150 }] };
        }
    };
    window.retechDB = db;
    new vm.Script(codigo).runInContext(vm.createContext({ window, document }));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(badge.textContent, '1');
    assert.match(total.textContent, /100,00/);
    assert.ok(lista.innerHTML.includes('produto.html?id=10'));
    assert.match(lista.innerHTML, /fa-trash-can/);
    authTests.push('Carrinho global: contador, total e links');

    await botao.listeners.click();
    assert.equal(janela.open, true);
    await botao.listeners.click();
    assert.equal(janela.open, false);
    authTests.push('Ícone alterna abertura e fechamento');

    const eventoExcluir = { target: { closest: () => ({ dataset: { id: '1' } }) } };
    await lista.listeners.click(eventoExcluir);
    assert.equal(estado.exclusoes, 0);
    authTests.push('Exclusão cancelada preserva o item');

    estado.confirmar = true;
    await lista.listeners.click(eventoExcluir);
    assert.equal(estado.exclusoes, 1);
    assert.equal(badge.textContent, '0');
    assert.equal(finalizar.disabled, true);
    authTests.push('Exclusão confirmada atualiza contador e total');

    await window.retechCarrinho.adicionar(10);
    await window.retechCarrinho.adicionar(10);
    assert.equal(estado.itens.length, 1);
    await window.retechCarrinho.adicionar(20);
    assert.equal(badge.textContent, '2');
    assert.match(total.textContent, /100,00/);
    // As inserções simuladas custam R$ 50 cada.
    estado.itens[0].anuncios.preco_anuncio = 100;
    await window.retechCarrinho.atualizar();
    assert.match(total.textContent, /150,00/);
    authTests.push('Adicionar persiste e impede duplicidade');

    estado.confirmar = false;
    await finalizar.listeners.click();
    assert.equal(estado.compras, 0);
    authTests.push('Finalização cancelada não registra pedido');

    estado.confirmar = true;
    await finalizar.listeners.click();
    assert.equal(estado.compras, 1);
    assert.equal(badge.textContent, '0');
    assert.match(status.textContent, /#99/);
    assert.match(status.textContent, /pendente/);
    authTests.push('Finalização usa total e IDs e esvazia carrinho');

    estado.itens = [{ id: 3, anuncio_id: 30, anuncios: null }];
    await window.retechCarrinho.atualizar();
    assert.equal(badge.textContent, '1');
    assert.equal(finalizar.disabled, true);
    assert.match(lista.innerHTML, /Indisponível/);
    authTests.push('Item indisponível permanece removível e bloqueia compra');

    estado.falhaLeitura = true;
    await assert.rejects(() => window.retechCarrinho.atualizar());
    assert.equal(finalizar.disabled, true);
    authTests.push('Falha ao atualizar impede finalização com dados antigos');
    estado.falhaLeitura = false;

    estado.usuario = null;
    estado.authCallback('SIGNED_OUT', null);
    assert.equal(badge.textContent, '0');
    await window.retechCarrinho.abrir();
    assert.match(lista.innerHTML, /login.html/);
    assert.equal(await window.retechCarrinho.adicionar(50), false);
    assert.equal(window.location.href, 'login.html');
    authTests.push('Visitante recebe acesso ao login e não vê itens privados');

    document.listeners.keydown({ key: 'Escape' });
    assert.equal(janela.open, false);
    authTests.push('Escape fecha a janela');
}
await testarCarrinhoFlutuante();
console.log(authTests.length + ' cenários totais aprovados, incluindo carrinho flutuante.');


for (const modo of ['visitante', 'comprador', 'proprietario']) {
    const botoes = [];
    let adicoes = 0, aberturas = 0;
    const info = { querySelector: () => ({ textContent: '' }), prepend() {}, appendChild() {} };
    const ctx = ambiente({
        path: '/produto.html', URLSearchParams,
        window: {
            location: { search: '?id=1' },
            retechCarrinho: {
                adicionar: async id => { assert.equal(id, 1); adicoes++; return true; },
                abrir: async () => { aberturas++; }
            }
        },
        document: {
            getElementById: () => ({ insertAdjacentElement(posicao) { assert.equal(posicao, 'afterend'); } }), querySelector: () => info,
            createElement(tipo) {
                const el = { dataset: {}, setAttribute() {}, appendChild() {}, addEventListener(_e, fn) { this.click = fn; } };
                if (tipo === 'button') botoes.push(el);
                return el;
            }
        },
        usuarioAtual: async () => modo === 'visitante' ? null : { id: modo === 'proprietario' ? 'v1' : 'u1' },
        db: {
            from() { return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { id: 1, usuario_id: 'v1', tipo_anuncio: 'venda', status: 'ativo', preco_anuncio: 100 } }) }; },
            rpc: async () => ({ data: [] })
        },
        nomeEstado: {}, nomeTipo: {}, escapeHtml: v => v, formatarPreco: () => ''
    });
    new vm.Script(funcao('async function inicializarProduto(', 'async function inicializarBlog(')).runInContext(ctx);
    await ctx.inicializarProduto();
    assert.equal(botoes.length, modo === 'proprietario' ? 0 : 2);
    if (modo !== 'proprietario') {
        assert.equal(botoes[0].textContent, 'Adicionar ao Carrinho');
        assert.equal(botoes[1].textContent, 'Comprar Agora');
        await botoes[0].click();
        await botoes[1].click();
        assert.equal(adicoes, 2);
        assert.equal(aberturas, 1);
    }
    authTests.push('Botões de produto: ' + modo);
}
console.log(authTests.length + ' cenários totais aprovados.');
