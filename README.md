# ReTech

**Tecnologia que ganha uma nova vida.**

Plataforma web acadêmica para compra, venda, doação e troca de eletrônicos usados. O ReTech incentiva a reutilização de equipamentos, a economia circular e a inclusão digital, combinando anúncios com conteúdos educativos sobre sustentabilidade.

> Projeto em desenvolvimento. As funcionalidades descritas foram identificadas nos arquivos do repositório; a validação completa dos fluxos depende da configuração dos serviços e de testes em ambiente integrado.

## Sumário

- [Identificação e equipe](#identificação-e-equipe)
- [Contexto e objetivos](#contexto-e-objetivos)
- [Público-alvo](#público-alvo)
- [Páginas e funcionalidades](#páginas-e-funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Execução local](#execução-local)
- [Integração de dados](#integração-de-dados)
- [Identidade visual e qualidade](#identidade-visual-e-qualidade)
- [Situação atual e próximos passos](#situação-atual-e-próximos-passos)
- [Validação](#validação)
- [Documentação e colaboração](#documentação-e-colaboração)

## Identificação e equipe

| Item | Informação |
| --- | --- |
| Projeto | ReTech |
| Tema | Sustentabilidade e Impacto Social |
| Curso | Análise e Desenvolvimento de Sistemas |
| Disciplina | Desenvolvimento Web |
| Professor | Paulo Fratta |
| Ano | 2026 |
| Repositório | F-SCS-DESWEB-ADS-T-02-2026-RETECH |

### Integrantes

- André Carvalho.
- Gabriel Augusto.
- Pedro Victor.

A página [Sobre o ReTech](sobre.html) apresenta André com atuação em formulários e funcionalidades, Gabriel em desenvolvimento e navegação e Pedro em conteúdo e sustentabilidade. As atividades podem ser ajustadas pela equipe durante o desenvolvimento.

## Contexto e objetivos

Eletrônicos que ainda podem ser utilizados são descartados ou permanecem sem uso, enquanto outras pessoas precisam de equipamentos acessíveis para estudar, trabalhar e se comunicar. O ReTech aproxima esses públicos e incentiva o reaproveitamento antes do descarte.

O objetivo geral é desenvolver um site acessível e responsivo que promova a reutilização de eletrônicos e o consumo consciente.

### Objetivos específicos

- Manter dez páginas HTML interligadas.
- Oferecer catálogo com pelo menos quatro produtos, conforme a meta do escopo acadêmico.
- Permitir anúncios de venda, doação e troca.
- Facilitar busca, filtragem e consulta aos equipamentos.
- Disponibilizar cadastro, login e área pessoal.
- Oferecer contato com validação de formulário.
- Publicar conteúdos educativos sobre sustentabilidade e descarte correto.
- Atender computadores, tablets e smartphones, com recursos de acessibilidade.

## Público-alvo

- Pessoas que procuram eletrônicos usados por preços mais acessíveis.
- Vendedores que desejam divulgar equipamentos sem uso.
- Doadores e pessoas interessadas em trocas.
- Estudantes, famílias e comunidades que precisam de acesso à tecnologia.
- Pessoas com deficiência que necessitam de navegação acessível.
- Empresas e iniciativas sociais interessadas em reutilização e consumo consciente.

## Páginas e funcionalidades

As dez páginas principais já estão presentes no repositório.

A página adicional [pagar.html](pagar.html) apresenta uma demonstração visual de Pix, cartão de crédito e cartão de débito. A validação se limita ao comprimento dos campos: CPF com 11 caracteres para Pix e cartões; nos cartões, nome do titular de 2 a 80, número com 16, validade com 5 e código de segurança com 3 ou 4. A validade insere a barra automaticamente após os dois primeiros dígitos. Nenhum dado de pagamento é enviado ou armazenado, e a simulação não altera pedidos no banco.

| Página | Arquivo | Recursos presentes no código |
| --- | --- | --- |
| Início | [index.html](index.html) | Apresentação, categorias, destaques e chamadas para reutilização. |
| Catálogo | [catalogo.html](catalogo.html) | Listagem, busca, filtros por categoria e conservação e ordenação. |
| Detalhes do produto | [produto.html](produto.html) | Imagem, descrição, preço, condição, modalidade e informações públicas do anunciante. |
| Anunciar | [anunciar.html](anunciar.html) | Formulário de publicação com categoria, descrição, condição, modalidade, preço e imagem. |
| Login e cadastro | [login.html](login.html) | Criação de conta, entrada com e-mail e senha e tratamento de confirmação de e-mail. |
| Doações e trocas | [doar-trocar.html](doar-trocar.html) | Listagem e filtros por modalidade e categoria. |
| Meu perfil | [perfil.html](perfil.html) | Consulta e edição de dados, anúncios próprios, solicitações e saída da conta. |
| Sobre | [sobre.html](sobre.html) | Missão, visão, valores, equipe, economia circular e impacto social pretendido. |
| Blog | [blog.html](blog.html) | Conteúdo educativo, consulta de artigos publicados e inscrição em newsletter com consentimento. |
| Contato e ajuda | [contato.html](contato.html) | Formulário validado, consentimento e informações de suporte. |

### Fluxos de interação

- Usuários autenticados podem publicar anúncios e editar seus dados pessoais.
- O ícone ao lado de Anunciar produto abre e fecha o carrinho flutuante em todas as páginas, com contador, links dos produtos, total e exclusão com confirmação.
- Adicionar ao carrinho salva o item; Comprar agora também abre o carrinho para revisão.
- Finalizar compra registra pedidos pendentes por vendedor após confirmação. O servidor confere preços e disponibilidade, reserva os anúncios como pausados e remove os itens finalizados do carrinho em uma única transação.
- Doações e trocas enviam solicitação e mensagem na mesma transação, pela função `criar_solicitacao_com_mensagem`. Reenvios para o mesmo anúncio reutilizam uma solicitação ainda pendente.
- O perfil contém ações para cancelar solicitações pendentes ou aceitá-las e recusá-las, conforme o papel do usuário.
- Contato e newsletter possuem integração para registrar os dados enviados.

### Limites atuais

- A finalização registra pedidos pendentes, sem cobrar pagamentos nem confirmar entregas. Acompanhamento e cancelamento de pedidos ainda precisam de interface própria.
- Pagamento, entrega e conclusão integral de negociações não estão documentados como fluxos completos.
- Favoritos aparecem na interface, mas a integração define seu contador como zero; a persistência permanece pendente.
- O registro de mensagens nas solicitações não equivale a um chat completo.
- A presença da interface e da integração não garante que os serviços remotos estejam configurados ou que todos os cenários tenham sido testados.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 | Estrutura semântica, páginas e formulários. |
| CSS3 | Layout, identidade visual e responsividade. |
| JavaScript puro | Interações, filtros, validações e integração de dados. |
| Supabase Auth | Cadastro, login, sessão e saída da conta. |
| Supabase / PostgreSQL | Persistência e consulta de dados da aplicação. |
| Supabase Storage | Armazenamento de imagens de anúncios. |
| `supabase-js` versão 2 | Cliente carregado por CDN. |
| Font Awesome | Ícones disponibilizados localmente em `vendor/`. |
| Git e GitHub | Versionamento e colaboração. |

O front-end atual não possui `package.json` nem etapa de compilação. Visual Studio Code e DevTools apoiam o desenvolvimento; W3C Validator e Lighthouse são ferramentas previstas para validação.

### Hospedagem

A hospedagem definitiva deve ser confirmada pela equipe. O cadastro atual permanece na página de login para permitir testar o botão Entrar após a criação da conta.

PHP, MySQL, MySQLi e Railway faziam parte do planejamento anterior. A integração presente no repositório utiliza Supabase; a configuração definitiva de hospedagem deve ser documentada pela equipe.

## Estrutura do projeto

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
├── README.md
├── contexto.md
└── rules.md
```

- `js/script.js`: menus, filtros e interações gerais.
- `js/supabase.js`: inicialização do cliente do Supabase.
- `js/retech-supabase.js`: autenticação, perfil, anúncios, solicitações, blog e contato.
- `js/carrinho.js`: janela compartilhada, contador, itens, total e finalização de pedidos.
- `supabase/`: scripts de apoio à configuração do banco e das permissões.
- `style.css`: estilos compartilhados pelas páginas.

## Execução local

1. Clone ou abra este repositório no Visual Studio Code.
2. Sirva a pasta raiz por um servidor HTTP local, por exemplo com a extensão Live Server do VS Code.
3. Abra `index.html` pelo endereço HTTP fornecido pelo servidor.
4. Mantenha conexão com a internet para carregar o cliente por CDN e acessar os serviços do Supabase.
5. Para testar cadastro, login, anúncios e demais operações de dados, confira a configuração descrita abaixo.

Não é necessário executar `npm install` ou um comando de build na estrutura atual.

## Integração de dados

A inicialização está em [js/supabase.js](js/supabase.js), e os fluxos estão em [js/retech-supabase.js](js/retech-supabase.js).

Para utilizar outro ambiente, configurar a URL e a chave publicável correspondentes no cliente. Chaves administrativas, como `service_role`, não devem ser inseridas no front-end.

### Dependências do ambiente

A integração consulta ou grava dados em `usuarios`, `anuncios`, `categorias`, `carrinho`, `solicitacoes`, `mensagens`, `artigos`, `newsletter` e `contatos`. Também utiliza as funções `listar_vendedores_publicos`, `criar_solicitacao_com_mensagem` e `finalizar_carrinho` e o bucket de imagens `anuncios`. A finalização usa as tabelas existentes `pedidos` e `itens_pedido`; o navegador não recebe permissão de inserção direta nessas tabelas.

A consulta de vendedores retorna somente ID, nome, foto e localidade de quem possui anúncio ativo. O acesso interno fica no esquema `retech_private`, que deve permanecer fora dos esquemas expostos na Data API. A função de solicitações exige autenticação, mantém a aplicação de RLS e desfaz ambas as inserções se houver falha. As definições estão em `supabase/policies.sql`.

O envio de imagens aceita JPEG, PNG e WebP de até 5 MB. Se a publicação falhar, o cliente consulta se o anúncio foi gravado antes de tentar remover a imagem enviada, evitando apagar imagens de publicações concluídas cuja resposta tenha sido interrompida.

Os scripts disponíveis têm finalidades específicas:

| Script | Finalidade e pré-requisitos |
| --- | --- |
| [policies.sql](supabase/policies.sql) | Configura políticas RLS, permissões e regras de Storage para um banco existente. Depende de tabelas, colunas e buckets previamente criados; também referencia `pedidos` e `itens_pedido`. |
| [create-profile-trigger.sql](supabase/create-profile-trigger.sql) | Define a criação automática do perfil a partir de uma nova conta, conforme a necessidade indicada no próprio script. Depende da tabela `usuarios`. |

O repositório não contém um script completo de criação do esquema e dos buckets. Portanto, esses dois arquivos não são suficientes para reproduzir o ambiente do zero. Revisar os scripts e sua compatibilidade com o banco de destino antes de aplicá-los; esta documentação não implica sua execução.

Para testar novas contas sem confirmação de e-mail, desativar **Confirm Email** nas configurações de Authentication do Supabase. Essa exigência é controlada pelo serviço e não pode ser desabilitada apenas no HTML ou no JavaScript do navegador. Após criar a conta e salvar o perfil, o fluxo encerra a sessão automática e mantém o e-mail preenchido no formulário Entrar para testar o login separadamente.

## Identidade visual e qualidade

### Identidade visual

- **Fonte:** Arial, com alternativa `sans-serif`.
- **Verde:** `#16813D`.
- **Azul-escuro:** `#142C3E`.
- **Verde-claro:** `#EEF7EE`.
- **Branco:** `#FFFFFF`.
- **Mensagem:** “Tecnologia que ganha uma nova vida.”

A comunicação deve manter o foco em reutilização, sustentabilidade e inclusão digital. Imagens devem possuir autorização de uso ou identificação das fontes, quando aplicável.

### Requisitos de qualidade

- HTML semântico, rótulos nos formulários, textos alternativos e atributos ARIA quando necessários.
- Navegação por teclado, foco visível e contraste legível.
- Layout adaptável a computadores, tablets e smartphones.
- Validação de entradas, mensagens claras e tratamento de estados vazios e erros.
- Controle de acesso aos dados no serviço, além das verificações de interface.
- Proteção de dados pessoais e consentimento nos fluxos aplicáveis.
- Imagens otimizadas, títulos e descrições coerentes e código organizado.

Esses itens são requisitos a verificar. Não há declaração de conformidade integral de acessibilidade ou LGPD, nem resultados medidos de desempenho neste README.

## Situação atual e próximos passos

### Presente no repositório

- [x] Dez páginas HTML principais.
- [x] Identidade visual e estilos com regras responsivas.
- [x] Busca, filtros e menus em JavaScript.
- [x] Integração de autenticação, perfil e publicação de anúncios.
- [x] Integração de carrinho e solicitações de doação e troca.
- [x] Páginas institucionais, blog e contato.
- [x] Documentos de contexto e regras de desenvolvimento.

Essas marcações indicam a existência dos arquivos e do código, sem substituir a validação funcional.

### Pendências e melhorias

- [ ] Validar os fluxos integrados e as permissões com diferentes usuários.
- [ ] Completar a documentação de provisionamento do banco e do armazenamento.
- [ ] Implementar favoritos com persistência.
- [ ] Ampliar edição e encerramento dos anúncios e confirmação de negociações concluídas.
- [x] Implementar finalização de pedidos pendentes no servidor, com validação de preços e disponibilidade.
- [ ] Implementar acompanhamento e cancelamento de pedidos e definir o fluxo de pagamento e entrega.
- [ ] Evoluir a comunicação entre usuários.
- [ ] Implementar e validar filtros de daltonismo previstos no escopo inicial.
- [ ] Ampliar conteúdos multimídia com acessibilidade.
- [ ] Registrar testes de responsividade, acessibilidade, desempenho e SEO.
- [ ] Consolidar a configuração e a documentação de publicação.
- [ ] Organizar as evidências e a documentação acadêmica complementar.

## Validação

O teste de regressão em `tests/auth.test.mjs` cobre 47 cenários simulados de cadastro, login, perfil, cabeçalho, filtros, contato, newsletter, solicitações, upload, carrinho flutuante e botões de compra. Com Node.js instalado, executar:

```sh
node tests/auth.test.mjs
```

Esses testes usam respostas simuladas e não substituem a validação com o Supabase. Não há `package.json` nem instalação de dependências necessária para esse teste. O cadastro verifica a sessão e a gravação do perfil antes de exibir sucesso; o login tenta recuperar perfis ausentes e apresenta falhas de persistência sem redirecionar.

Para validar uma entrega:

1. Conferir links, recursos e navegação entre as dez páginas.
2. Verificar busca, filtros, ordenação e ausência de resultados.
3. Testar cadastro, confirmação de e-mail, login, edição de perfil e saída da conta.
4. Testar publicação e upload, carrinho e solicitações em ambiente apropriado.
5. Conferir o acesso como visitante, usuário autenticado e usuário sem permissão sobre registros de outra pessoa.
6. Verificar formulários com entradas válidas e inválidas e respostas de falha do serviço.
7. Avaliar telas de celular, tablet e computador e navegação por teclado.
8. Registrar verificações com W3C Validator, Lighthouse e leitor de tela quando realizadas.

As métricas propostas estão no [contexto.md](contexto.md#11-métricas). Anúncios publicados não devem ser contabilizados como equipamentos efetivamente reutilizados sem confirmação da conclusão.

## Documentação e colaboração

| Documento | Conteúdo |
| --- | --- |
| [README.md](README.md) | Apresentação, recursos atuais, execução e situação do projeto. |
| [contexto.md](contexto.md) | Problema, público, objetivos, escopo, requisitos e métricas propostas. |
| [rules.md](rules.md) | Convenções, regras de implementação, exemplos e orientações para pessoas colaboradoras e IA. |

Antes de contribuir, consultar as regras e os arquivos relacionados à alteração. Preservar os padrões existentes, manter mudanças focadas e informar o que foi verificado.

A pasta `docs/` permanece prevista para diário de bordo, evidências de testes, registros de acessibilidade e orçamento de hospedagem e domínio. O planejamento acadêmico inclui comparação de três opções de hospedagem, incluindo Railway, e três opções de domínio, com justificativa da escolha; isso não altera a stack atual.
