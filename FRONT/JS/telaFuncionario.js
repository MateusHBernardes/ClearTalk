// Inicializa os tooltips do Bootstrap
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// Verificar autenticação
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ telaFuncionario.js carregado');
    
    // Verificar autenticação
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

    if (user.cargo !== 'funcionario') {
        alert('Acesso negado! Apenas funcionários podem acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    console.log('👤 Funcionário autenticado:', user.nome, '- ID:', user.id);
    
    // Armazenar dados do funcionário logado
    window.funcionarioId = user.id;
    window.funcionarioNome = user.nome;
    
    // Configurar logout
    const logoutBtn = document.querySelector('.logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
    
    // Carregar feedbacks
    carregarFeedbacks();
});

// Função para carregar os feedbacks do funcionário
async function carregarFeedbacks() {
    console.log('📥 Carregando feedbacks do funcionário ID:', window.funcionarioId);
    
    try {
        // Buscar feedbacks do backend
        const response = await fetch(`http://localhost:3000/feedbacks/funcionario/${window.funcionarioId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            exibirFeedbacks(result.data);
            console.log(`✅ ${result.data.length} feedbacks carregados do backend`);
        } else {
            throw new Error(result.error || 'Erro desconhecido ao carregar feedbacks');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar feedbacks do backend:', error);
        // Fallback: carregar do localStorage
        carregarFeedbacksLocal();
    }
}

// Função para exibir os feedbacks na tabela
function exibirFeedbacks(feedbacks) {
    const feedbacksBody = document.getElementById('feedbacks-body');
    
    // Filtrar apenas feedbacks enviados
    const feedbacksEnviados = feedbacks.filter(feedback => feedback.enviado);
    
    if (feedbacksEnviados.length === 0) {
        feedbacksBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">Nenhum feedback recebido ainda</p>
                    <small class="text-muted">Os feedbacks aparecerão aqui após serem enviados pelo gestor</small>
                </td>
            </tr>
        `;
        return;
    }
    
    // Adiciona cada feedback à tabela
    feedbacksBody.innerHTML = feedbacksEnviados.map(feedback => `
        <tr>
            <td><strong>${feedback.Gestor ? feedback.Gestor.nome : 'Gestor'}</strong></td>
            <td>${feedback.Funcionario ? feedback.Funcionario.setor : 'Setor'}</td>
            <td>${feedback.feedback_text}</td>
            <td>${new Date(feedback.data).toLocaleDateString('pt-BR')}</td>
            <td>${feedback.pontos_melhorar}</td>
        </tr>
    `).join('');
}

// Fallback: carregar feedbacks do localStorage
function carregarFeedbacksLocal() {
    console.log('📥 Tentando carregar feedbacks do localStorage...');
    
    // Buscar feedbacks compartilhados do gestor
    const feedbacksCompartilhados = JSON.parse(localStorage.getItem('feedbacks_compartilhados')) || [];
    const feedbacksDoFuncionario = feedbacksCompartilhados.filter(f => 
        f.funcionarioId === window.funcionarioId && f.enviado === true
    );
    
    if (feedbacksDoFuncionario.length > 0) {
        exibirFeedbacks(feedbacksDoFuncionario);
        console.log(`✅ ${feedbacksDoFuncionario.length} feedbacks carregados do localStorage`);
    } else {
        // Último fallback: dados exemplo
        console.log('📥 Nenhum feedback no localStorage, carregando exemplo...');
        carregarFeedbacksExemplo();
    }
}

// Fallback: carregar feedbacks exemplo
function carregarFeedbacksExemplo() {
    const feedbacksExemplo = [
        {
            id: 1,
            Gestor: { nome: 'FULANO' },
            Funcionario: { setor: 'TI' },
            feedback_text: 'TESTE 1 - Excelente desempenho nas últimas tarefas',
            data: new Date('2023-05-10'),
            pontos_melhorar: 'TESTE 2 - Continuar com a mesma dedicação',
            enviado: true,
            funcionarioId: window.funcionarioId
        },
        {
            id: 2,
            Gestor: { nome: 'CICLANO' },
            Funcionario: { setor: 'RH' },
            feedback_text: 'Ótimo desempenho no último projeto de recrutamento',
            data: new Date('2023-07-15'),
            pontos_melhorar: 'Melhorar comunicação em equipe multidisciplinar',
            enviado: true,
            funcionarioId: window.funcionarioId
        }
    ];
    
    exibirFeedbacks(feedbacksExemplo);
}