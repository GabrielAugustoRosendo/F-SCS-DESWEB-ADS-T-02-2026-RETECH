(function () {
    const db = window.retechDB;
    if (!db) return;

    const path = window.location.pathname.toLowerCase();
    const nomeEstado = { "muito-bom": "Muito bom", bom: "Bom", usado: "Usado" };
    const nomeTipo = { venda: "Venda", doacao: "Doação", troca: "Troca" };

    const formatarPreco = (valor) =>
        Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    function escapeHtml(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    function mostrarMensagem(elemento, texto, sucesso = false) {
        if (!elemento) return;
        elemento.textContent = texto;
        elemento.className = sucesso ? "perfil-status-sucesso" : "perfil-status-erro";
    }

    async function usuarioAtual() {
        const { data, error } = await db.auth.getUser();
        return error ? null : data?.user || null;
    }

    async function atualizarCabecalho() {
        const usuario = await usuarioAtual();
        document.querySelectorAll(".acoes-cabecalho .entrar").forEach((link) => {
            if (usuario) {
                link.innerHTML = '<i class="fa-regular fa-user"></i> Perfil';
                link.href = "perfil.html";
                link.classList.remove("ativo");
            } else {
                link.innerHTML = '<i class="fa-regular fa-user"></i> Entrar';
                link.href = "login.html";
                link.classList.toggle("ativo", path.endsWith("login.html"));
            }
        });
        document.querySelectorAll(".acoes-cabecalho .criar-conta").forEach((link) => link.remove());
        document.querySelectorAll(".submenu-mais a[href='perfil.html']").forEach((link) => link.remove());
    }

    db.auth.onAuthStateChange(() => atualizarCabecalho());

    async function inicializarLogin() {
        if (!path.endsWith("login.html")) return;

        document.querySelectorAll(".login-aba").forEach((aba) => {
            aba.addEventListener("click", () => {
                document.querySelectorAll(".login-aba").forEach((item) => {
                    item.classList.remove("ativa");
                    item.setAttribute("aria-selected", "false");
                });
                document.querySelectorAll(".login-painel").forEach((painel) => {
                    painel.classList.remove("ativo");
                    painel.hidden = true;
                });
                aba.classList.add("ativa");
                aba.setAttribute("aria-selected", "true");
                const painel = document.getElementById(aba.dataset.loginPainel);
                painel.hidden = false;
                painel.classList.add("ativo");
            });
        });
        if (window.location.hash === "#cadastro") {
            document.getElementById("aba-cadastro")?.click();
        }

        document.querySelectorAll("[data-alternar-senha]").forEach((botao) => {
            botao.addEventListener("click", () => {
                const campo = document.getElementById(botao.dataset.alternarSenha);
                if (!campo) return;
                const mostrar = campo.type === "password";
                campo.type = mostrar ? "text" : "password";
                botao.innerHTML = mostrar
                    ? '<i class="fa-solid fa-eye-slash"></i>'
                    : '<i class="fa-solid fa-eye"></i>';
                botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
            });
        });

        document.querySelectorAll(".formulario-login").forEach((formulario) => {
            formulario.addEventListener("submit", async (evento) => {
                evento.preventDefault();
                const dados = new FormData(formulario);
                const email = String(dados.get("email") || "").trim();
                const senha = String(dados.get("senha") || "");
                const cadastro = formulario.id === "formulario-cadastro";
                const status = formulario.querySelector("[role=status]");
                const botao = formulario.querySelector('button[type="submit"]');

                if (!email || !senha) {
                    mostrarMensagem(status, "Preencha e-mail e senha.");
                    return;
                }

                botao.disabled = true;
                try {
                    if (cadastro) {
                        const nome = String(dados.get("nome") || "").trim();
                        const confirmarSenha = String(dados.get("confirmar-senha") || "");
                        if (!nome) throw new Error("Informe seu nome.");
                        if (senha.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
                        if (senha !== confirmarSenha) throw new Error("As senhas não coincidem.");

                        const { data, error } = await db.auth.signUp({
                            email,
                            password: senha,
                            options: { data: { nome } }
                        });
                        if (error) throw error;

                        if (data.user) {
                            const { error: erroPerfil } = await db.from("usuarios").upsert({
                                id: data.user.id,
                                nome
                            }, { onConflict: "id" });
                            if (erroPerfil && data.session) throw erroPerfil;
                        }

                        mostrarMensagem(
                            status,
                            data.session
                                ? "Cadastro realizado com sucesso. Você já pode acessar sua conta."
                                : "Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.",
                            true
                        );
                        if (data.session) window.location.href = "perfil.html";
                    } else {
                        const { error } = await db.auth.signInWithPassword({ email, password: senha });
                        if (error) throw error;
                        const { data: sessao } = await db.auth.getUser();
                        if (sessao?.user) {
                            const { data: perfilExistente } = await db
                                .from("usuarios")
                                .select("id")
                                .eq("id", sessao.user.id)
                                .maybeSingle();
                            if (!perfilExistente) {
                                await db.from("usuarios").insert({
                                    id: sessao.user.id,
                                    nome: email.split("@")[0]
                                });
                            }
                        }
                        window.location.href = "perfil.html";
                    }
                } catch (erro) {
                    const mensagem = erro?.message || "";
                    if (/invalid login credentials/i.test(mensagem)) {
                        mostrarMensagem(status, "E-mail ou senha incorretos.");
                    } else if (/email not confirmed/i.test(mensagem)) {
                        mostrarMensagem(status, "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
                    } else {
                        mostrarMensagem(status, mensagem || "Não foi possível concluir a operação.");
                    }
                } finally {
                    botao.disabled = false;
                }
            });
        });
    }

    async function inicializarPerfil() {
        if (!path.endsWith("perfil.html")) return;
        const usuario = await usuarioAtual();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        const botaoSair = document.getElementById("botao-sair");
        botaoSair?.addEventListener("click", async () => {
            botaoSair.disabled = true;
            await db.auth.signOut();
            window.location.href = "login.html";
        });

        const { data: perfilExistente } = await db
            .from("usuarios")
            .select("id")
            .eq("id", usuario.id)
            .maybeSingle();
        if (!perfilExistente) {
            await db.from("usuarios").insert({
                id: usuario.id,
                nome: usuario.user_metadata?.nome || usuario.email?.split("@")[0] || "Usuário ReTech"
            });
        }

        document.querySelectorAll(".perfil-aba").forEach((aba) => {
            aba.addEventListener("click", () => {
                document.querySelectorAll(".perfil-aba").forEach((item) => {
                    item.classList.remove("ativa");
                    item.setAttribute("aria-selected", "false");
                });
                document.querySelectorAll(".perfil-painel").forEach((painel) => {
                    painel.classList.remove("ativo");
                    painel.hidden = true;
                });
                aba.classList.add("ativa");
                aba.setAttribute("aria-selected", "true");
                const painel = document.getElementById(aba.dataset.painel);
                painel.hidden = false;
                painel.classList.add("ativo");
            });
        });

        const { data: perfil, error: erroPerfil } = await db
            .from("usuarios")
            .select("id,nome,local,telefone,sobre,foto_url,created_at")
            .eq("id", usuario.id)
            .maybeSingle();

        if (erroPerfil) {
            const status = document.getElementById("perfil-status");
            if (status) status.textContent = erroPerfil.message;
        }

        const dados = perfil || { nome: usuario.email };
        document.getElementById("nome-perfil").textContent = dados.nome || "Usuário ReTech";
        document.getElementById("email-perfil").textContent = usuario.email || "";
        document.getElementById("local-perfil").textContent = dados.local || "";
        document.getElementById("telefone-perfil").textContent = dados.telefone || "Não informado";
        document.getElementById("sobre-perfil").textContent = dados.sobre || "Perfil ReTech.";
        document.getElementById("campo-nome").value = dados.nome || "";
        document.getElementById("campo-local").value = dados.local || "";
        document.getElementById("campo-email").value = usuario.email || "";
        document.getElementById("campo-telefone").value = dados.telefone || "";
        document.getElementById("campo-sobre").value = dados.sobre || "";
        document.getElementById("campo-email").readOnly = true;
        if (dados.created_at) {
            const membro = document.getElementById("membro-perfil");
            if (membro) {
                membro.textContent = new Date(dados.created_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            }
        }

        if (dados.foto_url) {
            const foto = document.getElementById("imagem-perfil");
            foto.src = dados.foto_url;
            foto.alt = `Foto de perfil de ${dados.nome || "usuário ReTech"}`;
        }

        const formulario = document.getElementById("formulario-perfil");
        formulario?.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const status = document.getElementById("perfil-status");
            const atualizacao = {
                nome: document.getElementById("campo-nome").value.trim(),
                local: document.getElementById("campo-local").value.trim(),
                telefone: document.getElementById("campo-telefone").value.trim(),
                sobre: document.getElementById("campo-sobre").value.trim()
            };

            if (!atualizacao.nome) {
                mostrarMensagem(status, "O nome é obrigatório.");
                return;
            }

            const botao = formulario.querySelector('button[type="submit"]');
            botao.disabled = true;
            const { error } = await db.from("usuarios").upsert({
                id: usuario.id,
                ...atualizacao
            }, { onConflict: "id" });
            botao.disabled = false;

            if (error) {
                mostrarMensagem(status, error.message);
                return;
            }

            document.getElementById("nome-perfil").textContent = atualizacao.nome;
            document.getElementById("local-perfil").textContent = atualizacao.local;
            document.getElementById("telefone-perfil").textContent = atualizacao.telefone || "Não informado";
            document.getElementById("sobre-perfil").textContent = atualizacao.sobre;
            mostrarMensagem(status, "Dados atualizados com sucesso.", true);
        });

        const { data: anuncios, error: erroAnuncios } = await db
            .from("anuncios")
            .select("id,nome_anuncio,descricao_anuncio,estado,tipo_anuncio,preco_anuncio,imagem_url,status,created_at")
            .eq("usuario_id", usuario.id)
            .order("created_at", { ascending: false });

        const grade = document.getElementById("perfil-anuncios");
        if (erroAnuncios) {
            grade.innerHTML = `<p>${escapeHtml(erroAnuncios.message)}</p>`;
            return;
        }

        document.getElementById("total-anuncios").textContent = String((anuncios || []).length);
        document.getElementById("total-vendidos").textContent = String(
            (anuncios || []).filter((item) => item.status === "vendido").length
        );
        document.getElementById("total-favoritos").textContent = "0";

        if (!anuncios?.length) {
            grade.innerHTML = '<div class="perfil-vazio"><i class="fa-solid fa-box-open"></i><h3>Você ainda não publicou anúncios</h3><p>Coloque um aparelho em circulação novamente.</p><a href="anunciar.html" class="botao botao-verde">Criar anúncio</a></div>';
        } else {
            grade.innerHTML = anuncios.map((anuncio) => `
                <article class="perfil-anuncio">
                    <img src="${escapeHtml(anuncio.imagem_url || "imagens/vitrine.jpg")}" alt="${escapeHtml(anuncio.nome_anuncio)}">
                    <div><span>${escapeHtml(nomeTipo[anuncio.tipo_anuncio] || anuncio.tipo_anuncio)}</span><h3>${escapeHtml(anuncio.nome_anuncio)}</h3><p>${escapeHtml(anuncio.descricao_anuncio || "")}</p></div>
                    <a href="produto.html?id=${encodeURIComponent(anuncio.id)}" class="botao botao-contorno">Ver anúncio</a>
                </article>
            `).join("");
        }

        await inicializarSolicitacoes(usuario);
        await inicializarCarrinho(usuario);
    }

    async function inicializarSolicitacoes(usuario) {
        const grade = document.getElementById("perfil-solicitacoes");
        const status = document.getElementById("solicitacoes-status");
        if (!grade) return;

        const { data, error } = await db
            .from("solicitacoes")
            .select("id,solicitante_id,anuncio_id,tipo,mensagem,status,created_at,anuncios(id,nome_anuncio,usuario_id)")
            .order("created_at", { ascending: false });

        if (error) {
            grade.textContent = error.message;
            return;
        }

        if (!data?.length) {
            grade.innerHTML = '<p>Nenhuma solicitação encontrada.</p>';
            return;
        }

        grade.innerHTML = data.map((solicitacao) => {
            const souSolicitante = solicitacao.solicitante_id === usuario.id;
            const souProprietario = solicitacao.anuncios?.usuario_id === usuario.id;
            const nomeAnuncio = solicitacao.anuncios?.nome_anuncio || "Anúncio";
            return `
                <article class="perfil-anuncio">
                    <div><strong>${escapeHtml(nomeAnuncio)}</strong><p>${escapeHtml(solicitacao.mensagem || "")}</p><span>Status: ${escapeHtml(solicitacao.status)}</span></div>
                    ${souSolicitante && solicitacao.status === "pendente"
                        ? '<button type="button" class="botao botao-contorno" data-cancelar-solicitacao="' + escapeHtml(solicitacao.id) + '">Cancelar</button>'
                        : ""}
                    ${souProprietario && solicitacao.status === "pendente"
                        ? '<button type="button" class="botao botao-contorno" data-status-solicitacao="aceita" data-solicitacao="' + escapeHtml(solicitacao.id) + '">Aceitar</button><button type="button" class="botao botao-contorno" data-status-solicitacao="recusada" data-solicitacao="' + escapeHtml(solicitacao.id) + '">Recusar</button>'
                        : ""}
                </article>`;
        }).join("");

        grade.querySelectorAll("[data-cancelar-solicitacao]").forEach((botao) => {
            botao.addEventListener("click", async () => {
                botao.disabled = true;
                const { error: erro } = await db
                    .from("solicitacoes")
                    .update({ status: "cancelada" })
                    .eq("id", botao.dataset.cancelarSolicitacao);
                status.textContent = erro?.message || "Solicitação cancelada.";
                if (!erro) window.location.reload();
            });
        });

        grade.querySelectorAll("[data-status-solicitacao]").forEach((botao) => {
            botao.addEventListener("click", async () => {
                botao.disabled = true;
                const { error: erro } = await db
                    .from("solicitacoes")
                    .update({ status: botao.dataset.statusSolicitacao })
                    .eq("id", botao.dataset.solicitacao);
                status.textContent = erro?.message || "Solicitação atualizada.";
                if (!erro) window.location.reload();
            });
        });
    }

    async function inicializarCarrinho(usuario) {
        const grade = document.getElementById("perfil-carrinho");
        const status = document.getElementById("carrinho-status");
        if (!grade) return;

        const { data, error } = await db
            .from("carrinho")
            .select("id,anuncio_id,anuncios(id,nome_anuncio,preco_anuncio,imagem_url,tipo_anuncio,status,usuario_id)")
            .eq("usuario_id", usuario.id)
            .order("created_at", { ascending: false });

        if (error) {
            grade.textContent = error.message;
            return;
        }

        const itens = (data || []).filter((item) =>
            item.anuncios?.tipo_anuncio === "venda" && item.anuncios.status === "ativo"
        );
        if (!itens.length) {
            grade.innerHTML = '<p>Seu carrinho está vazio.</p>';
            return;
        }

        const total = itens.reduce((soma, item) => soma + Number(item.anuncios.preco_anuncio || 0), 0);
        grade.innerHTML = itens.map((item) => `
            <article class="perfil-anuncio">
                <img src="${escapeHtml(item.anuncios.imagem_url || "imagens/vitrine.jpg")}" alt="${escapeHtml(item.anuncios.nome_anuncio)}">
                <div><h3>${escapeHtml(item.anuncios.nome_anuncio)}</h3><strong>${formatarPreco(item.anuncios.preco_anuncio)}</strong></div>
                <button type="button" class="botao botao-contorno" data-remover="${escapeHtml(item.anuncio_id)}">Remover</button>
            </article>
        `).join("") + `<p><strong>Total: ${formatarPreco(total)}</strong></p><button type="button" class="botao botao-contorno" disabled>Finalização de compra indisponível</button><p>A compra não será concluída enquanto a validação segura de pedidos não estiver implementada no servidor.</p>`;

        grade.querySelectorAll("[data-remover]").forEach((botao) => {
            botao.addEventListener("click", async () => {
                botao.disabled = true;
                const { error: erroRemocao } = await db
                    .from("carrinho")
                    .delete()
                    .eq("usuario_id", usuario.id)
                    .eq("anuncio_id", botao.dataset.remover);
                if (erroRemocao && status) status.textContent = erroRemocao.message;
                else window.location.reload();
            });
        });
    }

    async function inicializarAnuncio() {
        if (!path.endsWith("anunciar.html")) return;
        const usuario = await usuarioAtual();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        const formulario = document.getElementById("formulario-anuncio");
        const imagemInput = document.getElementById("imagem-produto");
        imagemInput.required = true;
        const status = document.createElement("p");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        formulario.appendChild(status);

        formulario.querySelectorAll('input[name="modalidade"]').forEach((radio) => {
            radio.addEventListener("change", () => {
                const venda = formulario.querySelector('input[name="modalidade"]:checked')?.value === "venda";
                document.getElementById("grupo-preco").hidden = !venda;
                const preco = document.getElementById("preco-produto");
                preco.required = venda;
                preco.disabled = !venda;
            });
        });

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (!formulario.reportValidity()) return;

            const dados = new FormData(formulario);
            const tipo = String(dados.get("modalidade"));
            const imagem = imagemInput.files[0];
            if (!imagem) {
                status.textContent = "A imagem é obrigatória.";
                return;
            }

            const botao = formulario.querySelector('button[type="submit"]');
            botao.disabled = true;
            status.textContent = "Publicando anúncio...";

            try {
                const { data: categoria, error: erroCategoria } = await db
                    .from("categorias")
                    .select("id")
                    .eq("slug", String(dados.get("categoria")))
                    .maybeSingle();
                if (erroCategoria) throw erroCategoria;
                if (!categoria) throw new Error("Categoria não encontrada.");

                const extensao = imagem.name.split(".").pop()?.toLowerCase() || "jpg";
                const caminho = `${usuario.id}/${crypto.randomUUID()}.${extensao}`;
                const { error: erroUpload } = await db.storage
                    .from("anuncios")
                    .upload(caminho, imagem, { cacheControl: "3600", upsert: false });
                if (erroUpload) throw erroUpload;

                const { data: url } = db.storage.from("anuncios").getPublicUrl(caminho);
                const { error: erroAnuncio } = await db.from("anuncios").insert({
                    usuario_id: usuario.id,
                    categoria_id: categoria.id,
                    nome_anuncio: String(dados.get("nome")).trim(),
                    descricao_anuncio: String(dados.get("descricao")).trim(),
                    estado: String(dados.get("estado")),
                    tipo_anuncio: tipo,
                    preco_anuncio: tipo === "venda" ? Number(dados.get("preco")) : null,
                    imagem_url: url.publicUrl
                });
                if (erroAnuncio) throw erroAnuncio;

                window.location.href = tipo === "venda" ? "catalogo.html" : "doar-trocar.html";
            } catch (erro) {
                status.textContent = erro.message || "Não foi possível publicar o anúncio.";
            } finally {
                botao.disabled = false;
            }
        });
    }

    function criarCard(anuncio, vendedores = {}) {
        const categoria = anuncio.categorias?.nome || "Produto";
        const categoriaSlug = anuncio.categorias?.slug || "";
        const vendedor = vendedores[anuncio.usuario_id];
        const artigo = document.createElement("article");
        artigo.className = "produto produto-catalogo";
        artigo.dataset.modalidade = anuncio.tipo_anuncio;
        artigo.dataset.categoria = categoriaSlug;
        artigo.dataset.estado = anuncio.estado;
        artigo.dataset.preco = anuncio.tipo_anuncio === "venda" ? String(anuncio.preco_anuncio || 0) : "0";
        artigo.dataset.nome = anuncio.nome_anuncio;
        artigo.innerHTML = `
            <span class="selo-produto ${anuncio.tipo_anuncio === "venda" ? "selo-neutro" : "selo-verde"}">${escapeHtml(nomeTipo[anuncio.tipo_anuncio] || nomeEstado[anuncio.estado] || "")}</span>
            <img src="${escapeHtml(anuncio.imagem_url || "imagens/vitrine.jpg")}" alt="${escapeHtml(anuncio.nome_anuncio)}">
            <div class="produto-info">
                <p class="produto-categoria">${escapeHtml(categoria)}</p>
                <h3>${escapeHtml(anuncio.nome_anuncio)}</h3>
                <p>${escapeHtml(anuncio.descricao_anuncio || "")}</p>
                ${vendedor ? `<p class="produto-vendedor">Vendedor: ${escapeHtml(vendedor.nome || "Usuário")}${vendedor.local ? ` - ${escapeHtml(vendedor.local)}` : ""}</p>` : ""}
                <strong>${anuncio.tipo_anuncio === "venda" ? formatarPreco(anuncio.preco_anuncio) : anuncio.tipo_anuncio === "doacao" ? "Grátis" : "Para trocar"}</strong>
                <a href="produto.html?id=${encodeURIComponent(anuncio.id)}" class="link-produto">Ver detalhes <i class="fa-solid fa-arrow-right"></i></a>
            </div>`;
        return artigo;
    }

    async function inicializarCatalogo() {
        const grade = document.getElementById("grade-catalogo");
        if (!grade || (!path.endsWith("catalogo.html") && !path.endsWith("doar-trocar.html"))) return;

        grade.innerHTML = '<p>Carregando anúncios...</p>';
        const tipos = path.endsWith("catalogo.html") ? ["venda"] : ["doacao", "troca"];
        const { data, error } = await db
            .from("anuncios")
            .select("id,usuario_id,nome_anuncio,descricao_anuncio,estado,tipo_anuncio,preco_anuncio,imagem_url,status,created_at,categorias(id,nome,slug)")
            .in("tipo_anuncio", tipos)
            .eq("status", "ativo")
            .order("created_at", { ascending: false });

        if (error) {
            grade.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
            return;
        }
        const idsVendedores = [...new Set((data || []).map((item) => item.usuario_id).filter(Boolean))];
        let vendedores = {};
        if (idsVendedores.length) {
            const { data: vendedoresData } = await db
                .rpc("listar_vendedores_publicos", { p_ids: idsVendedores });
            vendedores = Object.fromEntries((vendedoresData || []).map((item) => [item.id, item]));
        }
        grade.replaceChildren(...(data || []).map((anuncio) => criarCard(anuncio, vendedores)));
        const contador = document.getElementById("resultado-contagem");
        if (contador) {
            contador.textContent = `${data?.length || 0} ${(data?.length || 0) === 1 ? "anúncio encontrado" : "anúncios encontrados"}`;
        }
    }

    async function inicializarProduto() {
        const nome = document.getElementById("produto-nome");
        if (!nome || !path.endsWith("produto.html")) return;
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) return;

        const { data, error } = await db
            .from("anuncios")
            .select("*,categorias(id,nome,slug)")
            .eq("id", id)
            .maybeSingle();

        if (error || !data || data.status !== "ativo") {
            document.getElementById("detalhes-produto").hidden = true;
            document.getElementById("produto-nao-encontrado").hidden = false;
            return;
        }

        nome.textContent = data.nome_anuncio;
        document.getElementById("produto-categoria").textContent = data.categorias?.nome || "Produto";
        document.getElementById("produto-estado").textContent = `Condição: ${nomeEstado[data.estado] || data.estado}`;
        const preco = document.getElementById("produto-preco");
        preco.hidden = data.tipo_anuncio !== "venda";
        preco.textContent = formatarPreco(data.preco_anuncio);
        document.getElementById("produto-descricao").textContent = data.descricao_anuncio || "";
        document.getElementById("produto-imagem").src = data.imagem_url || "imagens/vitrine.jpg";
        document.getElementById("produto-imagem").alt = data.nome_anuncio;
        document.getElementById("produto-caracteristicas").innerHTML =
            `<li>Modalidade: ${escapeHtml(nomeTipo[data.tipo_anuncio] || data.tipo_anuncio)}</li>`;

        const { data: vendedoresVetor } = await db
            .rpc("listar_vendedores_publicos", { p_ids: [data.usuario_id] });
        const vendedor = vendedoresVetor?.[0] || null;
        if (vendedor) {
            const informacoesVendedor = document.createElement("p");
            informacoesVendedor.className = "produto-vendedor";
            informacoesVendedor.textContent = `Vendedor: ${vendedor.nome || "Usuário"}${vendedor.local ? ` - ${vendedor.local}` : ""}`;
            document.querySelector(".produto-informacoes")?.prepend(informacoesVendedor);
        }

        const usuario = await usuarioAtual();
        const informacoes = document.querySelector(".produto-informacoes");
        if (!informacoes || !usuario) return;

        if (data.tipo_anuncio === "venda") {
            if (data.usuario_id === usuario.id || data.status !== "ativo") return;
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "botao botao-contorno";
            botao.textContent = "Adicionar ao carrinho";
            botao.addEventListener("click", async () => {
                botao.disabled = true;
                const { data: existente } = await db
                    .from("carrinho")
                    .select("id")
                    .eq("usuario_id", usuario.id)
                    .eq("anuncio_id", data.id)
                    .maybeSingle();
                if (existente) {
                    botao.textContent = "Já está no carrinho";
                    return;
                }
                const { error: erro } = await db.from("carrinho").insert({
                    usuario_id: usuario.id,
                    anuncio_id: data.id
                });
                if (erro?.code === "23505") {
                    botao.textContent = "Já está no carrinho";
                } else {
                    botao.textContent = erro ? erro.message : "Adicionado ao carrinho";
                }
            });
            informacoes.appendChild(botao);
        } else if (
            data.usuario_id !== usuario.id
            && data.status === "ativo"
            && (data.tipo_anuncio === "doacao" || data.tipo_anuncio === "troca")
        ) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "botao botao-contorno";
            botao.textContent = data.tipo_anuncio === "doacao" ? "Solicitar doação" : "Enviar proposta de troca";
            botao.addEventListener("click", async () => {
                const mensagemTexto = window.prompt("Envie uma mensagem ao anunciante:");
                if (!mensagemTexto?.trim()) return;
                botao.disabled = true;
                const { error: erroSolicitacao } = await db.from("solicitacoes").insert({
                    solicitante_id: usuario.id,
                    anuncio_id: data.id,
                    tipo: data.tipo_anuncio,
                    mensagem: mensagemTexto.trim(),
                    status: "pendente"
                });
                if (erroSolicitacao) {
                    botao.textContent = erroSolicitacao.message;
                    return;
                }
                const { error: erroMensagem } = await db.from("mensagens").insert({
                    remetente_id: usuario.id,
                    destinatario_id: data.usuario_id,
                    anuncio_id: data.id,
                    conteudo: mensagemTexto.trim()
                });
                botao.textContent = erroMensagem ? erroMensagem.message : "Solicitação e mensagem enviadas";
            });
            informacoes.appendChild(botao);
        }
    }

    async function inicializarBlog() {
        if (!path.endsWith("blog.html")) return;
        const grade = document.querySelector(".blog-grade");
        if (grade) {
            const { data, error } = await db
                .from("artigos")
                .select("id,titulo,slug,categoria,resumo,conteudo,imagem_url,tempo_leitura,destaque,publicado,created_at")
                .eq("publicado", true)
                .order("created_at", { ascending: false });
            if (!error && data?.length) {
                grade.innerHTML = data.map((artigo) => `
                    <article class="blog-card">
                        <img src="${escapeHtml(artigo.imagem_url || "imagens/vitrine.jpg")}" alt="${escapeHtml(artigo.titulo || "Artigo ReTech")}">
                        <div class="blog-card-conteudo">
                            <p class="blog-meta"><span>${escapeHtml(artigo.categoria || "ReTech")}</span>${artigo.tempo_leitura ? ` ${escapeHtml(artigo.tempo_leitura)} min` : ""}</p>
                            <h3>${escapeHtml(artigo.titulo || "")}</h3>
                            <p>${escapeHtml(artigo.resumo || "")}</p>
                        </div>
                    </article>`).join("");
            }
        }

        const formulario = document.querySelector(".blog-newsletter form");
        formulario?.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (!formulario.reportValidity()) return;

            const dados = new FormData(formulario);
            const email = String(dados.get("email") || "").trim();
            const consentimento = formulario.querySelector('input[name="consentimento"]');
            if (!consentimento?.checked) return;
            if (email.length < 3 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                let status = formulario.querySelector("[role=status]");
                if (!status) {
                    status = document.createElement("p");
                    status.setAttribute("role", "status");
                    formulario.appendChild(status);
                }
                status.textContent = "Informe um e-mail válido.";
                return;
            }

            const botao = formulario.querySelector('button[type="submit"]');
            botao.disabled = true;
            const { error } = await db.from("newsletter").insert({
                email,
                ativo: true,
                consentimento_em: new Date().toISOString()
            });

            let status = formulario.querySelector("[role=status]");
            if (!status) {
                status = document.createElement("p");
                status.setAttribute("role", "status");
                formulario.appendChild(status);
            }
            status.textContent = error
                ? (error.code === "23505" ? "Este e-mail já está inscrito." : error.message)
                : "Inscrição realizada com sucesso.";
            if (!error) formulario.reset();
            botao.disabled = false;
        });
    }

    async function inicializarContato() {
        if (!path.endsWith("contato.html")) return;
        const formulario = document.querySelector(".contato-formulario");
        if (!formulario) return;

        let status = formulario.querySelector("[role=status]");
        if (!status) {
            status = document.createElement("p");
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            formulario.appendChild(status);
        }

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (!formulario.reportValidity()) return;

            const dados = new FormData(formulario);
            const consentimento = formulario.querySelector('input[name="consentimento"]');
            if (!consentimento?.checked) return;
            const nome = String(dados.get("nome") || "").trim();
            const email = String(dados.get("email") || "").trim();
            const mensagem = String(dados.get("mensagem") || "").trim();
            if (
                nome.length < 2 || nome.length > 120
                || email.length < 3 || email.length > 254
                || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                || mensagem.length < 20 || mensagem.length > 1000
            ) {
                status.textContent = "Preencha nome, e-mail e mensagem corretamente.";
                return;
            }

            const usuario = await usuarioAtual();
            const botao = formulario.querySelector('button[type="submit"]');
            botao.disabled = true;
            status.textContent = "Enviando mensagem...";

            const { error } = await db.from("contatos").insert({
                usuario_id: usuario?.id || null,
                nome: String(dados.get("nome")).trim(),
                email: String(dados.get("email")).trim(),
                assunto: String(dados.get("assunto")),
                mensagem: String(dados.get("mensagem")).trim(),
                consentimento_em: new Date().toISOString()
            });

            status.textContent = error ? error.message : "Mensagem enviada com sucesso.";
            if (!error) formulario.reset();
            botao.disabled = false;
        });
    }

    atualizarCabecalho();
    inicializarLogin();
    inicializarPerfil();
    inicializarAnuncio();
    inicializarCatalogo();
    inicializarProduto();
    inicializarBlog();
    inicializarContato();
})();
