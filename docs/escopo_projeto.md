# Escopo do Projeto — ReTech

## 1. Identificação
- **Nome do projeto/site:** ReTech
- **Subtítulo:** Tecnologia que ganha uma nova vida.
- **Equipe:** André Carvalho, Gabriel Augusto e Pedro Victor (conforme README)
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
- **Instituição:** Fatec São Caetano do Sul
- **Disciplina:** Desenvolvimento Web
- **Ano:** 2026
- **Professor:** Paulo Fratta (conforme README)
- **Custo informado:** R$ 0,00; o projeto foi desenvolvido com recursos gratuitos, sem contratação de serviços pagos.
- **URL informada do site:** https://retech-omega.vercel.app/ (deploy e HTTPS pendentes de confirmação externa)
- **Repositório:** https://github.com/GabrielAugustoRosendo/F-SCS-DESWEB-ADS-T-02-2026-RETECH


## 2. Contexto e justificativa
O descarte prematuro de aparelhos eletrônicos contribui para o aumento do lixo eletrônico, enquanto muitos equipamentos ainda podem ser utilizados por outras pessoas. Ao mesmo tempo, o custo de dispositivos novos pode dificultar o acesso à tecnologia. O ReTech propõe um ambiente digital para aproximar quem deseja vender, doar ou trocar eletrônicos de quem procura esses produtos.

A proposta relaciona-se à sustentabilidade por incentivar o prolongamento da vida útil dos equipamentos, o reaproveitamento de recursos e escolhas de consumo mais conscientes. O impacto social esperado é facilitar o acesso a eletrônicos e criar oportunidades de circulação de produtos que ainda possuem utilidade.

## 3. Objetivos
### 3.1 Objetivo geral
Desenvolver um marketplace de eletrônicos usados que estimule a reutilização de aparelhos, o consumo consciente e a economia circular, oferecendo recursos para venda, doação e troca.
### 3.2 Objetivos específicos
1. Permitir que usuários encontrem eletrônicos por busca, categoria, conservação e ordenação.
2. Oferecer meios para publicar anúncios de venda, doação ou troca.
3. Disponibilizar perfil, favoritos, carrinho e acompanhamento de pedidos/solicitações.
4. Compartilhar conteúdos educativos sobre compra de usados, conservação e descarte responsável.
5. Aplicar recursos de acessibilidade e interface responsiva para facilitar o uso por diferentes pessoas.

## 4. Público-alvo
- Pessoas que procuram eletrônicos usados com preço mais acessível.
- Pessoas que possuem aparelhos em bom estado e desejam vender, doar ou trocar.
- Pessoas interessadas em consumo consciente, reaproveitamento e descarte adequado.
- Usuários com diferentes níveis de familiaridade digital.
- Pessoas com deficiência, consideradas no planejamento de acessibilidade, incluindo navegação por teclado, contraste e ajustes de fonte.

**Necessidades atendidas:** encontrar produtos, comparar ofertas, divulgar aparelhos, negociar doações/trocas, organizar anúncios e conhecer práticas de reutilização e descarte.

## 5. Escopo funcional
O sistema contempla 11 páginas HTML no repositório, incluindo `index.html`. O modelo de 10 páginas mencionado em PDFs deve ser comparado com o material de referência da disciplina; os PDFs não acompanham esta pasta de documentação.

| Página | Função |
|---|---|
| `index.html` | Apresentação, categorias, anúncios recentes e chamadas para compra/doação/troca |
| `catalogo.html` | Catálogo de venda com busca, filtros e ordenação |
| `produto.html` | Detalhes do anúncio, estado de conservação, anunciante e ações disponíveis |
| `anunciar.html` | Cadastro de anúncio, informações do produto e envio de imagem |
| `doar-trocar.html` | Listagem de doações e trocas com filtros por modalidade, categoria e conservação |
| `login.html` | Cadastro e autenticação |
| `perfil.html` | Dados do usuário, anúncios, favoritos, solicitações e pedidos |
| `pagar.html` | Revisão do carrinho e fluxo de compra simulado |
| `blog.html` | Conteúdo educativo, artigos, vídeos e newsletter |
| `sobre.html` | História/proposta, missão, visão, valores e equipe |
| `contato.html` | Informações de suporte e formulário de contato |

### Recursos funcionais
- Autenticação por e-mail e senha.
- Criação e edição de perfil.
- Publicação de anúncios e upload de imagem.
- Busca, filtros e ordenação do catálogo.
- Carrinho com contador, itens, total e remoção.
- Compra simulada com opções de demonstração; sem cobrança financeira real.
- Registro de pedidos e consulta de status.
- Favoritos por conta.
- Solicitações de doação/troca com mensagens e ações de cancelamento/aceitação/recusa.
- Formulários de contato e newsletter com registro de consentimento.
- Ajuste de tamanho da fonte e modo de alto contraste.

## 6. Escopo não funcional
- **Acessibilidade:** textos alternativos em imagens quando aplicável, controles utilizáveis por teclado, contraste e ajuste de fonte/alto contraste; ARIA quando necessário.
- **Responsividade:** adaptação a diferentes larguras de tela, especialmente desktop e dispositivos móveis.
- **Desempenho:** imagens e recursos devem ser otimizados; vídeos incorporados com carregamento sob demanda quando implementado.
- **SEO básico:** título, descrição e estrutura de headings por página.
- **Segurança e privacidade:** autenticação e regras de acesso com Supabase; RLS para restringir operações; HTTPS na publicação; atenção à LGPD e ao consentimento nos formulários.
- **Manutenibilidade:** código organizado por páginas, CSS e scripts; versionamento no Git.

## 7. Mapa do site
```text
ReTech (index.html)\
├── Catálogo (catalogo.html)
│   └── Produto (produto.html)
├── Anunciar (anunciar.html)
├── Doar/Trocar (doar-trocar.html)
│   └── Produto/solicitação (produto.html)
├── Entrar/Criar conta (login.html)
│   └── Perfil (perfil.html)
│       ├── Meus anúncios
│       ├── Favoritos
│       ├── Solicitações
│       └── Meus pedidos
├── Revisar compra (pagar.html)
├── Blog (blog.html)
├── Sobre (sobre.html)
└── Contato (contato.html)
```
A navegação e os caminhos efetivos devem ser conferidos no site após a equipe confirmar que o deploy está ativo, antes de anexar evidências finais.

## 8. Conteúdo e identidade visual
O nome ReTech comunica a ideia de tecnologia que pode ser reutilizada. A identidade e a interface utilizam referências visuais ligadas a eletrônicos, circulação de produtos e sustentabilidade. O tom de comunicação é acessível, direto e convidativo, buscando explicar a proposta e orientar ações como comprar, anunciar, doar ou trocar.
As imagens devem representar os produtos e o tema e, quando não forem autorais, devem ter sua fonte registrada conforme aplicável.
## 9. Tecnologias e ferramentas
- HTML5 e CSS3: estrutura e apresentação.
- JavaScript puro: interação, busca/filtros, validações, acessibilidade e integração com serviços.
- Supabase Auth: autenticação.
- PostgreSQL/Supabase: dados do sistema.
- Supabase Storage: imagens dos anúncios.
- `supabase-js` v2: comunicação com o Supabase.
- Font Awesome: ícones.
- YouTube: vídeos incorporados no blog.
- Node.js: execução dos testes automatizados.
- Git e GitHub: versionamento e colaboração.
- Vercel: hospedagem informada nos documentos; confirmar deploy e conta/plano no painel da equipe.
## 10. Cronograma e divisão de tarefas
O cronograma abaixo apresenta uma distribuição retrospectiva das etapas entre 17/10/2026 e 23/11/2026. As datas foram organizadas para documentar o desenvolvimento e devem ser conferidas pela equipe antes da entrega. André Carvalho e Gabriel Augusto atuaram conjuntamente no desenvolvimento do site e integrações; Pedro Victor ficou com documentação e revisão do projeto.
| Etapa | Planejamento/atividade | Período | Responsável |
|---|---|---|---|
| 1 | Definição do tema, proposta e escopo | 17/10/2026 a 20/10/2026 | Equipe |
| 2 | Estrutura e identidade visual do MVP | 23/10/2026 a 27/10/2026 | André Carvalho e Gabriel Augusto |
| 3 | Desenvolvimento das páginas e componentes | 27/10/2026 a 12/11/2026 | André Carvalho e Gabriel Augusto |
| 4 | Integração com Supabase e demais serviços do site | 30/10/2026 a 14/11/2026 | André Carvalho e Gabriel Augusto |
| 5 | Testes, correções e revisão geral do projeto | 15/11/2026 a 20/11/2026 | André Carvalho e Gabriel Augusto (correções); Pedro Victor (revisão) |
| 6 | Publicação e documentação final | 20/11/2026 a 23/11/2026 | André e Gabriel (publicação); Pedro (documentação) |
## 11. Riscos e restrições
- Dependência de conexão à internet para serviços externos, CDN, Supabase e vídeos.
- Indisponibilidade ou limites do serviço de banco de dados/autenticação.
- Possíveis problemas de configuração de políticas, permissões e armazenamento.
- Tempo limitado para desenvolvimento e testes.
- Necessidade de conferir responsividade e acessibilidade em diferentes navegadores/dispositivos.
- O fluxo de compra é demonstrativo e não processa pagamentos reais.
- A plataforma não substitui inspeção, negociação e cuidados de segurança entre pessoas que realizem transações de produtos usados.
## 12. Critérios de aceitação
- [ ] As páginas listadas estão acessíveis e os links principais funcionam.
- [ ] Cadastro, login e perfil funcionam no ambiente publicado.
- [ ] Anúncios podem ser consultados e publicados com imagem.
- [ ] Busca, filtros e ordenação funcionam conforme esperado.
- [ ] Carrinho, revisão de compra simulada e pedidos funcionam.
- [ ] Favoritos e solicitações de doação/troca funcionam.
- [ ] Blog, vídeos, newsletter e contato são acessíveis.
- [ ] Recursos de acessibilidade podem ser acionados e utilizados.
- [ ] Layout se adapta a telas móveis.
- [ ] Validações HTML/CSS e testes automatizados foram executados; resultados registrados em evidências.
- [ ] Site está publicado com HTTPS e a URL está atualizada.
## 13. Aprovação
Responsável pela validação: a definir pela equipe/cliente acadêmico.  
Data: ____/____/________  
Assinatura: ____________________________________
