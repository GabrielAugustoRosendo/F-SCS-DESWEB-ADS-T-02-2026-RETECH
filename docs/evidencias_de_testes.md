# Evidências de Testes — ReTech

## 1. Objetivo
Registrar testes de funcionamento, navegação, acessibilidade, responsividade e validação técnica para a entrega da A06.

## 2. Testes automatizados presentes no repositório
O README informa que as suítes automatizadas podem ser executadas com Node.js, na raiz do projeto:

```bash
node --test
```

Arquivos de teste encontrados/documentados:
- `tests/acessibilidade.test.mjs`
- `tests/auth.test.mjs`
- `tests/compras.test.mjs`
- `tests/favoritos.test.mjs`
- `tests/inicio.test.mjs`

Segundo o README, os testes usam ambientes e respostas simulados e não gravam dados no Supabase.

| Área | Arquivo | Resultado a registrar |
|---|---|---|
| Acessibilidade | `acessibilidade.test.mjs` | Executar e anexar print/saída do terminal |
| Autenticação | `auth.test.mjs` | Executar e anexar print/saída do terminal |
| Compras | `compras.test.mjs` | Executar e anexar print/saída do terminal |
| Favoritos | `favoritos.test.mjs` | Executar e anexar print/saída do terminal |
| Página inicial | `inicio.test.mjs` | Executar e anexar print/saída do terminal |

**Status:** os cinco arquivos de teste listados acima existem no repositório. Resultados de execução e capturas não estão anexados; execute a suíte e registre a saída antes de apresentar este arquivo como evidência de testes.
## 3. Checklist de testes manuais
Preencher o status, data, navegador/dispositivo e evidência (captura de tela) após executar.
| Teste | Procedimento | Status | Evidência |
|---|---|---|---|
| Site publicado | Abrir a URL pública e verificar HTTPS | Pendente de evidência | Print da página e URL |
| Navegação | Abrir as páginas pelo menu e testar links | Pendente | Prints/registro de links |
| Cadastro/login | Testar cadastro, login, logout e mensagens de validação | Pendente | Print sem expor dados pessoais |
| Perfil | Conferir edição e áreas de anúncios, favoritos, pedidos e solicitações | Pendente | Prints |
| Anúncio | Criar anúncio, validar campos e upload de imagem | Pendente | Prints |
| Catálogo | Buscar, filtrar e ordenar produtos | Pendente | Prints |
| Carrinho | Adicionar/remover item, conferir contador e total | Pendente | Prints |
| Compra simulada | Revisar e confirmar compra; verificar pedido criado; confirmar ausência de cobrança real | Pendente | Prints sem dados sensíveis |
| Favoritos | Adicionar/remover e conferir persistência na conta | Pendente | Prints |
| Doação/troca | Solicitar, cancelar e testar ações do anunciante quando possível | Pendente | Prints |
| Blog/newsletter | Abrir artigos/vídeos e testar inscrição | Pendente | Prints |
| Contato | Enviar mensagem e conferir validação/registro | Pendente | Print sem dados pessoais |
| Responsividade | Testar largura de celular, tablet e desktop | Pendente | Capturas dos 3 formatos |
| Teclado | Navegar usando Tab, Shift+Tab, Enter e Espaço; conferir foco visível | Pendente | Vídeo/print e anotações |
| Contraste | Conferir contraste de textos, links, botões e estados | Pendente | Resultado de ferramenta de contraste |
| W3C | Validar páginas HTML e registrar erros/avisos | Pendente | URLs e capturas dos resultados |
## 4. Evidências a anexar
- Captura da página inicial publicada.
- Captura do catálogo e de um detalhe de produto.
- Captura de anúncio e fluxo de doação/troca.
- Captura do perfil, favoritos e pedidos (com dados fictícios).
- Captura do formulário de contato e validação.
- Capturas de layout em celular e desktop.
- Captura da navegação por teclado.
- Resultados do W3C Validator.
- Terminal com execução de `node --test`.
- Painel da plataforma de hospedagem mostrando deploy ativo (se exigido pelo professor).
## 5. Recomendações de privacidade
Não anexar capturas que exponham e-mails pessoais, senhas, tokens, chaves, CPF ou dados de cartão. A compra é simulada; não inserir dados financeiros reais.
