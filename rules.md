# Regras de desenvolvimento do ReTech

Diretrizes para pessoas colaboradoras e assistentes de IA que trabalham neste repositório.

## Sumário

- [1. Objetivo](#1-objetivo)
- [2. Contexto](#2-contexto)
- [3. Regras](#3-regras)
- [4. Exemplos](#4-exemplos)
- [5. Erros](#5-erros)
- [6. Perguntas](#6-perguntas)

## 1. Objetivo

Definir como desenvolver, revisar e documentar o ReTech, mantendo a organização do código, a identidade visual e a continuidade dos fluxos existentes.

As alterações devem apoiar a proposta do projeto: facilitar a compra, a venda, a doação e a troca de eletrônicos usados, promovendo sustentabilidade, economia circular e inclusão digital.

Estas regras orientam a implementação; não representam uma declaração de que todos os requisitos já foram atendidos.

## 2. Contexto

### Stack atual

- **HTML5:** dez páginas principais e a demonstração adicional `pagar.html` na raiz do repositório.
- **CSS3:** estilos compartilhados em `style.css`.
- **JavaScript puro:** interações e integração de dados em `js/`.
- **Supabase:** integração existente de autenticação, banco de dados e armazenamento de imagens, com `supabase-js` versão 2 carregado por CDN.
- **Font Awesome:** ícones locais em `vendor/fontawesome/`.
- **Git e GitHub:** versionamento e colaboração.

### Organização real

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Página inicial. |
| `catalogo.html` e `produto.html` | Catálogo e detalhes dos eletrônicos. |
| `anunciar.html` e `doar-trocar.html` | Publicação e consulta por modalidade. |
| `login.html` e `perfil.html` | Autenticação e área pessoal. |
| `sobre.html`, `blog.html` e `contato.html` | Conteúdo institucional, educativo e suporte. |
| `style.css` | Layout, componentes e responsividade. |
| `js/script.js` | Menus, busca, filtros e interações gerais. |
| `js/supabase.js` | Inicialização do cliente de integração. |
| `js/retech-supabase.js` | Fluxos de dados e autenticação. |
| `supabase/` | Scripts SQL de apoio à configuração. |
| `imagens/` | Imagens utilizadas no site. |
| `vendor/` | Dependências locais de terceiros. |

A pasta `docs/` é prevista no README; criar quando houver documentação complementar a armazenar.

### Estilo de código

- Usar UTF-8 e português do Brasil nos textos da interface e da documentação.
- Seguir a indentação de quatro espaços predominante no HTML, CSS e JavaScript.
- Usar nomes descritivos em português, respeitando identificadores de bibliotecas e do banco.
- Em JavaScript, seguir o padrão existente de `camelCase`, `const`, `let` e ponto e vírgula.
- Em classes, IDs e arquivos, seguir nomes em minúsculas separados por hífen, como `menu-toggle`, `campo-busca` e `doar-trocar.html`.
- Preservar os nomes de campos existentes na integração, como `nome_anuncio` e `tipo_anuncio`.

## 3. Regras

### Escopo e manutenção

- Ler os arquivos relacionados à solicitação antes de editar.
- Fazer alterações focadas na tarefa e preservar mudanças preexistentes de outras pessoas.
- Reutilizar componentes, estilos e funções antes de criar alternativas.
- Manter HTML, CSS e JavaScript nas responsabilidades descritas na seção de contexto.
- Não adicionar frameworks, dependências ou etapas de compilação sem necessidade justificada pelo pedido.
- Não renomear páginas nem mover pastas sem atualizar todos os caminhos afetados.
- Não editar arquivos de terceiros em `vendor/` para personalizar a aparência; aplicar ajustes em `style.css`.

### Interface e identidade visual

- Manter Arial como fonte principal e respeitar a paleta do projeto: verde `#16813D`, azul-escuro `#142C3E`, verde-claro `#EEF7EE` e branco `#FFFFFF`.
- Reutilizar classes como `container`, `botao`, `botao-verde` e os componentes de navegação existentes.
- Manter cabeçalho, menu e rodapé consistentes entre as páginas afetadas.
- Utilizar caminhos relativos para os recursos locais.
- Adaptar o layout a celular, tablet e computador, evitando rolagem horizontal desnecessária.
- Usar imagens adequadas ao conteúdo e registrar fontes ou autorização de uso quando aplicável.

### HTML e acessibilidade

- Manter `lang="pt-BR"`, codificação UTF-8, viewport, título e descrição coerentes em cada página.
- Usar elementos semânticos e uma hierarquia de títulos organizada.
- Associar campos aos respectivos rótulos com `for` e `id`; não usar somente o placeholder como identificação.
- Usar links para navegação e botões para ações.
- Garantir operação por teclado, foco visível e nomes acessíveis para controles.
- Atualizar atributos como `aria-expanded` quando o estado de um componente mudar.
- Fornecer texto alternativo descritivo em imagens informativas e `alt=""` nas decorativas.
- Ocultar ícones puramente decorativos de tecnologias assistivas com `aria-hidden="true"`.
- Não transmitir informações somente por cor nem remover o indicador de foco sem substituição visível.

### JavaScript e integração

- Verificar se os elementos existem antes de manipulá-los em scripts compartilhados.
- Preservar IDs, classes, nomes de campos e atributos `data-*` usados pelos seletores; atualizar os consumidores quando houver mudança.
- Evitar registrar eventos duplicados ou criar duas implementações concorrentes para a mesma ação.
- Manter a ordem de dependências: biblioteca do Supabase, inicialização do cliente e scripts que utilizam esse cliente.
- Tratar erros e apresentar estados de carregamento, sucesso, falha e ausência de resultados quando aplicável.
- Restaurar controles após falhas para permitir nova tentativa.
- Usar `textContent` para inserir texto fornecido por usuários; quando HTML dinâmico for necessário, escapar os valores externos antes da interpolação.
- Preservar os valores técnicos das modalidades: `venda`, `doacao` e `troca`. Exibir os rótulos com acentuação na interface.
- Manter preço obrigatório para venda, sem exigir valor monetário para doações ou trocas.
- Manter a validação HTML e JavaScript coerente com as restrições efetivas do serviço.

### Dados, autenticação e privacidade

- Usar o fluxo de autenticação existente e verificar o usuário antes de operações restritas.
- Aplicar autorização no serviço de dados; ocultar botões no navegador não substitui controle de acesso.
- Não expor senhas, tokens de sessão ou chaves privilegiadas em código, logs ou documentação.
- Distinguir a chave publicável do cliente de credenciais administrativas; nunca colocar uma chave `service_role` no front-end.
- Preservar as políticas de acesso e a separação dos registros por usuário ao alterar integrações.
- Validar tipo, tamanho e permissões de upload conforme as restrições do armazenamento.
- Manter explícito o consentimento nos fluxos de contato e newsletter que o exigem.
- Não coletar dados pessoais adicionais sem uma finalidade definida para a funcionalidade.
- Documentar mudanças de estrutura ou permissões em scripts SQL, com avaliação do impacto sobre os dados existentes.

### Verificação e documentação

- Conferir links, caminhos de recursos e seletores após alterações estruturais.
- Para mudanças visuais, verificar as páginas afetadas em diferentes tamanhos de tela e a navegação por teclado.
- Para mudanças funcionais, verificar o fluxo alterado, incluindo entradas inválidas, falhas e estados vazios relevantes.
- Em alterações de acesso a dados, verificar os cenários de visitante, usuário autenticado e acesso a registros de outro usuário, quando aplicável.
- Usar W3C Validator e Lighthouse quando a alteração justificar; registrar resultados efetivamente obtidos.
- Não inventar comandos de teste, ferramentas instaladas ou resultados de execução.
- Atualizar README e contexto quando o trabalho alterar escopo, arquitetura, estrutura ou situação das funcionalidades.
- Distinguir implementação identificada no código, funcionamento validado e melhoria planejada.
- Descrever na entrega o que mudou, como foi verificado e qualquer limitação que permaneça.

## 4. Exemplos

Os trechos abaixo usam caminhos e identificadores reais do projeto. Servem de referência para manter as convenções existentes.

### Campo de formulário em `anunciar.html`

O campo de nome do produto associa rótulo e entrada e define limite de tamanho:

```html
<label for="nome-produto">Nome do produto</label>
<input type="text" id="nome-produto" name="nome" placeholder="Ex.: iPhone 17 128 GB" required maxlength="80">
```

Ao mudar o identificador ou o atributo `name`, conferir também o tratamento do formulário em `js/retech-supabase.js`.

### Filtro em `js/script.js`

O catálogo utiliza valores de atributos `data-*` para comparar o produto com o filtro selecionado:

```javascript
const correspondeCategoria = categoria === "todos" || produto.dataset.categoria === categoria;
const correspondeEstado = estado === "todos" || produto.dataset.estado === estado;
const visivel = correspondeBusca && correspondeCategoria && correspondeEstado;
produto.hidden = !visivel;
```

Ao alterar categorias ou estados, conferir a consistência entre opções do formulário, atributos dos cards e valores recebidos da integração.

### Proteção de elementos opcionais em `js/script.js`

```javascript
if (mensagemVazia) mensagemVazia.hidden = encontrados > 0;
```

Esse padrão permite compartilhar o script com páginas que não possuem o mesmo conjunto de elementos.

### Distribuição de uma alteração

| Solicitação | Arquivos a examinar |
| --- | --- |
| Ajustar o menu em telas pequenas | `style.css`, `js/script.js` e cabeçalhos das páginas afetadas. |
| Alterar os campos de publicação | `anunciar.html` e `js/retech-supabase.js`; conferir compatibilidade com os dados persistidos. |
| Corrigir o filtro do catálogo | `catalogo.html`, `js/script.js` e geração dinâmica dos cards em `js/retech-supabase.js`. |
| Atualizar a missão do projeto | `sobre.html`, `README.md` e `contexto.md`, conforme o alcance da mudança. |

## 5. Erros

A IA e as pessoas colaboradoras devem evitar:

- Criar `produtos.html`, `css/style.css` ou `img/` por assumir que a estrutura planejada do README é a estrutura atual. Os caminhos existentes são `catalogo.html`, `style.css` e `imagens/`.
- Migrar para PHP/MySQL ou trocar a hospedagem sem que isso faça parte da solicitação.
- Tratar a presença de uma URL de publicação como prova de que o site foi acessado e está funcionando.
- Declarar favoritos, pagamento, entrega ou negociação completa como prontos sem verificar a implementação e o fluxo.
- Exibir sucesso antes de confirmar a operação de dados ou esconder uma falha com dados fictícios apresentados como reais.
- Usar `innerHTML` com conteúdo externo sem tratamento adequado.
- Remover autenticação, validações ou políticas de acesso para contornar um erro.
- Reutilizar exemplos com credenciais reais ou dados pessoais.
- Alterar seletores e nomes técnicos sem conferir suas dependências.
- Duplicar estilos de componentes existentes ou aplicar regras globais que prejudiquem outras páginas.
- Acrescentar estatísticas ambientais, conformidade legal ou resultados de testes sem evidência.
- Sobrescrever trabalho alheio ou executar ações destrutivas fora do escopo pedido.

## 6. Perguntas

Perguntar antes de prosseguir quando uma dúvida impedir a implementação correta ou envolver uma decisão com impacto relevante. Informar o ponto ambíguo e apresentar opções concretas.

| Situação | Exemplo de pergunta |
| --- | --- |
| Mudança de arquitetura | “A alteração deve manter a integração atual ou inclui uma migração de tecnologia?” |
| Regra de negócio indefinida | “O anúncio deve ser encerrado ao aceitar uma solicitação ou apenas após a confirmação da entrega?” |
| Operação destrutiva | “Os registros existentes devem ser preservados ou a exclusão faz parte desta tarefa?” |
| Mudança de identidade | “A nova paleta deve substituir a identidade do ReTech em todas as páginas?” |
| Recurso sem comportamento definido | “O carrinho deve apenas reunir itens de interesse ou terá um fluxo de finalização?” |
| Ambiente de publicação indefinido | “Qual ambiente deve receber a publicação e quais dados podem ser usados na validação?” |

Não pedir confirmação novamente para decisões já autorizadas. Ajustes locais e reversíveis que seguem os padrões existentes podem ser realizados diretamente; registrar suposições relevantes na entrega. Enquanto aguarda uma resposta necessária, continuar apenas o trabalho que não dependa dela.
