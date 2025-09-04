// Aguarda o DOM ser completamente carregado
document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DA PÁGINA DO GESTOR (gestor.html) ---
    const funcionarioInput = document.getElementById('funcionario');
    const setorInput = document.getElementById('setor');
    const dataInput = document.getElementById('data');
    const feedbackForm = document.getElementById('feedback-form');

    // Simulação de banco de dados de funcionários
    const funcionariosDB = {
        "FULANO": "TI",
        "CICRANO": "RH",
        "BELTRANO": "FINANCEIRO"
    };

    // Requisito 4: Preenchimento automático de Setor e Data
    if (funcionarioInput) {
        funcionarioInput.addEventListener('blur', function() { // Evento 'blur' ocorre quando o campo perde o foco
            const nomeFuncionario = this.value.toUpperCase(); // Padroniza para maiúsculas
            
            if (funcionariosDB[nomeFuncionario]) {
                // Preenche o setor
                setorInput.value = funcionariosDB[nomeFuncionario];
                
                // Preenche a data atual
                const hoje = new Date();
                const dia = String(hoje.getDate()).padStart(2, '0');
                const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa do 0
                const ano = hoje.getFullYear();
                dataInput.value = `${dia}/${mes}/${ano}`;

            } else {
                // Limpa os campos se o funcionário não for encontrado
                setorInput.value = '';
                dataInput.value = '';
                if(this.value !== '') {
                   alert('Funcionário não encontrado no sistema.');
                }
            }
        });
    }

    // Requisito 4: Salvar Feedback
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário
            
            // Validação simples dos campos obrigatórios
            if (funcionarioInput.value === '' || setorInput.value === '' || document.getElementById('feedback').value === '' || document.getElementById('pontos-melhorar').value === '') {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Simula o salvamento e adiciona ao histórico
            alert('Feedback salvo com sucesso no histórico!');
            // Aqui você adicionaria a lógica para de fato criar uma nova linha na tabela de histórico
            
            feedbackForm.reset(); // Limpa o formulário
        });
    }

    // Requisito 7: Enviar Feedback
    // Seleciona todos os botões de envio na página
    const sendButtons = document.querySelectorAll('.btn-enviar');
    sendButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Lógica para enviar o feedback
            // Em uma aplicação real, isso mudaria um status no banco de dados e notificaria o usuário.
            const row = this.closest('tr');
            const nome = row.cells[0].textContent;
            
            if(confirm(`Tem certeza que deseja enviar o feedback para ${nome}?`)) {
                alert(`Feedback enviado para ${nome} com sucesso!`);
                // Poderia desabilitar o botão ou mudar o ícone após o envio
                this.disabled = true;
                this.innerHTML = '<i class="bi bi-check-lg"></i>';
            }
        });
    });

    // A lógica de edição (Requisito 6) pode ser adicionada de forma similar,
    // tornando as células da tabela editáveis ou abrindo um modal com os dados.

});