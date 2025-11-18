// ✅ telaAdmin.js ATUALIZADO - SISTEMA DE INATIVAÇÃO CORRIGIDO
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ telaAdmin.js carregado');
    
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

    if (user.cargo !== 'admin') {
        alert('Acesso negado! Apenas administradores.');
        window.location.href = 'login.html';
        return;
    }

    console.log('👤 Usuário admin autenticado:', user.nome);
    
    // Carregar dados iniciais
    loadUsers();
    loadSetores();
    setupEventListeners();
});

function setupEventListeners() {
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

    // Formulário de usuário
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser().catch(error => {
                console.error('Erro no submit do usuário:', error);
            });
        });
        console.log('✅ Formulário de usuário configurado');
    }

    // ✅ SISTEMA PARA ADICIONAR NOVOS SETORES
    const userSectorSelect = document.getElementById('userSector');
    if (userSectorSelect) {
        userSectorSelect.addEventListener('change', function() {
            if (this.value === 'new') {
                const newSector = prompt('Digite o nome do novo setor:');
                if (newSector && newSector.trim()) {
                    addSectorToDropdown(newSector.trim());
                    this.value = newSector.trim();
                } else {
                    this.value = '';
                }
            }
        });
    }
}

// ✅ FUNÇÃO: Adicionar setor ao dropdown
function addSectorToDropdown(setorName) {
    const setorSelect = document.getElementById('userSector');
    if (setorSelect) {
        const existingOption = setorSelect.querySelector(`option[value="${setorName}"]`);
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = setorName;
            option.textContent = setorName;
            setorSelect.insertBefore(option, setorSelect.lastChild);
        }
    }
}

// ✅ CARREGAMENTO DE SETORES
async function loadSetores() {
    console.log('📂 Carregando setores...');
    try {
        const response = await fetch('http://localhost:3000/setores');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Resposta não é JSON');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const setorSelect = document.getElementById('userSector');
            if (setorSelect) {
                setorSelect.innerHTML = `
                    <option value="">Selecione um setor</option>
                    <option value="new">➕ Adicionar novo setor</option>
                `;
                
                result.data.forEach(setor => {
                    const option = document.createElement('option');
                    option.value = setor;
                    option.textContent = setor;
                    setorSelect.appendChild(option);
                });
                
                console.log(`✅ ${result.data.length} setores carregados`);
            }
        } else {
            console.error('❌ Erro na resposta:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar setores:', error);
        loadDefaultSetores();
    }
}

// ✅ FUNÇÃO: Carregar setores padrão em caso de erro
function loadDefaultSetores() {
    const setorSelect = document.getElementById('userSector');
    if (setorSelect) {
        const defaultSetores = ['TI', 'RH', 'Financeiro', 'Compras', 'Vendas', 'Marketing'];
        setorSelect.innerHTML = '<option value="">Selecione um setor</option>';
        
        defaultSetores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor;
            option.textContent = setor;
            setorSelect.appendChild(option);
        });
        
        const newOption = document.createElement('option');
        newOption.value = 'new';
        newOption.textContent = '➕ Adicionar novo setor';
        setorSelect.appendChild(newOption);
        
        console.log('✅ Setores padrão carregados');
    }
}

// ========== GERENCIAMENTO DE USUÁRIOS ==========

async function loadUsers() {
    console.log('📥 Carregando usuários...');
    try {
        const response = await fetch('http://localhost:3000/users-all');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Resposta não é JSON');
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ ${result.data.length} usuários carregados`);
            displayUsers(result.data);
            displaySetoresOverview(result.data);
        } else {
            console.error('❌ Erro na resposta:', result.error);
            alert('Erro ao carregar usuários: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
}

function displayUsers(users) {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) {
        console.error('❌ Tabela de usuários não encontrada');
        return;
    }

    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">Nenhum usuário cadastrado</p>
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = users.map(user => `
        <tr data-id="${user.id}" class="${user.status ? '' : 'table-secondary'}">
            <td>
                ${user.nome}
                ${!user.status ? '<br><small class="text-muted">👻 Inativo</small>' : ''}
            </td>
            <td>${user.setor || '-'}</td>
            <td>
                <span class="badge ${getCargoBadgeClass(user.cargo)}">
                    ${formatCargo(user.cargo)}
                </span>
            </td>
            <td>
                <span class="badge ${user.status ? 'bg-success' : 'bg-danger'}">
                    ${user.status ? '✅ Ativo' : '❌ Inativo'}
                </span>
                <button class="action-button status-user-btn" onclick="toggleUserStatus(${user.id}, ${!user.status})" 
                        title="${user.status ? 'Inativar' : 'Reativar'} Usuário"
                        style="margin-left: 8px;">
                    <i class="bi ${user.status ? 'bi-person-check' : 'bi-person-x'}"></i>
                </button>
            </td>
            <td>${formatCPF(user.cpf)}</td>
            <td>
                <button class="action-button edit-user-btn" onclick="editUser(${user.id})" title="Editar Usuário">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ✅ ATUALIZADO: Função para mostrar visão geral dos setores
function displaySetoresOverview(users) {
    const setoresTableBody = document.getElementById('setoresTableBody');
    if (!setoresTableBody) return;

    // Agrupar usuários por setor
    const setoresMap = {};
    users.forEach(user => {
        const setorKey = user.setor || 'Sem Setor';
        if (!setoresMap[setorKey]) {
            setoresMap[setorKey] = {
                colaboradores: 0,
                colaboradoresAtivos: 0,
                gestor: '-',
                status: 'Ativo'
            };
        }
        setoresMap[setorKey].colaboradores++;
        if (user.status) {
            setoresMap[setorKey].colaboradoresAtivos++;
        }
        
        // Encontrar gestor do setor
        if (user.cargo === 'gestor' && user.setor === setorKey && user.status) {
            setoresMap[setorKey].gestor = user.nome;
        }
    });

    setoresTableBody.innerHTML = Object.entries(setoresMap).map(([setor, data]) => `
        <tr>
            <td><strong>${setor}</strong></td>
            <td>
                <span class="badge bg-info">${data.colaboradoresAtivos} ativo(s)</span>
                <span class="badge bg-secondary">${data.colaboradores - data.colaboradoresAtivos} inativo(s)</span>
            </td>
            <td>${data.gestor}</td>
            <td>
                <span class="badge ${data.colaboradoresAtivos > 0 ? 'bg-success' : 'bg-warning'}">
                    ${data.colaboradoresAtivos > 0 ? '✅ Ativo' : '⚠️ Sem ativos'}
                </span>
            </td>
        </tr>
    `).join('');
}

// ✅ NOVA FUNÇÃO: Formatar CPF para exibição
function formatCPF(cpf) {
    if (!cpf) return '-';
    const cpfStr = cpf.toString().padStart(11, '0');
    return cpfStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// ✅ FUNÇÕES: Formatação de cargos
function formatCargo(cargo) {
    const cargos = {
        'admin': 'Administrador',
        'gestor': 'Gestor',
        'funcionario': 'Funcionário'
    };
    return cargos[cargo] || cargo;
}

function getCargoBadgeClass(cargo) {
    const classes = {
        'admin': 'bg-danger',
        'gestor': 'bg-warning text-dark',
        'funcionario': 'bg-info'
    };
    return classes[cargo] || 'bg-secondary';
}

async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const result = await response.json();
        
        if (result.success) {
            const user = result.data;
            
            // Preencher formulário com dados do usuário
            document.getElementById('userName').value = user.nome;
            document.getElementById('userSector').value = user.setor || '';
            document.getElementById('userRole').value = user.cargo;
            document.getElementById('userCPF').value = formatCPF(user.cpf);
            
            // Adicionar ID do usuário como data attribute no formulário
            document.getElementById('userForm').setAttribute('data-editing-id', userId);
            
            // Mudar texto do botão para indicar edição
            const submitBtn = document.querySelector('#userForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'ATUALIZAR USUÁRIO';
                submitBtn.classList.remove('btn-salvar');
                submitBtn.classList.add('btn-warning');
            }
            
            console.log('✅ Formulário preenchido para edição do usuário:', user.nome);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do usuário');
    }
}

async function saveUser() {
    console.log('💾 Tentando salvar usuário...');

    try {
        // ✅ OBTER ELEMENTOS DO FORMULÁRIO
        const userName = document.getElementById('userName');
        const userSector = document.getElementById('userSector');
        const userRole = document.getElementById('userRole');
        const userCPF = document.getElementById('userCPF');
        const userForm = document.getElementById('userForm');

        if (!userName || !userSector || !userRole || !userCPF) {
            throw new Error('Elementos do formulário de usuário não encontrados');
        }

        // ✅ VALIDAÇÃO DOS DROPDOWNS
        if (!userRole.value) {
            throw new Error('Selecione um cargo');
        }

        if (!userSector.value) {
            throw new Error('Selecione ou adicione um setor');
        }

        // Verificar se é edição ou criação
        const editingId = userForm.getAttribute('data-editing-id');
        
        // Limpar CPF (remover pontos e traços)
        const cpfLimpo = userCPF.value.replace(/\D/g, '');
        
        const userData = {
            nome: userName.value.trim(),
            setor: userSector.value,
            cargo: userRole.value,
            cpf: cpfLimpo,
            status: true
        };

        console.log('📤 Dados do usuário para salvar:', userData);

        // ✅ VALIDAÇÃO BÁSICA
        if (!userData.nome || !userData.cargo || !userData.cpf) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        if (userData.cpf.length < 11) {
            throw new Error('CPF deve ter pelo menos 11 números');
        }

        const url = editingId ? `http://localhost:3000/users/${editingId}` : 'http://localhost:3000/users';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.success) {
            // ✅ RECARREGAR SETORES SE FOR UM NOVO
            if (userSector.value && !document.querySelector(`#userSector option[value="${userSector.value}"]`)) {
                addSectorToDropdown(userSector.value);
            }
            
            // ✅ LIMPAR FORMULÁRIO E RECARREGAR DADOS
            clearUserForm();
            await loadUsers();
            showAlert('✅ ' + (result.message || 'Usuário salvo com sucesso!'), 'success');
            console.log('✅ Usuário salvo com sucesso:', result.data);
        } else {
            throw new Error(result.error || 'Erro desconhecido ao salvar usuário');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
        alert('❌ Erro ao salvar usuário: ' + error.message);
    }
}

// ✅ FUNÇÃO: Limpar formulário de usuário
function clearUserForm() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.reset();
        userForm.removeAttribute('data-editing-id');
        
        const submitBtn = userForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'SALVAR USUÁRIO';
            submitBtn.classList.remove('btn-warning');
            submitBtn.classList.add('btn-salvar');
        }
    }
}

// ✅ FUNÇÃO ATUALIZADA: Alternar status do usuário (INATIVAÇÃO/REATIVAÇÃO)
async function toggleUserStatus(userId, newStatus) {
    const acao = newStatus ? 'ativar' : 'inativar';
    const confirmMessage = newStatus ? 
        'Tem certeza que deseja reativar este usuário? Ele poderá fazer login novamente.' :
        'Tem certeza que deseja inativar este usuário? Ele não poderá fazer login, mas permanecerá no sistema.';

    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            loadUsers();
            showAlert(`✅ ${result.message || `Usuário ${acao}do com sucesso!`}`, 'success');
        } else {
            alert('❌ Erro ao alterar status: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao alterar status do usuário');
    }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);  
}

// Inicializa os tooltips do Bootstrap
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// ✅ MASCARAR CPF NO FORMULÁRIO
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('userCPF');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
});