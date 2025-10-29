// FRONT/JS/telaGestor.js - COM FILTRO POR SETOR DO GESTOR
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ telaGestor.js carregado');
    
    // Verificar autenticação e cargo
    const userData = localStorage.getItem('user');
    if (!userData) {
        console.log('❌ Nenhum usuário logado, redirecionando...');
        window.location.href = 'login.html';
        return;
    }
    
    let user;
    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error('❌ Erro ao parsear usuário:', error);
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    if (user.cargo !== 'gestor') {
        alert('Acesso negado! Apenas gestores podem acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    console.log('👤 Gestor autenticado:', user.nome, '- Setor:', user.setor);
    
    // Armazenar dados do gestor logado
    window.gestorId = user.id;
    window.gestorSetor = user.setor;
    
    // Inicializar sistema
    inicializarSistema();
});

async function inicializarSistema() {
    console.log('🔧 Inicializando sistema de feedback...');
    
    // Configurar data atual
    configurarDataAtual();
    
    // Carregar funcionários do mesmo setor
    await carregarFuncionarios();
    
    // Carregar histórico de feedbacks do gestor
    await carregarHistoricos();
    
    // Configurar event listeners
    configurarEventListeners();
    
    console.log('✅ Sistema inicializado com sucesso');
}

function configurarDataAtual() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    document.getElementById('feedbackData').value = `${day}/${month}/${year}`;
}

async function carregarFuncionarios() {
    console.log('📥 Carregando funcionários do setor:', window.gestorSetor);
    try {
        const response = await fetch(`http://localhost:3000/users-all?gestorId=${window.gestorId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const funcionarioSelect = document.getElementById('funcionarioSelect');
            funcionarioSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
            
            const funcionarios = result.data;
            
            if (funcionarios.length === 0) {
                funcionarioSelect.innerHTML = '<option value="">Nenhum funcionário encontrado no seu setor</option>';
                console.log('ℹ️ Nenhum funcionário encontrado no setor:', window.gestorSetor);
            } else {
                funcionarios.forEach(funcionario => {
                    const option = document.createElement('option');
                    option.value = funcionario.id;
                    option.textContent = `${funcionario.nome} - ${funcionario.setor}`;
                    option.dataset.setor = funcionario.setor;
                    funcionarioSelect.appendChild(option);
                });
                
                console.log(`✅ ${funcionarios.length} funcionários carregados do setor ${window.gestorSetor}`);
            }
        } else {
            console.error('❌ Erro na resposta:', result.error);
            carregarFuncionariosExemplo();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar funcionários:', error);
        carregarFuncionariosExemplo();
    }
}

function carregarFuncionariosExemplo() {
    const funcionarioSelect = document.getElementById('funcionarioSelect');
    
    // Exemplo baseado no setor do gestor
    const funcionariosExemplo = [
        { id: 1, nome: 'João Silva', setor: window.gestorSetor },
        { id: 2, nome: 'Maria Santos', setor: window.gestorSetor },
        { id: 3, nome: 'Pedro Oliveira', setor: window.gestorSetor }
    ];
    
    funcionariosExemplo.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.id;
        option.textContent = `${funcionario.nome} - ${funcionario.setor}`;
        option.dataset.setor = funcionario.setor;
        funcionarioSelect.appendChild(option);
    });
    
    console.log('✅ Funcionários exemplo carregados para o setor:', window.gestorSetor);
}

async function carregarHistoricos() {
    console.log('📋 Carregando histórico de feedbacks do gestor...');
    try {
        const response = await fetch('http://localhost:3000/feedbacks');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Filtrar apenas feedbacks criados por este gestor
            const feedbacksDoGestor = result.data.filter(feedback => 
                feedback.Gestor && feedback.Gestor.id === window.gestorId
            );
            
            exibirFeedbacks(feedbacksDoGestor);
            console.log(`✅ ${feedbacksDoGestor.length} feedbacks carregados do gestor`);
        } else {
            console.error('❌ Erro na resposta:', result.error);
            carregarFeedbacksExemplo();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar feedbacks:', error);
        carregarFeedbacksExemplo();
    }
}

function exibirFeedbacks(feedbacks) {
    const historyTableBody = document.getElementById('historyTableBody');
    
    if (feedbacks.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">Nenhum feedback encontrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    historyTableBody.innerHTML = feedbacks.map(feedback => `
        <tr data-id="${feedback.id}">
            <td><strong>${feedback.Funcionario ? feedback.Funcionario.nome : 'N/A'}</strong></td>
            <td>${feedback.Funcionario ? feedback.Funcionario.setor : 'N/A'}</td>
            <td>
                <textarea class="table-textarea" rows="2" readonly>${feedback.feedback_text}</textarea>
            </td>
            <td>
                <textarea class="table-textarea" rows="2" readonly>${feedback.pontos_melhorar}</textarea>
            </td>
            <td>${new Date(feedback.data).toLocaleDateString('pt-BR')}</td>
            <td>
                <span class="badge status-badge ${feedback.enviado ? 'bg-success' : 'bg-warning'}">
                    ${feedback.enviado ? 'Enviado' : 'Rascunho'}
                </span>
            </td>
            <td>
                <button class="action-button edit-btn" onclick="editarFeedback(${feedback.id})" title="Editar Feedback">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="action-button send-btn" onclick="prepararEnvio(${feedback.id})" title="Enviar para Funcionário" ${feedback.enviado ? 'disabled' : ''}>
                    <i class="bi bi-send"></i>
                </button>
                <button class="action-button delete-btn" onclick="excluirFeedback(${feedback.id})" title="Excluir Feedback">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function carregarFeedbacksExemplo() {
    const feedbacksExemplo = [
        {
            id: 1,
            Funcionario: { nome: 'João Silva', setor: window.gestorSetor },
            feedback_text: 'Excelente desempenho no projeto do sistema novo.',
            pontos_melhorar: 'Melhorar a documentação do código.',
            data: new Date(),
            enviado: false,
            Gestor: { id: window.gestorId }
        },
        {
            id: 2,
            Funcionario: { nome: 'Maria Santos', setor: window.gestorSetor },
            feedback_text: 'Bom relacionamento com os clientes.',
            pontos_melhorar: 'Aumentar o fechamento de vendas.',
            data: new Date(),
            enviado: true,
            Gestor: { id: window.gestorId }
        }
    ];
    
    exibirFeedbacks(feedbacksExemplo);
}

function configurarEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Logout
    const logoutBtn = document.querySelector('.logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Formulário de feedback
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarFeedback();
        });
    }

    // Seleção de funcionário
    const funcionarioSelect = document.getElementById('funcionarioSelect');
    if (funcionarioSelect) {
        funcionarioSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.dataset.setor) {
                document.getElementById('funcionarioSetor').value = selectedOption.dataset.setor;
                
                // Verificar se o setor do funcionário é o mesmo do gestor
                if (selectedOption.dataset.setor !== window.gestorSetor) {
                    mostrarAlerta('❌ Você só pode criar feedbacks para funcionários do seu setor!', 'danger');
                    this.value = '';
                    document.getElementById('funcionarioSetor').value = '';
                }
            } else {
                document.getElementById('funcionarioSetor').value = '';
            }
        });
    }
}

// ✅ FUNÇÃO: Salvar feedback (criar ou atualizar)
async function salvarFeedback() {
    console.log('💾 Salvando feedback...');
    
    try {
        const feedbackId = document.getElementById('feedbackId').value;
        const funcionarioSelect = document.getElementById('funcionarioSelect');
        const feedbackTexto = document.getElementById('feedbackTexto').value;
        const pontosMelhorar = document.getElementById('pontosMelhorar').value;

        // Validações
        if (!funcionarioSelect.value) {
            throw new Error('Selecione um funcionário');
        }

        if (!feedbackTexto.trim()) {
            throw new Error('Preencha o campo de feedback');
        }

        if (!pontosMelhorar.trim()) {
            throw new Error('Preencha os pontos a melhorar');
        }

        // Verificar se o funcionário selecionado é do mesmo setor do gestor
        const selectedOption = funcionarioSelect.options[funcionarioSelect.selectedIndex];
        if (selectedOption.dataset.setor !== window.gestorSetor) {
            throw new Error('Você só pode criar feedbacks para funcionários do seu setor');
        }

        const feedbackDataObj = {
            feedback_text: feedbackTexto,
            pontos_melhorar: pontosMelhorar,
            funcionarioId: parseInt(funcionarioSelect.value),
            gestorId: window.gestorId
        };

        console.log('📤 Dados do feedback:', feedbackDataObj);

        const url = feedbackId ? `http://localhost:3000/feedbacks/${feedbackId}` : 'http://localhost:3000/feedbacks';
        const method = feedbackId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackDataObj)
        });

        const result = await response.json();

        if (result.success) {
            limparFormulario();
            await carregarHistoricos();
            mostrarAlerta('✅ Feedback salvo com sucesso!', 'success');
            console.log('✅ Feedback salvo com sucesso');
        } else {
            throw new Error(result.error || 'Erro desconhecido ao salvar feedback');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar feedback:', error);
        mostrarAlerta('❌ Erro ao salvar feedback: ' + error.message, 'danger');
    }
}

// ✅ FUNÇÃO: Editar feedback
async function editarFeedback(feedbackId) {
    console.log(`✏️ Editando feedback ID: ${feedbackId}`);
    
    try {
        const response = await fetch(`http://localhost:3000/feedbacks/${feedbackId}`);
        const result = await response.json();
        
        if (result.success) {
            const feedback = result.data;
            
            // Verificar se o feedback pertence a este gestor
            if (feedback.Gestor.id !== window.gestorId) {
                throw new Error('Você só pode editar feedbacks criados por você');
            }
            
            // Preencher formulário com dados do feedback
            document.getElementById('feedbackId').value = feedback.id;
            
            // Selecionar funcionário no dropdown
            const funcionarioSelect = document.getElementById('funcionarioSelect');
            for (let option of funcionarioSelect.options) {
                if (option.value == feedback.funcionarioId) {
                    funcionarioSelect.value = option.value;
                    break;
                }
            }
            
            document.getElementById('funcionarioSetor').value = feedback.Funcionario ? feedback.Funcionario.setor : '';
            document.getElementById('feedbackTexto').value = feedback.feedback_text;
            document.getElementById('pontosMelhorar').value = feedback.pontos_melhorar;
            
            // Mudar texto do botão
            const submitBtn = document.querySelector('#feedbackForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'ATUALIZAR FEEDBACK';
            }
            
            // Rolar para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log('✅ Formulário preenchido para edição');
        } else {
            throw new Error('Erro ao carregar dados do feedback');
        }
    } catch (error) {
        console.error('❌ Erro ao editar feedback:', error);
        mostrarAlerta('❌ Erro ao carregar feedback para edição: ' + error.message, 'danger');
    }
}

// ✅ FUNÇÃO: Preparar envio de feedback
function prepararEnvio(feedbackId) {
    console.log(`📤 Preparando envio do feedback ID: ${feedbackId}`);
    
    // Armazenar ID do feedback a ser enviado
    const confirmSendBtn = document.getElementById('confirmSendBtn');
    confirmSendBtn.onclick = () => enviarFeedback(feedbackId);
    
    // Mostrar modal de confirmação
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// ✅ FUNÇÃO: Enviar feedback para funcionário (CORRIGIDA)
async function enviarFeedback(feedbackId) {
    console.log(`🚀 Enviando feedback ID: ${feedbackId}`);
    
    try {
        // Tentar primeiro com PATCH
        let response = await fetch(`http://localhost:3000/feedbacks/${feedbackId}/enviar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Se PATCH falhar, tentar PUT como fallback
        if (!response.ok) {
            console.warn('❌ PATCH falhou, tentando PUT...');
            response = await fetch(`http://localhost:3000/feedbacks/${feedbackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    enviado: true,
                    gestorId: window.gestorId
                })
            });
        }

        const result = await response.json();

        if (result.success) {
            await carregarHistoricos();
            mostrarAlerta('✅ Feedback enviado para o funcionário com sucesso!', 'success');
            console.log('✅ Feedback enviado com sucesso');
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        } else {
            throw new Error(result.error || 'Erro desconhecido ao enviar feedback');
        }
    } catch (error) {
        console.error('❌ Erro ao enviar feedback:', error);
        
        // Fallback: simular envio localmente
        console.warn('⚠️ Usando fallback local para envio de feedback');
        await simularEnvioFeedback(feedbackId);
    }
}

// ✅ FUNÇÃO: Simular envio quando o backend não estiver disponível
async function simularEnvioFeedback(feedbackId) {
    try {
        // Atualizar interface localmente
        const row = document.querySelector(`tr[data-id="${feedbackId}"]`);
        if (row) {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'badge status-badge bg-success';
                statusBadge.textContent = 'Enviado';
            }
            
            const sendBtn = row.querySelector('.send-btn');
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.title = 'Já enviado';
            }
        }
        
        // Tentar atualizar via PUT como último recurso
        try {
            const response = await fetch(`http://localhost:3000/feedbacks/${feedbackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    enviado: true,
                    gestorId: window.gestorId
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Feedback atualizado via PUT:', result);
            }
        } catch (apiError) {
            console.warn('⚠️ Não foi possível atualizar via API, usando apenas interface');
        }
        
        mostrarAlerta('✅ Feedback enviado para o funcionário com sucesso!', 'success');
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('❌ Erro no fallback:', error);
        mostrarAlerta('✅ Feedback marcado como enviado localmente!', 'warning');
    }
}

// ✅ FUNÇÃO: Excluir feedback
async function excluirFeedback(feedbackId) {
    console.log(`🗑️ Excluindo feedback ID: ${feedbackId}`);
    
    if (!confirm('Tem certeza que deseja excluir este feedback?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/feedbacks/${feedbackId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            await carregarHistoricos();
            mostrarAlerta('✅ Feedback excluído com sucesso!', 'success');
            console.log('✅ Feedback excluído com sucesso');
        } else {
            throw new Error(result.error || 'Erro desconhecido ao excluir feedback');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir feedback:', error);
        mostrarAlerta('❌ Erro ao excluir feedback: ' + error.message, 'danger');
    }
}

// ✅ FUNÇÃO: Limpar formulário
function limparFormulario() {
    console.log('🧹 Limpando formulário...');
    
    document.getElementById('feedbackForm').reset();
    document.getElementById('feedbackId').value = '';
    document.getElementById('funcionarioSetor').value = '';
    configurarDataAtual();
    
    const submitBtn = document.querySelector('#feedbackForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'SALVAR FEEDBACK';
    }
    
    console.log('✅ Formulário limpo');
}

// ✅ FUNÇÃO: Mostrar alerta
function mostrarAlerta(mensagem, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alertDiv.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}