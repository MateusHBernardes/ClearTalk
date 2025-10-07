// FRONT/JS/telaAdmin.js - VERSÃO SIMPLIFICADA E PROFISSIONAL
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
    loadTeams();
    loadGestores();
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
    }

    // Mostrar/ocultar campo de gestor baseado no cargo
    const userRole = document.getElementById('userRole');
    if (userRole) {
        userRole.addEventListener('change', function() {
            const gestorField = document.getElementById('gestorField');
            if (this.value === 'funcionario') {
                gestorField.style.display = 'block';
            } else {
                gestorField.style.display = 'none';
            }
        });
    }

    // Criar novo time
    const userTeam = document.getElementById('userTeam');
    if (userTeam) {
        userTeam.addEventListener('change', function() {
            if (this.value === 'novo') {
                showNewTeamModal();
                this.value = '';
            }
        });
    }

    // Máscara de CPF
    const userCPF = document.getElementById('userCPF');
    if (userCPF) {
        userCPF.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
}

// ✅ CARREGAMENTO DE DADOS
async function loadSetores() {
    console.log('📂 Carregando setores...');
    try {
        const response = await fetch('http://localhost:3000/setores');
        const result = await response.json();
        
        if (result.success) {
            const setorSelect = document.getElementById('userSector');
            const teamSectorSelect = document.getElementById('newTeamSector');
            
            if (setorSelect) {
                setorSelect.innerHTML = '<option value="">Selecione um setor</option>';
                result.data.forEach(setor => {
                    const option = document.createElement('option');
                    option.value = setor;
                    option.textContent = setor;
                    setorSelect.appendChild(option);
                });
            }
            
            if (teamSectorSelect) {
                teamSectorSelect.innerHTML = '<option value="">Selecione um setor</option>';
                result.data.forEach(setor => {
                    const option = document.createElement('option');
                    option.value = setor;
                    option.textContent = setor;
                    teamSectorSelect.appendChild(option);
                });
            }
            
            console.log(`✅ ${result.data.length} setores carregados`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar setores:', error);
    }
}

async function loadTeams() {
    console.log('📂 Carregando times...');
    try {
        const response = await fetch('http://localhost:3000/teams');
        const result = await response.json();
        
        if (result.success) {
            const teamSelect = document.getElementById('userTeam');
            if (teamSelect) {
                // Manter a primeira opção e a opção de criar novo
                const firstOption = teamSelect.options[0];
                const newOption = teamSelect.options[1];
                teamSelect.innerHTML = '';
                teamSelect.appendChild(firstOption);
                teamSelect.appendChild(newOption);
                
                result.data.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.id;
                    option.textContent = team.nome;
                    teamSelect.appendChild(option);
                });
            }
            console.log(`✅ ${result.data.length} times carregados`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar times:', error);
    }
}

async function loadGestores() {
    console.log('📂 Carregando gestores...');
    try {
        const response = await fetch('http://localhost:3000/gestores');
        const result = await response.json();
        
        if (result.success) {
            const gestorSelect = document.getElementById('userGestor');
            if (gestorSelect) {
                gestorSelect.innerHTML = '<option value="">Selecione um gestor</option>';
                result.data.forEach(gestor => {
                    const option = document.createElement('option');
                    option.value = gestor.id;
                    option.textContent = gestor.nome;
                    gestorSelect.appendChild(option);
                });
            }
            console.log(`✅ ${result.data.length} gestores carregados`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar gestores:', error);
    }
}

// ✅ MODAIS
function showNewSectorModal() {
    const modal = new bootstrap.Modal(document.getElementById('newSectorModal'));
    document.getElementById('newSectorName').value = '';
    modal.show();
}

function showNewTeamModal() {
    const modal = new bootstrap.Modal(document.getElementById('newTeamModal'));
    document.getElementById('newTeamName').value = '';
    document.getElementById('newTeamSector').value = '';
    modal.show();
}

async function addNewSector() {
    const newSectorName = document.getElementById('newSectorName').value.trim();
    
    if (!newSectorName) {
        alert('Digite o nome do setor');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/setores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: newSectorName })
        });

        const result = await response.json();

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('newSectorModal')).hide();
            await loadSetores();
            showAlert('✅ Setor criado com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro ao criar setor');
        }
    } catch (error) {
        console.error('❌ Erro ao criar setor:', error);
        alert('❌ Erro ao criar setor: ' + error.message);
    }
}

async function addNewTeam() {
    const newTeamName = document.getElementById('newTeamName').value.trim();
    const newTeamSector = document.getElementById('newTeamSector').value;
    
    if (!newTeamName) {
        alert('Digite o nome do time');
        return;
    }

    if (!newTeamSector) {
        alert('Selecione um setor para o time');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nome: newTeamName,
                setor: newTeamSector
            })
        });

        const result = await response.json();

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('newTeamModal')).hide();
            await loadTeams();
            showAlert('✅ Time criado com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro ao criar time');
        }
    } catch (error) {
        console.error('❌ Erro ao criar time:', error);
        alert('❌ Erro ao criar time: ' + error.message);
    }
}

// ✅ GERENCIAMENTO DE USUÁRIOS
async function loadUsers() {
    console.log('📥 Carregando usuários...');
    try {
        const response = await fetch('http://localhost:3000/users-with-teams');
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ ${result.data.length} usuários carregados`);
            displayUsers(result.data);
            displayTeamsOverview(result.data);
        } else {
            console.error('❌ Erro na resposta:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
    }
}

function displayUsers(users) {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;

    usersTableBody.innerHTML = users.map(user => `
        <tr data-id="${user.id}">
            <td>${user.nome}</td>
            <td>${user.setor || '-'}</td>
            <td>${user.timeNome || '-'}</td>
            <td>
                <span class="badge ${getCargoBadgeClass(user.cargo)}">
                    ${formatCargo(user.cargo)}
                </span>
            </td>
            <td>
                <button class="action-button status-user-btn" onclick="toggleUserStatus(${user.id}, ${!user.status})" 
                        title="${user.status ? 'Inativar' : 'Ativar'}">
                    <i class="bi ${user.status ? 'bi-person-check-fill text-success' : 'bi-person-x-fill text-danger'}"></i>
                </button>
            </td>
            <td>${formatCPF(user.cpf)}</td>
            <td>
                <button class="action-button edit-user-btn" onclick="editUser(${user.id})" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="action-button delete-user-btn" onclick="deleteUser(${user.id})" title="Excluir">
                    <i class="bi bi-trash-fill text-danger"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function displayTeamsOverview(users) {
    const teamsTableBody = document.getElementById('teamsTableBody');
    if (!teamsTableBody) return;

    // Agrupar usuários por time
    const teamsMap = {};
    users.forEach(user => {
        const teamKey = user.timeNome || 'Sem Time';
        if (!teamsMap[teamKey]) {
            teamsMap[teamKey] = {
                setor: user.setor || '-',
                gestor: users.find(u => u.timeNome === teamKey && u.cargo === 'gestor')?.nome || '-',
                colaboradores: 0,
                status: true
            };
        }
        teamsMap[teamKey].colaboradores++;
    });

    teamsTableBody.innerHTML = Object.entries(teamsMap).map(([time, data]) => `
        <tr>
            <td><strong>${time}</strong></td>
            <td>${data.setor}</td>
            <td>${data.gestor}</td>
            <td>
                <span class="badge bg-info">${data.colaboradores} colaboradores</span>
            </td>
            <td>
                <span class="badge bg-success">Ativo</span>
            </td>
        </tr>
    `).join('');
}

function formatCPF(cpf) {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

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
            
            document.getElementById('userName').value = user.nome;
            document.getElementById('userSector').value = user.setor || '';
            document.getElementById('userTeam').value = user.timeId || '';
            document.getElementById('userRole').value = user.cargo;
            document.getElementById('userCPF').value = user.cpf;
            document.getElementById('userGestor').value = user.gestorId || '';
            
            // Mostrar/ocultar gestor baseado no cargo
            const gestorField = document.getElementById('gestorField');
            if (user.cargo === 'funcionario') {
                gestorField.style.display = 'block';
            }
            
            document.getElementById('userForm').setAttribute('data-editing-id', userId);
            
            const submitBtn = document.querySelector('#userForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'ATUALIZAR USUÁRIO';
                submitBtn.classList.add('btn-warning');
            }
            
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do usuário');
    }
}

async function saveUser() {
    console.log('💾 Salvando usuário...');

    try {
        const userName = document.getElementById('userName');
        const userSector = document.getElementById('userSector');
        const userTeam = document.getElementById('userTeam');
        const userRole = document.getElementById('userRole');
        const userCPF = document.getElementById('userCPF');
        const userGestor = document.getElementById('userGestor');
        const userForm = document.getElementById('userForm');

        // VALIDAÇÃO
        if (!userName.value || !userSector.value || !userRole.value || !userCPF.value) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        if (userRole.value === 'funcionario' && !userGestor.value) {
            throw new Error('Funcionários devem ter um gestor responsável');
        }

        const editingId = userForm.getAttribute('data-editing-id');
        const userData = {
            nome: userName.value,
            setor: userSector.value,
            timeId: userTeam.value || null,
            cargo: userRole.value,
            cpf: userCPF.value.replace(/\D/g, ''),
            gestorId: userRole.value === 'funcionario' ? userGestor.value : null,
            status: true
        };

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
            clearUserForm();
            await loadUsers();
            await loadGestores();
            showAlert('✅ Usuário salvo com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro desconhecido ao salvar usuário');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
        alert('❌ Erro ao salvar usuário: ' + error.message);
    }
}

function clearUserForm() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.reset();
        userForm.removeAttribute('data-editing-id');
        document.getElementById('gestorField').style.display = 'none';
        
        const submitBtn = userForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'SALVAR USUÁRIO';
            submitBtn.classList.remove('btn-warning');
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

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            loadUsers();
            showAlert('✅ Usuário excluído com sucesso!', 'success');
        } else {
            alert('❌ Erro ao excluir usuário: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao excluir usuário');
    }
}

// ✅ FUNÇÕES UTILITÁRIAS
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

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