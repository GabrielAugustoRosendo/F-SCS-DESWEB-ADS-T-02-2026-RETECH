import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const script = await readFile(new URL('../js/script.js', import.meta.url), 'utf8');
const chave = 'retech-tamanho-fonte';
const resultados = [];

function ambiente({ memoria = new Map(), bloqueado = false, largura = 1440 } = {}) {
    let document;
    const no = () => ({
        attrs: {}, listeners: {}, style: {}, disabled: false,
        setAttribute(k, v) { this.attrs[k] = v; },
        addEventListener(k, fn) { this.listeners[k] = fn; },
        focus() { document.activeElement = this; }
    });
    const raiz = { attrs: {}, style: { setProperty(k, v) { this[k] = v; } }, toggleAttribute(k, ativo) { if (ativo) this.attrs[k] = ''; else delete this.attrs[k]; } };
    const cabecalho = { classes: new Set(), classList: { add(k) { cabecalho.classes.add(k); }, remove(k) { cabecalho.classes.delete(k); } } };
    const abrir = no(), aumentar = no(), diminuir = no(), restaurar = no(), status = no(), contraste = no(), estadoContraste = no();
    const painel = { ...no(), hidden: true, offsetWidth: Math.min(280, largura - 32), offsetHeight: 180 };
    const filhos = [abrir, aumentar, diminuir, restaurar, status, painel, contraste, estadoContraste];
    const controle = {
        ...no(), contains: el => filhos.includes(el),
        querySelector(s) { return ({ '.acessibilidade-abrir': abrir, '.acessibilidade-painel': painel, '.acessibilidade-status': status,
            '[data-fonte="aumentar"]': aumentar, '[data-fonte="diminuir"]': diminuir, '[data-fonte="restaurar"]': restaurar,
            '.acessibilidade-contraste': contraste, '.acessibilidade-contraste-estado': estadoContraste })[s]; }
    };
    const acoes = { criados: [], closest: () => cabecalho, appendChild(el) { this.criados.push(el); } };
    const window = {
        innerWidth: largura, innerHeight: 800, location: { search: '', pathname: '/index.html' }, listeners: {},
        addEventListener(k, fn) { this.listeners[k] = fn; },
        localStorage: {
            getItem(k) { if (bloqueado) throw new Error('Bloqueado'); return memoria.get(k) ?? null; },
            setItem(k, v) { if (bloqueado) throw new Error('Bloqueado'); memoria.set(k, v); },
            removeItem(k) { if (bloqueado) throw new Error('Bloqueado'); memoria.delete(k); }
        }
    };
    abrir.getBoundingClientRect = () => ({ right: largura - 64, bottom: 140 });
    document = {
        documentElement: raiz, activeElement: null, listeners: {},
        querySelector: s => s === '.acoes-cabecalho' ? acoes : null,
        querySelectorAll: () => [], createElement: () => controle,
        addEventListener(k, fn) { this.listeners[k] = fn; }
    };
    new vm.Script(script).runInContext(vm.createContext({ document, window, URLSearchParams }));
    const tecla = key => { const e = { key, preventDefault() { this.impedido = true; } }; controle.listeners.keydown(e); return e; };
    const escala = () => Number(raiz.style['--retech-escala-fonte']);
    return { abrir, aumentar, diminuir, restaurar, status, painel, controle, acoes, cabecalho, raiz, window, document, memoria, tecla, escala, contraste, estadoContraste };
}

{
    const a = ambiente();
    assert.equal(a.acoes.criados.length, 1);
    assert.equal(a.escala(), 1);
    a.abrir.listeners.click();
    assert.equal(a.painel.hidden, false);
    assert.equal(a.abrir.attrs['aria-expanded'], 'true');
    assert.equal(a.document.activeElement, a.aumentar);
    a.aumentar.listeners.click();
    assert.equal(a.escala(), 1.05);
    assert.equal(a.memoria.get(chave), '105');
    assert.ok('data-fontes-ampliadas' in a.raiz.attrs);
    assert.equal(ambiente({ memoria: a.memoria }).escala(), 1.05);
    a.diminuir.listeners.click();
    assert.equal(a.escala(), 1);
    assert.equal(a.memoria.has(chave), false);
    a.aumentar.listeners.click();
    a.restaurar.listeners.click();
    assert.equal(a.escala(), 1);
    assert.equal(a.memoria.has(chave), false);
    resultados.push('Botão, abertura, passos de 5%, persistência entre páginas e restauração');
}

{
    const a = ambiente();
    for (let i = 0; i < 20; i++) a.aumentar.listeners.click();
    assert.equal(a.escala(), 1.25);
    assert.equal(a.aumentar.disabled, true);
    assert.equal(a.diminuir.disabled, false);
    for (let i = 0; i < 20; i++) a.diminuir.listeners.click();
    assert.equal(a.escala(), .9);
    assert.equal(a.diminuir.disabled, true);
    assert.equal(a.aumentar.disabled, false);
    resultados.push('Limites de 90% a 125% e controles desativados nos extremos');
}

{
    const a = ambiente();
    a.abrir.focus();
    assert.equal(a.tecla('ArrowDown').impedido, true);
    assert.equal(a.document.activeElement, a.aumentar);
    a.tecla('ArrowRight');
    assert.equal(a.document.activeElement, a.diminuir);
    a.tecla('End');
    assert.equal(a.document.activeElement, a.contraste);
    a.tecla('Home');
    assert.equal(a.document.activeElement, a.aumentar);
    a.tecla('Escape');
    assert.equal(a.painel.hidden, true);
    assert.equal(a.document.activeElement, a.abrir);
    assert.equal(a.abrir.attrs['aria-expanded'], 'false');
    a.abrir.listeners.click();
    a.controle.listeners.focusout({ relatedTarget: a.restaurar });
    assert.equal(a.painel.hidden, false);
    a.controle.listeners.focusout({ relatedTarget: {} });
    assert.equal(a.painel.hidden, true);
    a.abrir.listeners.click();
    a.document.listeners.click({ target: {} });
    assert.equal(a.painel.hidden, true);
    resultados.push('Teclado, Escape com devolução de foco, Tab para fora e clique externo');
}

{
    for (const largura of [320, 375, 768, 1440]) {
        const a = ambiente({ largura });
        a.abrir.listeners.click();
        const direita = Number.parseFloat(a.painel.style.right);
        assert.ok(direita >= 16);
        assert.ok(direita + a.painel.offsetWidth <= largura - 16);
        assert.ok(Number.parseFloat(a.painel.style.top) >= 12);
    }
    resultados.push('Cálculo de posição do menu para larguras de celular, tablet e computador');
}

{
    for (const valor of ['0', '999', 'NaN', 'Infinity', '101', 'texto']) {
        assert.equal(ambiente({ memoria: new Map([[chave, valor]]) }).escala(), 1);
    }
    const a = ambiente({ bloqueado: true });
    a.aumentar.listeners.click();
    assert.equal(a.escala(), 1.05);
    assert.match(a.status.textContent, /não pôde ser salva/);
    const b = ambiente();
    b.window.listeners.storage({ key: chave, newValue: '120' });
    assert.equal(b.escala(), 1.2);
    b.window.listeners.storage({ key: null, newValue: null });
    assert.equal(b.escala(), 1);
    resultados.push('Preferência inválida, armazenamento bloqueado e sincronização entre abas');
}

{
    const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
    assert.ok(!/font-size\s*:[^;}]*\dpx/.test(css));
    assert.ok(css.includes('font-size: calc(100% * var(--retech-escala-fonte, 1))'));
    const paginas = (await readdir(new URL('../', import.meta.url))).filter(p => p.endsWith('.html'));
    for (const pagina of paginas) {
        const html = await readFile(new URL('../' + pagina, import.meta.url), 'utf8');
        assert.equal((html.match(/src="js\/script.js"/g) || []).length, 1, pagina);
        assert.ok(html.includes('class="acoes-cabecalho"'), pagina);
    }
    resultados.push('Fontes relativas e um único script compartilhado em todas as páginas');
}

{
    const a = ambiente();
    assert.equal(a.contraste.attrs['aria-pressed'], 'false');
    assert.ok(!('data-alto-contraste' in a.raiz.attrs));
    a.contraste.listeners.click();
    assert.ok('data-alto-contraste' in a.raiz.attrs);
    assert.equal(a.contraste.attrs['aria-pressed'], 'true');
    assert.equal(a.estadoContraste.textContent, 'Ativado');
    assert.equal(a.memoria.get('retech-alto-contraste'), 'true');
    a.aumentar.listeners.click();
    assert.equal(a.escala(), 1.05);
    assert.ok('data-alto-contraste' in a.raiz.attrs);
    const b = ambiente({ memoria: a.memoria });
    assert.equal(b.escala(), 1.05);
    assert.equal(b.contraste.attrs['aria-pressed'], 'true');
    b.restaurar.listeners.click();
    assert.equal(b.escala(), 1);
    assert.ok('data-alto-contraste' in b.raiz.attrs);
    a.contraste.listeners.click();
    assert.equal(a.escala(), 1.05);
    assert.equal(a.contraste.attrs['aria-pressed'], 'false');
    assert.ok(!('data-alto-contraste' in a.raiz.attrs));
    assert.ok(!a.memoria.has('retech-alto-contraste'));
    assert.equal(ambiente({ memoria: a.memoria }).contraste.attrs['aria-pressed'], 'false');
    resultados.push('Alto contraste alternável, persistente e independente da escala de fonte');
}

{
    for (const largura of [320, 375, 768, 1440]) {
        const a = ambiente({ largura, memoria: new Map([[chave, '125'], ['retech-alto-contraste', 'true']]) });
        assert.equal(a.escala(), 1.25);
        a.abrir.focus();
        a.tecla('ArrowUp');
        assert.equal(a.document.activeElement, a.contraste);
        a.contraste.listeners.click();
        assert.equal(a.contraste.attrs['aria-pressed'], 'false');
        assert.equal(a.painel.hidden, false);
        a.tecla('Escape');
        assert.equal(a.document.activeElement, a.abrir);
        a.window.listeners.storage({ key: 'retech-alto-contraste', newValue: 'true' });
        assert.equal(a.contraste.attrs['aria-pressed'], 'true');
        a.window.listeners.storage({ key: null, newValue: null });
        assert.equal(a.contraste.attrs['aria-pressed'], 'false');
        assert.equal(a.escala(), 1);
    }
    const bloqueado = ambiente({ bloqueado: true });
    bloqueado.contraste.listeners.click();
    assert.equal(bloqueado.contraste.attrs['aria-pressed'], 'true');
    assert.match(bloqueado.status.textContent, /não pôde ser salva/);
    assert.equal(ambiente({ memoria: new Map([['retech-alto-contraste', 'inválido']]) }).contraste.attrs['aria-pressed'], 'false');
    resultados.push('Contraste com fontes a 125%, teclado, larguras móveis, abas e armazenamento bloqueado');
}

{
    const luminancia = hex => {
        const canais = hex.match(/\w\w/g).map(v => Number.parseInt(v, 16) / 255)
            .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return canais[0] * .2126 + canais[1] * .7152 + canais[2] * .0722;
    };
    const contraste = (a, b) => (Math.max(luminancia(a), luminancia(b)) + .05) / (Math.min(luminancia(a), luminancia(b)) + .05);
    assert.equal(contraste('ffffff', '000000'), 21);
    assert.ok(contraste('ffe66d', '000000') >= 7);
    assert.ok(contraste('cfcfcf', '000000') >= 4.5);
    const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
    const modo = css.slice(css.indexOf('/* Alto contraste é optativo;'));
    assert.ok(modo.includes(':not(img):not(picture):not(svg):not(svg *):not(video):not(canvas)'));
    assert.ok(!/\bfilter\s*:/.test(modo));
    assert.ok(modo.includes('html[data-alto-contraste] :focus-visible'));
    resultados.push('Contraste calculado da paleta, foco destacado e imagens excluídas das substituições');
}

console.log(`${resultados.length} grupos de testes de acessibilidade aprovados:\n- ${resultados.join('\n- ')}`);
