# Contexto do projeto ReTech

Documento de referência sobre a proposta, o escopo e a organização do ReTech.

> As funcionalidades descritas como presentes foram identificadas no código. Seu funcionamento em produção depende da configuração dos serviços e de testes. Melhorias e metas propostas estão identificadas ao longo do documento.

## Sumário

- [1. Nome](#1-nome)
- [2. Visão geral](#2-visão-geral)
- [3. Problema](#3-problema)
- [4. Público-alvo](#4-público-alvo)
- [5. Objetivos](#5-objetivos)
- [6. Funcionalidades](#6-funcionalidades)
- [7. Stack técnica](#7-stack-técnica)
- [8. Requisitos não funcionais](#8-requisitos-não-funcionais)
- [9. Estrutura](#9-estrutura)
- [10. Desejáveis](#10-desejáveis)
- [11. Métricas](#11-métricas)

## 1. Nome

**ReTech — Tecnologia que ganha uma nova vida.**

Projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas, desenvolvido na disciplina de Desenvolvimento Web, sob orientação do professor Paulo Fratta, em 2026.

- **Tema:** sustentabilidade e impacto social.
- **Integrantes:** André, Gabriel Augusto e Pedro Victor.
- **Proposta:** conectar pessoas interessadas em comprar, vender, doar e trocar eletrônicos usados.

## 2. Visão geral

O ReTech é uma plataforma web que incentiva a reutilização de equipamentos eletrônicos e a economia circular. O site reúne anúncios de celulares, computadores, videogames, câmeras e acessórios, além de conteúdos educativos sobre sustentabilidade.

A experiência combina catálogo, detalhes dos produtos, publicação de anúncios, autenticação e área pessoal. As páginas institucionais explicam a missão do projeto, enquanto o blog e a área de contato oferecem informação e apoio aos usuários.

Sua missão é promover o consumo consciente por meio da reutilização de eletrônicos. A visão é construir uma comunidade de tecnologia circular, acessível e sustentável, orientada por sustentabilidade, inclusão digital, transparência, solidariedade e inovação.

## 3. Problema

Equipamentos eletrônicos que ainda podem ser utilizados são descartados ou ficam sem uso. Isso reduz o aproveitamento de sua vida útil e contribui para a geração de lixo eletrônico.

Ao mesmo tempo, estudantes, famílias e outras pessoas precisam de alternativas mais acessíveis para obter equipamentos destinados ao estudo, ao trabalho e à comunicação. Quem deseja doar ou trocar aparelhos também precisa de um meio organizado para divulgar sua oferta.

O ReTech propõe aproximar esses públicos, facilitar a circulação de dispositivos usados e divulgar orientações sobre consumo consciente e descarte correto.

## 4. Público-alvo

| Público | Necessidade atendida |
| --- | --- |
| Consumidores | Encontrar eletrônicos usados por preços mais acessíveis. |
| Vendedores | Divulgar equipamentos que não utilizam mais. |
| Doadores | Disponibilizar aparelhos para outras pessoas. |
| Pessoas interessadas em trocas | Reaproveitar dispositivos por meio de troca. |
| Estudantes e famílias | Ampliar o acesso à tecnologia para estudo e atividades cotidianas. |
| Pessoas com deficiência | Utilizar uma plataforma com navegação acessível. |
| Empresas e iniciativas sociais | Participar de ações de reutilização, doação e consumo consciente. |

O acesso deve ser possível por computadores, tablets e smartphones.

## 5. Objetivos

### Objetivo geral

Desenvolver um site acessível e responsivo que incentive a reutilização de eletrônicos, promova a sustentabilidade e contribua para a inclusão digital.

### Objetivos específicos

- Disponibilizar dez páginas HTML interligadas.
- Apresentar um catálogo com pelo menos quatro produtos, conforme o escopo do README.
- Permitir a divulgação de anúncios de venda, doação e troca.
- Facilitar a busca e a consulta às informações dos equipamentos.
- Oferecer cadastro, login e uma área pessoal para os usuários.
- Disponibilizar formulário de contato com validação.
- Publicar conteúdos educativos sobre reutilização e descarte de eletrônicos.
- Adaptar a navegação a diferentes tamanhos de tela e necessidades de acessibilidade.

## 6. Funcionalidades

### Recursos presentes no código

| Área | Funcionalidades identificadas | Arquivo |
| --- | --- | --- |
| Início | Apresentação, categorias com contagens reais, quatro vendas ativas recentes, até três doações ou trocas ativas, orientações de uso e sustentabilidade. | [index.html](index.html) |
| Catálogo | Listagem de anúncios, busca, filtros por categoria e conservação e ordenação. | [catalogo.html](catalogo.html) |
| Produto | Consulta de descrição, imagem, preço, modalidade, condição e informações públicas do anunciante. | [produto.html](produto.html) |
| Anúncios | Formulário para anunciar eletrônicos, selecionar modalidade e enviar imagem. | [anunciar.html](anunciar.html) |
| Autenticação | Cadastro e login com e-mail e senha, validação e tratamento de confirmação de e-mail. | [login.html](login.html) |
| Doações e trocas | Listagem e filtros de anúncios dessas modalidades. | [doar-trocar.html](doar-trocar.html) |
| Perfil | Consulta e edição de dados pessoais, listagem dos próprios anúncios e saída da conta. | [perfil.html](perfil.html) |
| Sobre | Apresentação da missão, visão, valores, equipe e impacto social pretendido. | [sobre.html](sobre.html) |
| Blog | Conteúdos educativos, consulta de artigos publicados e inscrição em newsletter com consentimento. | [blog.html](blog.html) |
| Contato | Formulário validado, registro de consentimento e informações de ajuda. | [contato.html](contato.html) |

O carrinho é uma janela flutuante acessível pelo cabeçalho de todas as páginas, com contador, itens clicáveis, exclusão confirmada e total. A função `finalizar_carrinho` valida a seleção e os preços no servidor, registra pedidos pendentes por vendedor em `pedidos` e `itens_pedido`, reserva os anúncios como pausados e limpa os itens finalizados do carrinho na mesma transação. Nenhuma tabela nova é necessária. Comprar agora adiciona o produto e abre a janela para revisão; pagamento, entrega, acompanhamento e cancelamento dos pedidos ainda dependem de evolução.

Solicitação e mensagem são enviadas em uma única transação pela função `criar_solicitacao_com_mensagem`, mantendo as permissões do usuário. A consulta `listar_vendedores_publicos` retorna apenas dados públicos de vendedores com anúncios ativos. O upload valida imagens JPEG, PNG e WebP de até 5 MB, e os filtros são reaplicados após a carga dos anúncios. O teste existente em `tests/auth.test.mjs` cobre 47 cenários simulados; gravações reais não foram utilizadas para essa validação.

### Limites do escopo atual

- A home consulta os campos públicos de `anuncios` e `categorias` com a conexão existente. As contagens indicam vendas ativas. As listas têm carregamento, estado vazio e tratamento de falhas; são atualizadas a cada 30 segundos na aba visível e ao retornar à página, sem exigir alterações de Realtime no banco.

- A página adicional `pagar.html` é somente visual, com Pix, crédito e débito. `js/pagamento.js` alterna as opções e confere apenas a quantidade de caracteres dos campos. Não há envio ou armazenamento de dados de pagamento nem alteração de pedidos pela simulação.

- A integração dinâmica depende de autenticação, banco de dados, armazenamento e permissões configurados no Supabase.
- Favoritos aparecem no planejamento e na interface, mas o contador é definido como zero no código de integração; a persistência desse recurso permanece como melhoria.
- A presença das dez páginas no repositório atualiza o cenário do README, que ainda classifica algumas páginas existentes como planejadas.

## 7. Stack técnica

| Camada | Tecnologia ou ferramenta | Utilização |
| --- | --- | --- |
| Estrutura | HTML5 | Páginas, navegação, conteúdo e formulários. |
| Apresentação | CSS3 | Identidade visual, componentes e adaptação do layout. |
| Interação | JavaScript | Filtros, menus, validações e integração com serviços. |
| Ícones | Font Awesome | Ícones disponibilizados na pasta `vendor/`. |
| Serviços de dados | Supabase | Autenticação, acesso ao banco PostgreSQL e armazenamento de imagens, conforme a integração existente. |
| Cliente de integração | `supabase-js` versão 2 | Comunicação do navegador com o Supabase, carregada por CDN. |
| Versionamento | Git e GitHub | Histórico de alterações e colaboração. |
| Desenvolvimento | Visual Studio Code e DevTools | Edição e inspeção do site. |
| Validação prevista | W3C Validator e Lighthouse | Avaliação de HTML, desempenho, acessibilidade e SEO. |

**Diferenças em relação ao planejamento:** o README prevê PHP, MySQL e MySQLi para o back-end e Railway para hospedagem. Os arquivos atuais utilizam Supabase e contêm uma URL de redirecionamento de autenticação na Vercel. Esses registros não comprovam o estado de uma publicação ativa; a arquitetura e a hospedagem definitivas devem ser mantidas alinhadas na documentação.

## 8. Requisitos não funcionais

Os itens abaixo representam requisitos e critérios de qualidade a verificar, sem pressupor certificação ou conformidade já alcançada.

| Categoria | Requisito |
| --- | --- |
| Acessibilidade | Usar HTML semântico, textos alternativos, rótulos de formulários, contraste legível, navegação por teclado e atributos ARIA quando necessários. |
| Responsividade | Manter leitura, navegação e formulários utilizáveis em computadores, tablets e smartphones. |
| Usabilidade | Apresentar menus consistentes, mensagens claras de sucesso e erro e orientação em estados vazios. |
| Desempenho | Otimizar imagens e recursos, evitando carregamentos desnecessários. |
| Segurança | Validar dados e aplicar controle de acesso às operações e aos registros de cada usuário. |
| Privacidade | Proteger dados pessoais, registrar consentimento quando aplicável e revisar os fluxos conforme os requisitos da LGPD. |
| Manutenibilidade | Organizar arquivos e responsabilidades, utilizar nomes consistentes e manter a documentação atualizada. |
| SEO | Definir títulos, descrições e hierarquia de cabeçalhos coerentes com cada página. |
| Sustentabilidade | Incentivar a reutilização e disponibilizar orientações sobre consumo consciente e descarte adequado. |

A identidade visual utiliza Arial e as cores verde (`#16813D`), azul-escuro (`#142C3E`), verde-claro (`#EEF7EE`) e branco (`#FFFFFF`), conforme o README e os estilos do projeto.

## 9. Estrutura

### Organização dos arquivos

```text
ReTech/
├── index.html
├── catalogo.html
├── produto.html
├── anunciar.html
├── login.html
├── doar-trocar.html
├── perfil.html
├── sobre.html
├── blog.html
├── contato.html
├── style.css
├── js/
│   ├── script.js
│   ├── supabase.js
│   ├── carrinho.js
│   └── retech-supabase.js
├── supabase/
│   ├── policies.sql
│   └── create-profile-trigger.sql
├── imagens/
├── vendor/
│   └── fontawesome/
│       └── css/
│           └── all.min.css
├── README.md
└── contexto.md
```

- `style.css`: estilos compartilhados pelas páginas.
- `js/script.js`: interações gerais, menus e filtros locais.
- `js/supabase.js`: inicialização do cliente de integração.
- `js/carrinho.js`: carrinho flutuante compartilhado e finalização de pedidos.
- `js/retech-supabase.js`: fluxos de autenticação, perfil, anúncios e demais operações de dados.
- `supabase/`: scripts SQL de apoio à configuração do serviço.
- `imagens/` e `vendor/`: recursos visuais e dependências locais.

### Fluxos principais de navegação

1. **Explorar:** início → catálogo → detalhes do produto.
2. **Anunciar:** login ou cadastro → formulário de anúncio → perfil.
3. **Doar ou trocar:** listagem de doações e trocas → detalhes → solicitação por usuário autenticado.
4. **Aprender e obter ajuda:** menu de navegação → sobre, blog ou contato.

A pasta `docs/` é prevista no README para evidências de testes, registros de acessibilidade, diário de bordo e orçamento de hospedagem e domínio; ela ainda não aparece na estrutura consultada.

## 10. Desejáveis

Melhorias propostas para evolução do projeto, sujeitas à priorização da equipe:

- [ ] Implementar favoritos com persistência por usuário.
- [ ] Ampliar o gerenciamento dos anúncios, incluindo edição, encerramento e indicação de conclusão da negociação.
- [ ] Evoluir a comunicação entre usuários e o acompanhamento das solicitações.
- [ ] Ampliar o fluxo de negociação com acompanhamento, cancelamento, pagamento e entrega dos pedidos.
- [ ] Implementar e validar filtros de daltonismo previstos no README.
- [ ] Ampliar conteúdos multimídia educativos com recursos de acessibilidade.
- [ ] Documentar os testes e os resultados de acessibilidade e responsividade.
- [ ] Atualizar o README para refletir as páginas e a integração existentes.
- [ ] Consolidar a escolha de hospedagem e documentar a configuração de publicação.

## 11. Métricas

Os indicadores abaixo são uma proposta de acompanhamento. Não foram fornecidos resultados medidos de uso, desempenho ou impacto ambiental.

| Dimensão | Indicador | Meta ou forma de avaliação |
| --- | --- | --- |
| Cobertura do escopo | Páginas principais disponíveis e interligadas | Validar as dez páginas previstas no README e seus links de navegação. |
| Catálogo | Quantidade de produtos disponíveis | Verificar o mínimo de quatro produtos definido no README. |
| Fluxos essenciais | Conclusão de cadastro, login, publicação e contato | Executar cada fluxo em ambiente de teste e registrar sucesso ou falha. |
| Busca e filtros | Correspondência dos resultados aos critérios | Conferir busca, categoria, estado, modalidade, ordenação e ausência de resultados. |
| Responsividade | Uso das páginas em diferentes telas | Verificar navegação e formulários em celular, tablet e computador. |
| Acessibilidade | Barreiras encontradas e corrigidas | Registrar verificações manuais por teclado e leitor de tela, complementadas por avaliação automatizada. |
| Desempenho e SEO | Resultados do Lighthouse | Registrar pontuações por página e comparar a evolução entre versões. |
| Adoção | Contas e anúncios criados por período | Acompanhar registros válidos, separando testes de uso real. |
| Reutilização | Vendas, doações e trocas efetivamente concluídas | Medir após existir confirmação de conclusão; anúncios publicados não equivalem a aparelhos reutilizados. |
| Conteúdo e suporte | Inscrições na newsletter e contatos recebidos | Acompanhar totais por período, respeitando consentimento e privacidade. |

Estimativas de lixo eletrônico evitado exigem dados sobre equipamentos efetivamente reutilizados e uma metodologia documentada. Até essa definição, o impacto ambiental deve ser apresentado como objetivo do projeto.
