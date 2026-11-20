# ReTech

**Tecnologia que ganha uma nova vida.**

O ReTech é um market place para divulgar, encontrar e reaproveitar eletrônicos usados. O catálogo reúne ofertas de venda, doação e troca. O blog complementa a experiência com orientações sobre compra de usados, conservação dos aparelhos e descarte de resíduos eletrônicos.

O projeto busca manter equipamentos em circulação por mais tempo, facilitar o acesso à tecnologia e incentivar o consumo consciente. Foi desenvolvido em 2026 na disciplina de Desenvolvimento Web do curso de Análise e Desenvolvimento de Sistemas, sob orientação do professor Paulo Fratta.

**Equipe:** André Carvalho, Gabriel Augusto e Pedro Victor.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Páginas](#páginas)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Execução local](#execução-local)
- [Integração com o Supabase](#integração-com-o-supabase)
- [Testes](#testes)

## Funcionalidades

| Recurso | Comportamento |
| --- | --- |
| Cadastro e login | Criação de conta e entrada por e-mail e senha com Supabase Auth. O login verifica o perfil da conta na tabela de usuários, cria o registro se necessário e abre a área pessoal. |
| Perfil | Consulta e edição de nome, localidade, telefone e apresentação pessoal. Reúne anúncios próprios, favoritos, solicitações, pedidos e saída da conta. |
| Anúncios | Usuários autenticados podem publicar ofertas de venda, doação ou troca e consultar seus anúncios no perfil. O formulário registra categoria, conservação, descrição e imagem. O preço é exigido para venda. |
| Upload | A publicação envia uma imagem JPEG, PNG ou WebP de até 5 MB ao Supabase Storage e associa sua URL ao anúncio. |
| Busca e filtros | O catálogo de vendas tem busca por nome ou categoria, filtros por categoria e conservação e ordenação por preço ou nome. A listagem de doações e trocas tem filtros por modalidade e categoria. |
| Carrinho | Janela disponível pelo cabeçalho, com contador, links para os produtos, total e remoção de itens. O carrinho direciona para a revisão da compra. |
| Compra simulada | A revisão oferece Pix, cartão de crédito e débito como opções de demonstração. A confirmação registra pedidos por vendedor e reserva os anúncios. Não há cobrança, e CPF e dados do cartão permanecem no formulário. |
| Favoritos | O coração nos cards e nos detalhes permite salvar ou remover anúncios. A lista fica associada à conta e pode ser consultada na aba **Favoritos**, com contador e opção de remoção. |
| Meus pedidos | O comprador consulta itens, preços registrados, total, data, status e informações do vendedor. Pedidos com status interno `pendente` aparecem como **Pedido registrado**. |
| Solicitações | Em anúncios de doação ou troca, o usuário envia uma solicitação acompanhada de mensagem. O solicitante pode cancelar uma solicitação pendente, e o anunciante pode aceitar ou recusar. |
| Blog, newsletter e contato | O blog tem três artigos completos com fontes, três vídeos do YouTube e um formulário de newsletter. A página de contato registra mensagens. Os dois formulários registram consentimento. |
| Acessibilidade | O menu do cabeçalho permite ajustar a fonte de 90% a 125%, restaurar o padrão e alternar o alto contraste. Os controles podem ser usados pelo teclado, e as preferências são armazenadas no navegador. |

As políticas de `anuncios` definidas no SQL autorizam atualização e exclusão pelo proprietário. Na interface desta versão, **Meus anúncios** lista os registros e oferece acesso à publicação e aos detalhes.

## Páginas

| Página | Conteúdo |
| --- | --- |
| [Início](index.html) | Apresentação, contagens de vendas ativas por categoria, até quatro vendas recentes e até três ofertas de doação ou troca. |
| [Catálogo](catalogo.html) | Listagem de vendas, busca, filtros e ordenação. |
| [Detalhes do produto](produto.html) | Imagem, descrição, conservação, modalidade, anunciante e ações conforme o tipo de oferta. |
| [Anunciar](anunciar.html) | Formulário de publicação com envio de imagem. |
| [Doações e trocas](doar-trocar.html) | Listagem de ofertas com filtros por modalidade e categoria. |
| [Entrar e criar conta](login.html) | Formulários de login e cadastro. |
| [Perfil](perfil.html) | Dados pessoais, anúncios próprios, favoritos, solicitações e histórico de compras. |
| [Revisar compra](pagar.html) | Itens, total e confirmação da compra simulada. Acessada pelo carrinho ou por **Comprar agora**. |
| [Blog](blog.html) | Artigos sobre compra, vida útil e descarte de eletrônicos, cards educativos, vídeos e inscrição na newsletter. |
| [Sobre](sobre.html) | Missão, visão, valores e equipe do ReTech. |
| [Contato](contato.html) | Informações de suporte e formulário de mensagem. |

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 e CSS3 | Páginas estáticas, formulários e layout responsivo. |
| JavaScript puro | Interações, filtros, validações, acessibilidade e comunicação com o Supabase. |
| Supabase Auth, PostgreSQL e Storage | Autenticação, persistência, autorização por RLS e armazenamento de imagens. |
| `supabase-js` v2 | Cliente do Supabase carregado pelo jsDelivr e inicializado em `js/supabase.js`. |
| Font Awesome Free | Ícones e fontes WOFF2 distribuídos localmente. |
| YouTube | Players incorporados no blog, com carregamento sob demanda. |
| Node.js | Execução das suítes automatizadas. |
| Git e GitHub | Versionamento e colaboração. |

## Estrutura do projeto

```text
ReTech/
├── index.html
├── catalogo.html
├── produto.html
├── anunciar.html
├── doar-trocar.html
├── login.html
├── perfil.html
├── pagar.html
├── blog.html
├── sobre.html
├── contato.html
├── style.css
├── imagens/
├── js/
│   ├── script.js
│   ├── supabase.js
│   ├── retech-supabase.js
│   ├── carrinho.js
│   ├── inicio.js
│   └── pagamento.js
├── supabase/
│   ├── policies.sql
│   ├── create-profile-trigger.sql
│   ├── favoritos.sql
│   └── historico-pedidos.sql
├── tests/
│   ├── acessibilidade.test.mjs
│   ├── auth.test.mjs
│   ├── compras.test.mjs
│   ├── favoritos.test.mjs
│   └── inicio.test.mjs
├── vendor/
│   └── fontawesome/
│       ├── css/
│       └── webfonts/
├── README.md
├── contexto.md
└── rules.md
```

`script.js` reúne navegação, acessibilidade e filtros. `retech-supabase.js` reúne os fluxos de conta, perfil, catálogo, anúncios, favoritos, pedidos, solicitações e formulários. `carrinho.js` controla a janela compartilhada, `inicio.js` carrega os anúncios e as contagens da home e `pagamento.js` controla a revisão da compra.

## Execução local

1. Clone o repositório ou abra a pasta do projeto.
2. Sirva a raiz por HTTP local, por exemplo, com a extensão Live Server do VS Code.
3. Abra `index.html` pela URL do servidor. Mantenha a conexão com a internet para carregar a biblioteca por CDN, acessar o Supabase e assistir aos vídeos incorporados.
4. Para conectar outro ambiente, configure a URL do projeto e a chave **publicável** em [js/supabase.js](js/supabase.js) e use um banco com o esquema e os objetos descritos abaixo.

O front-end é servido diretamente, sem `npm install` ou compilação. O Supabase Auth controla a exigência de confirmação de e-mail. Quando o cadastro retorna uma sessão, a aplicação confirma o perfil e volta ao formulário **Entrar**.

## Integração com o Supabase

### Modelo de dados

| Tabelas | Papel no sistema |
| --- | --- |
| `auth.users` e `public.usuarios` | Contas autenticadas e perfis da aplicação, relacionados pelo ID da conta. |
| `categorias` e `anuncios` | Categorias e ofertas vinculadas a uma categoria e ao anunciante. |
| `carrinho` e `favoritos` | Relações entre o usuário e os anúncios que adicionou ao carrinho ou salvou. Favoritos usam chave primária composta por `usuario_id` e `anuncio_id`. |
| `pedidos` e `itens_pedido` | Pedidos vinculados a comprador e vendedor, com itens relacionados aos anúncios e preço unitário registrado na compra. |
| `solicitacoes` e `mensagens` | Solicitações de doação ou troca e mensagens associadas à negociação. |
| `newsletter` e `contatos` | Inscrições e mensagens enviadas pelos formulários, com registro de consentimento. |

O catálogo público consulta anúncios ativos. As políticas de segurança em nível de linha (**RLS**) restringem dados privados e operações de escrita conforme o usuário. O bucket `anuncios` armazena as imagens de publicação em caminhos iniciados pelo ID do anunciante.

### Scripts do repositório

| Script | Responsabilidade |
| --- | --- |
| [policies.sql](supabase/policies.sql) | Define RLS, permissões, regras de Storage, funções e proteções de estado para um banco previamente provisionado. |
| [create-profile-trigger.sql](supabase/create-profile-trigger.sql) | Define o gatilho que cria um perfil a partir de uma nova conta em `auth.users`. |
| [favoritos.sql](supabase/favoritos.sql) | Cria a tabela `favoritos`, suas chaves e as políticas de leitura, inclusão e remoção da própria conta. |
| [historico-pedidos.sql](supabase/historico-pedidos.sql) | Define a leitura dos anúncios reservados pelos participantes do pedido e a consulta ao nome do vendedor pelo comprador. Usa o esquema `retech_private`, definido em `policies.sql`. |

Os scripts complementam um esquema existente. Em uma instância nova, o esquema-base e os buckets precisam ser provisionados separadamente. `policies.sql` também referencia objetos preexistentes, como `public.artigos`, o bucket `avatares` e a função `public.rls_auto_enable()`. Para uso pelo navegador, mantenha apenas a chave publicável no cliente e deixe `retech_private` fora dos esquemas expostos pela API.

### Operações transacionais

- `finalizar_carrinho` valida no banco os itens selecionados, a disponibilidade e o total esperado. Na mesma transação, cria os pedidos e itens, pausa os anúncios reservados e remove os itens comprados do carrinho. A confirmação abre **Meus pedidos**.
- `criar_solicitacao_com_mensagem` registra a solicitação e a mensagem na mesma transação. Se já houver solicitação pendente do usuário para o mesmo anúncio, reutiliza esse registro.
- `listar_vendedores_publicos` fornece os campos públicos dos anunciantes com ofertas ativas. `listar_vendedores_pedidos` fornece o nome dos vendedores dos pedidos do comprador autenticado.

## Testes

Execute com Node.js na raiz do projeto.

```sh
node --test
```

As cinco suítes cobrem acessibilidade, autenticação e fluxos compartilhados, compra e histórico, favoritos e carregamento da home. Elas usam ambientes e respostas simulados, sem gravar dados no Supabase.

Para conhecer a proposta acadêmica e as convenções do repositório, consulte [contexto.md](contexto.md) e [rules.md](rules.md).
