(function () {
    const formulario = document.getElementById("formulario-pagamento");
    if (!formulario) return;
    const campos = document.getElementById("pagamento-campos");
    const cartao = document.getElementById("pagamento-cartao");
    const pix = document.getElementById("pagamento-pix");
    const status = document.getElementById("pagamento-status");
    const metodos = { pix: "Pix", credito: "cartão de crédito", debito: "cartão de débito" };
    let metodo = "pix";

    formulario.querySelectorAll('input[name="metodo"]').forEach((opcao) => {
        opcao.addEventListener("change", () => {
            metodo = opcao.value;
            pix.hidden = metodo !== "pix";
            cartao.hidden = metodo === "pix";
            cartao.disabled = metodo === "pix";
            status.textContent = "";
            document.getElementById("cartao-titulo").textContent = `Dados do ${metodos[metodo]}`;
            document.getElementById("pagamento-resumo-metodo").textContent = metodos[metodo];
            document.getElementById("pagamento-simular").textContent = `Simular pagamento com ${metodos[metodo]}`;
            formulario.querySelectorAll('input[type="text"], input[type="password"]').forEach((campo) => campo.removeAttribute("aria-invalid"));
        });
    });

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        // Verifica exclusivamente o comprimento: sem CPF, Luhn, formato ou data.
        const ids = ["pagamento-nome", "pagamento-cpf"];
        if (metodo !== "pix") ids.push("pagamento-numero", "pagamento-validade", "pagamento-cvv");
        let primeiroInvalido = null;
        const erros = [];
        ids.forEach((id) => {
            const campo = document.getElementById(id);
            const tamanho = campo.value.length;
            const valido = tamanho >= campo.minLength && tamanho <= campo.maxLength;
            campo.setAttribute("aria-invalid", String(!valido));
            if (!valido) {
                primeiroInvalido ||= campo;
                const rotulo = formulario.querySelector(`label[for="${id}"]`).textContent;
                erros.push(`${rotulo}: ${campo.minLength === campo.maxLength ? campo.minLength : `${campo.minLength} a ${campo.maxLength}`} caracteres.`);
            }
        });
        status.textContent = erros.length
            ? erros.join(" ")
            : `Campos com o comprimento esperado para ${metodos[metodo]}. Esta é uma simulação: nenhum pagamento foi realizado.`;
        if (primeiroInvalido) primeiroInvalido.focus();
    });
    // Os campos só ficam disponíveis após impedir a submissão real do formulário.
    campos.disabled = false;
})();
