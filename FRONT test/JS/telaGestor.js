// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- SIMULAÇÃO DE BANCO DE DADOS ---
    // Em um projeto real, estes dados viriam de uma API/backend.

    // Lista de funcionários cadastrados
    const funcionarios = [
        { id: 1, nome: 'Fulano da Silva', setor: 'TI' },
        { id: 2, nome: 'Ciclana de Souza', setor: 'RH' },
        { id: 3, nome: 'Beltrano Oliveira', setor: 'Marketing' }
    ];

    // Array para armazenar os feedbacks criados
    let feedbacks = [
        // Exemplo inicial para visualização
        { 
            id: 1, 
            funcionarioId: 1, 
            feedback: 'Excelente desempenho no projeto X.', 
            pontosMelhorar: 'Nenhum ponto a ser destacado no momento.', 
            data: '25/08/2025', 
            status: 'salvo' // 'salvo' ou 'enviado'
        }
    ];

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const form = document.getElementById('feedback-form');
    const funcionarioSelect = document.getElementById('funcionario');
    const setorInput = document.getElementById('setor');
    const dataInput = document.getElementById('data');
    const feedbackIdInput = document.getElementById('feedback-id');
    const feedbackTextarea = document.getElementById('feedback');
    const pontosMelhorarTextarea = document.getElementById('pontos-melhorar');
    const historicoBody = document.getElementById('historico-body');
    const btnSair = document.getElementById('btn-sair');

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Carrega os funcionários no campo <select> do formulário.
     */
    function popularFuncionarios() {
        funcionarios.forEach(func => {
            const option = document.createElement('option');
            option.value = func.id;
            option.textContent = func.nome;
            funcionarioSelect.appendChild(option);
        });
    }

    /**
     * Formata uma data para o padrão DD/MM/AAAA.
     * @param {Date} date - O objeto de data a ser formatado.
     * @returns {string} - A data formatada.
     */
    function formatarData(date) {
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    /**
     * Renderiza a tabela de histórico de feedbacks.
     * Limpa a tabela existente e a recria com os dados do array 'feedbacks'.
     */
    function renderizarHistorico() {
        historicoBody.innerHTML = ''; // Limpa a tabela

        if (feedbacks.length === 0) {
            historicoBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum feedback cadastrado.</td></tr>';
            return;
        }

        feedbacks.forEach(fb => {
            const funcionario = funcionarios.find(f => f.id === fb.funcionarioId);
            const linha = document.createElement('tr');
            
            const isSent = fb.status === 'enviado';
            const sendIconClass = isSent ? 'fa-solid fa-check-circle sent' : 'fa-solid fa-paper-plane';
            const sendTitle = isSent ? 'Feedback já enviado' : 'Enviar para o funcionário';

            linha.innerHTML = `
                <td>
                    <span class="status-indicator ${isSent ? 'status-sent' : 'status-saved'}" title="${isSent ? 'Enviado' : 'Salvo'}"></span>
                    ${funcionario.nome}
                </td>
                <td>${funcionario.setor}</td>
                <td>${fb.feedback.substring(0, 30)}...</td>
                <td>${fb.pontosMelhorar.substring(0, 30)}...</td>
                <td class="text-center">
                    <i class="fas fa-edit action-icon icon-edit" data-id="${fb.id}" title="Editar Feedback"></i>
                </td>
                <td class="text-center">
                    <i class="${sendIconClass} action-icon icon-send" data-id="${fb.id}" title="${sendTitle}"></i>
                </td>
            `;
            historicoBody.appendChild(linha);
        });
    }

    /**
     * Limpa os campos do formulário e redefine para o modo de criação.
     */
    function limparFormulario() {
        form.reset(); // Limpa todos os campos
        setorInput.value = '';
        dataInput.value = '';
        feedbackIdInput.value = ''; // Garante que estamos no modo de criação
    }
    
    // --- EVENT LISTENERS (OUVINTES DE EVENTOS) ---

    // REQUISITO: Sair do sistema
    btnSair.addEventListener('click', () => {
        alert('Funcionalidade de "Sair" acionada. Redirecionando para a tela de login...');
        // Em uma aplicação real, aqui você redirecionaria o usuário
        // window.location.href = '/login.html'; 
    });

    // REQUISITO: Criar Feedback (Preenchimento automático)
    funcionarioSelect.addEventListener('change', (e) => {
        const funcionarioId = e.target.value;
        if (funcionarioId) {
            const funcionario = funcionarios.find(f => f.id == funcionarioId);
            setorInput.value = funcionario.setor;
            dataInput.value = formatarData(new Date());
        } else {
            setorInput.value = '';
            dataInput.value = '';
        }
    });

    // REQUISITO: Criar e Editar Feedback (Salvar)
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const id = feedbackIdInput.value;
        const funcionarioId = parseInt(funcionarioSelect.value);
        const feedback = feedbackTextarea.value.trim();
        const pontosMelhorar = pontosMelhorarTextarea.value.trim();
        const data = dataInput.value;

        // Validação dos campos
        if (!funcionarioId || !feedback || !pontosMelhorar) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (id) { // --- MODO EDIÇÃO ---
            const index = feedbacks.findIndex(fb => fb.id == id);
            if (index !== -1) {
                feedbacks[index] = { ...feedbacks[index], funcionarioId, feedback, pontosMelhorar, data };
                alert('Feedback atualizado com sucesso!');
            }
        } else { // --- MODO CRIAÇÃO ---
            const novoFeedback = {
                id: Date.now(), // ID único baseado no timestamp
                funcionarioId,
                feedback,
                pontosMelhorar,
                data,
                status: 'salvo' // Status inicial
            };
            feedbacks.push(novoFeedback);
            alert('Feedback salvo com sucesso no histórico!');
        }

        limparFormulario();
        renderizarHistorico();
    });

    // REQUISITOS: Editar e Enviar Feedback (Ações do Histórico)
    historicoBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (!id) return;

        // Ação de EDITAR
        if (target.classList.contains('fa-edit')) {
            const feedbackParaEditar = feedbacks.find(fb => fb.id == id);
            if(feedbackParaEditar.status === 'enviado'){
                alert('Não é possível editar um feedback que já foi enviado.');
                return;
            }

            // Preenche o formulário com os dados para edição
            feedbackIdInput.value = feedbackParaEditar.id;
            funcionarioSelect.value = feedbackParaEditar.funcionarioId;
            feedbackTextarea.value = feedbackParaEditar.feedback;
            pontosMelhorarTextarea.value = feedbackParaEditar.pontosMelhorar;
            // Dispara o evento 'change' para atualizar setor e data
            funcionarioSelect.dispatchEvent(new Event('change')); 
            
            window.scrollTo(0, 0); // Rola a página para o topo para ver o formulário
        }

        // Ação de ENVIAR
        if (target.classList.contains('fa-paper-plane') && !target.classList.contains('sent')) {
            const index = feedbacks.findIndex(fb => fb.id == id);
            if (index !== -1) {
                feedbacks[index].status = 'enviado';
                alert(`Feedback para ${funcionarios.find(f => f.id === feedbacks[index].funcionarioId).nome} enviado com sucesso!`);
                renderizarHistorico(); // Re-renderiza para atualizar o ícone
            }
        }
    });

    // --- INICIALIZAÇÃO DA PÁGINA ---
    function init() {
        popularFuncionarios();
        renderizarHistorico();
    }

    init(); // Chama a função inicial
});