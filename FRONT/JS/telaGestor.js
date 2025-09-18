document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos do DOM ---
    const feedbackForm = document.getElementById('feedbackForm');
    const nomeInput = document.getElementById('funcionarioNome');
    const setorInput = document.getElementById('funcionarioSetor');
    const dataInput = document.getElementById('feedbackData');
    const feedbackInput = document.getElementById('feedbackTexto');
    const pontosInput = document.getElementById('pontosMelhorar');
    const historyTableBody = document.getElementById('historyTableBody');

    // --- Funções e Lógica ---

    // 1. Preenche a data atual automaticamente
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dataInput.value = `${day}/${month}/${year}`;

    // 2. Simula o preenchimento automático do setor
    nomeInput.addEventListener('blur', () => {
        // Em uma aplicação real, aqui você faria uma busca no banco de dados
        if (nomeInput.value.trim().toLowerCase() === 'fulano') {
            setorInput.value = 'TI';
        } else if (nomeInput.value.trim() !== '') {
            setorInput.value = 'N/D';
        } else {
            setorInput.value = '';
        }
    });

    // 3. Lida com o envio do formulário (Salvar)
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        
        // Simulação de salvamento e adição na tabela de histórico
        alert('Feedback salvo no histórico com sucesso!');
        
        // Limpa o formulário após salvar
        feedbackForm.reset();
        setorInput.value = ''; // Limpa campos readonly
        dataInput.value = `${day}/${month}/${year}`; // Reseta a data
    });

    // 4. Lida com os cliques nos botões de ação da tabela (Editar e Enviar)
    historyTableBody.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return; // Se não clicou em um botão, ignora

        const row = target.closest('tr');
        const nome = row.dataset.nome;

        // Lógica do botão EDITAR
        if (target.classList.contains('edit-btn')) {
            // Preenche o formulário com os dados da linha clicada
            nomeInput.value = nome;
            setorInput.value = row.dataset.setor;
            feedbackInput.value = row.dataset.feedback;
            pontosInput.value = row.dataset.pontos;
            
            alert(`Dados de '${nome}' carregados para edição. Altere no formulário acima e clique em SALVAR.`);
            
            // Rola a tela para o topo para mostrar o formulário
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Lógica do botão ENVIAR
        if (target.classList.contains('send-btn')) {
            if (confirm(`Deseja realmente enviar este feedback para '${nome}'?`)) {
                alert(`Feedback enviado para '${nome}' com sucesso!`);
                // Aqui iria a lógica de envio para o backend
            }
        }
    });
});