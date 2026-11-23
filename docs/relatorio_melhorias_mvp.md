# Relatório de Melhorias — MVP para Versão Final

## 1. Contexto
O ReTech evoluiu de uma proposta de marketplace de reutilização de eletrônicos para uma aplicação com páginas e fluxos de usuário, integração com banco de dados e funcionalidades de conta. Este relatório descreve a evolução identificada no repositório. Como não foi localizada uma ata detalhada da apresentação do MVP com feedback do professor, os pontos abaixo são melhorias/evoluções técnicas observáveis ou descritas no README, e não devem ser apresentados como críticas recebidas oficialmente.
## 2. Evoluções identificadas
| Área | Base/necessidade do MVP | Evolução na versão atual | Evidência/observação |
|---|---|---|---|
| Navegação | Estrutura inicial e acesso às áreas | Páginas separadas para início, catálogo, produto, anunciar, doar/trocar, login, perfil, compra, blog, sobre e contato | Páginas listadas no README |
| Catálogo | Exibir produtos | Busca, filtros de categoria/conservação e ordenação por preço/nome | README e `catalogo.html` |
| Conta | Acesso do usuário | Supabase Auth, perfil e áreas pessoais | README e scripts de integração |
| Anúncios | Apresentar ofertas | Publicação de venda, doação ou troca com descrição, categoria, conservação e imagem | README |
| Imagens | Mostrar produtos | Upload de JPEG, PNG ou WebP até 5 MB para Storage | README |
| Carrinho/compra | Possibilitar interesse em produtos | Carrinho, revisão, compra simulada, pedidos e reserva de anúncios | README; fluxo não processa pagamento real |
| Favoritos | Guardar itens de interesse | Favoritos associados à conta, com listagem e remoção | README e teste automatizado citado |
| Doação/troca | Incentivar circulação de aparelhos | Solicitações com mensagem e ações de cancelamento, aceitação ou recusa | README |
| Conteúdo | Informar sobre sustentabilidade | Blog com artigos, vídeos e newsletter | README |
| Acessibilidade | Facilitar o acesso | Ajuste de fonte e alto contraste, controles por teclado | README; requer verificação manual/evidência |
| Persistência | Guardar informações | Supabase/PostgreSQL, políticas RLS e Storage | Scripts SQL e README |
| Qualidade | Evitar regressões | Suítes automatizadas para acessibilidade, autenticação, compras, favoritos e início | Arquivos de testes descritos no README |
## 3. Melhorias antes/depois para apresentação
| Antes (MVP/estrutura inicial — confirmar com prints antigos) | Depois (versão atual descrita no repositório) |
|---|---|
| Experiência inicial concentrada na apresentação e navegação básica | Fluxos separados para catálogo, detalhes, anúncios, doações/trocas e perfil |
| Produtos apenas apresentados como conteúdo | Anúncios consultáveis e publicação com upload de imagem |
| Sem fluxo de conta integrado ou ainda em desenvolvimento | Cadastro, login e perfil com Supabase Auth |
| Sem organização de itens de interesse | Favoritos e carrinho |
| Sem acompanhamento de transações simuladas | Revisão de compra e registro de pedidos simulados |
| Interação de doação/troca limitada | Solicitações e mensagens, com ações de gerenciamento |
| Conteúdo informativo básico | Blog com artigos, vídeos e newsletter |
| Acessibilidade inicial | Ajuste de fonte e modo de alto contraste documentados |

**Importante:** a coluna “Antes” é um modelo de comparação para ser confirmado pela equipe com a versão real do MVP e capturas de tela. Não utilizar como prova de ausência de funcionalidades sem verificar o código antigo.
## 4. Dificuldades e soluções a relatar
Os itens abaixo são temas técnicos plausíveis a partir da arquitetura e devem ser confirmados como dificuldades realmente vividas pela equipe:
- **Autenticação e perfil:** integração de cadastro/login com dados de perfil. Solução: Supabase Auth e rotinas de consulta/criação de perfil.
- **Permissões de dados:** proteger informações e operações por usuário. Solução: políticas RLS e scripts SQL.
- **Fluxo de compra:** consistência entre carrinho, disponibilidade, pedido e anúncio. Solução descrita: função transacional de finalização que valida itens e registra pedidos.
- **Solicitações de doação/troca:** manter solicitação e mensagem relacionadas. Solução descrita: função transacional para criação/reutilização de solicitação pendente.
- **Experiência de uso:** tornar recursos mais acessíveis. Solução descrita: ajuste de fonte e alto contraste.
## 5. Próximas melhorias
- Realizar e documentar testes manuais de todas as páginas e fluxos.
- Registrar feedback real de usuários e da apresentação do MVP.
- Inserir comparações com capturas de tela do MVP e versão atual.
- Revisar acessibilidade com ferramentas e usuários, se possível.
- Confirmar mensagens, estados de erro e carregamento para situações de falha de conexão.
- Revisar privacidade, consentimento e segurança dos formulários e políticas.
