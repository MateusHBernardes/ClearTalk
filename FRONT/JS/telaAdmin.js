// FRONT/JS/telaAdmin.js - VERSÃO ATUALIZADA COM STATUS NOS SETORES
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
                    // Adiciona a nova opção ao dropdown
                    addSectorToDropdown(newSector.trim());
                    // Seleciona o novo setor
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
        // Verificar se o setor já existe
        const existingOption = setorSelect.querySelector(`option[value="${setorName}"]`);
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = setorName;
            option.textContent = setorName;
            // Insere antes da opção "Adicionar novo setor"
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
                
                // Adicionar setores existentes
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
        
        // Adicionar opção para novo setor
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
            displaySetoresOverview(result.data); // ✅ ATUALIZADO: Mostrar visão dos setores COM STATUS
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

    usersTableBody.innerHTML = users.map(user => `
        <tr data-id="${user.id}">
            <td>${user.nome}</td>
            <td>${user.setor || '-'}</td>
            <td>
                <span class="badge ${getCargoBadgeClass(user.cargo)}">
                    ${formatCargo(user.cargo)}
                </span>
            </td>
            <td>
                <span class="badge ${user.status ? 'bg-success' : 'bg-danger'}">
                    ${user.status ? 'Ativo' : 'Inativo'}
                </span>
                <button class="action-button status-user-btn" onclick="toggleUserStatus(${user.id}, ${!user.status})" 
                        title="${user.status ? 'Inativar' : 'Ativar'} Usuário"
                        style="margin-left: 8px;">
                    <i class="bi ${user.status ? 'bi-person-check' : 'bi-person-x'}"></i>
                </button>
            </td>
            <td>${user.cpf}</td>
            <td>
                <button class="action-button edit-user-btn" onclick="editUser(${user.id})" title="Editar Usuário">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ✅ ATUALIZADO: Função para mostrar visão geral dos setores COM STATUS CENTRALIZADO
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
                gestor: '-',
                status: 'Ativo' // Status padrão para setores
            };
        }
        setoresMap[setorKey].colaboradores++;
        
        // Encontrar gestor do setor
        if (user.cargo === 'gestor' && user.setor === setorKey) {
            setoresMap[setorKey].gestor = user.nome;
        }
    });

    setoresTableBody.innerHTML = Object.entries(setoresMap).map(([setor, data]) => `
        <tr>
            <td><strong>${setor}</strong></td>
            <td>
                <span class="badge bg-info">${data.colaboradores} colaborador(es)</span>
            </td>
            <td>${data.gestor}</td>
            <td>
                <select class="form-select status-setor" data-setor="${setor}">
                    <option value="Ativo" ${data.status === 'Ativo' ? 'selected' : ''}>✅ Ativo</option>
                    <option value="Inativo" ${data.status === 'Inativo' ? 'selected' : ''}>❌ Inativo</option>
                </select>
            </td>
        </tr>
    `).join('');

    // Adicionar event listeners para os dropdowns de status dos setores
    document.querySelectorAll('.status-setor').forEach(select => {
        select.addEventListener('change', function() {
            const setor = this.getAttribute('data-setor');
            const status = this.value;
            updateSetorStatus(setor, status);
        });
    });
}

// ✅ NOVA FUNÇÃO: Atualizar status do setor
function updateSetorStatus(setorName, status) {
    console.log(`📝 Atualizando status do setor ${setorName} para: ${status}`);
    // Aqui você pode adicionar a lógica para salvar no backend
    // Por enquanto, apenas mostra um alerta
    showAlert(`Status do setor ${setorName} atualizado para ${status}`, 'success');
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
        'gestor': 'bg-warning',
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
            document.getElementById('userCPF').value = user.cpf;
            
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
        const userData = {
            nome: userName.value,
            setor: userSector.value,
            cargo: userRole.value,
            cpf: userCPF.value,
            status: true
        };

        console.log('📤 Dados do usuário para salvar:', userData);

        // ✅ VALIDAÇÃO BÁSICA
        if (!userData.nome || !userData.cargo || !userData.cpf) {
            throw new Error('Preencha todos os campos obrigatórios');
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
            await loadUsers(); // Isso também recarrega a visão dos setores
            showAlert('✅ Usuário salvo com sucesso!', 'success');
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

async function toggleUserStatus(userId, newStatus) {
    if (!confirm(`Tem certeza que deseja ${newStatus ? 'ativar' : 'inativar'} este usuário?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            loadUsers();
            showAlert(`✅ Usuário ${newStatus ? 'ativado' : 'inativado'} com sucesso!`, 'success');
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