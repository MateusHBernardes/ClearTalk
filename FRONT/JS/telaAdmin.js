// FRONT/JS/telaAdmin.js - VERSÃO COMPATÍVEL COM SEU HTML
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
    loadTimes();
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

    // ✅ CORREÇÃO: Configurar handlers para formulários na página (não modais)
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

    const teamForm = document.getElementById('teamForm');
    if (teamForm) {
        teamForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTeam().catch(error => {
                console.error('Erro no submit do time:', error);
            });
        });
        console.log('✅ Formulário de time configurado');
    }
}

// ========== GERENCIAMENTO DE USUÁRIOS ==========

async function loadUsers() {
    console.log('📥 Carregando usuários...');
    try {
        const response = await fetch('http://localhost:3000/users-with-teams');
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ ${result.data.length} usuários carregados`);
            displayUsers(result.data);
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
            <td>${user.cargo}</td>
            <td>
                <button class="action-button status-user-btn" onclick="toggleUserStatus(${user.id}, ${!user.status})" title="${user.status ? 'Inativar' : 'Ativar'} Usuário">
                    <i class="bi ${user.status ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i>
                </button>
            </td>
            <td>${user.cpf}</td>
            <td>
                <button class="action-button edit-user-btn" onclick="editUser(${user.id})" title="Editar Usuário">
                    <i class="bi bi-plus-square"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ✅ CORREÇÃO: Função para preencher formulário com dados do usuário para edição
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
                submitBtn.textContent = 'ATUALIZAR';
            }
            
            console.log('✅ Formulário preenchido para edição do usuário:', user.nome);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do usuário');
    }
}

// ✅ CORREÇÃO: Função saveUser adaptada para formulário na página
async function saveUser() {
    console.log('💾 Tentando salvar usuário...');

    try {
        // ✅ OBTER ELEMENTOS DO FORMULÁRIO NA PÁGINA
        const userName = document.getElementById('userName');
        const userSector = document.getElementById('userSector');
        const userRole = document.getElementById('userRole');
        const userCPF = document.getElementById('userCPF');
        const userForm = document.getElementById('userForm');

        if (!userName || !userSector || !userRole || !userCPF) {
            throw new Error('Elementos do formulário de usuário não encontrados');
        }

        // Verificar se é edição ou criação
        const editingId = userForm.getAttribute('data-editing-id');
        const userData = {
            nome: userName.value,
            setor: userSector.value,
            cargo: userRole.value,
            cpf: userCPF.value,
            status: true // Sempre ativo ao criar/editar
        };

        console.log('📤 Dados do usuário para salvar:', userData);

        // ✅ VALIDAÇÃO BÁSICA
        if (!userData.nome || !userData.cargo || !userData.cpf) {
            throw new Error('Preencha todos os campos obrigatórios: Nome, Cargo e CPF');
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
            // ✅ LIMPAR FORMULÁRIO E RECARREGAR DADOS
            userForm.reset();
            userForm.removeAttribute('data-editing-id');
            
            // Restaurar texto do botão
            const submitBtn = document.querySelector('#userForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'SALVAR';
            }
            
            await loadUsers();
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

// ========== GERENCIAMENTO DE TIMES ==========

async function loadTimes() {
    try {
        const response = await fetch('http://localhost:3000/times');
        const result = await response.json();
        
        if (result.success) {
            displayTimes(result.data);
        } else {
            alert('❌ Erro ao carregar times: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function displayTimes(times) {
    const teamsTableBody = document.getElementById('teamsTableBody');
    if (!teamsTableBody) return;

    teamsTableBody.innerHTML = times.map(time => `
        <tr data-id="${time.id}">
            <td>${time.nome}</td>
            <td>${time.gestorId ? `ID: ${time.gestorId}` : 'Sem gestor'}</td>
            <td>
                <button class="action-button status-team-btn" onclick="toggleTeamStatus(${time.id})" title="Inativar Time">
                    <i class="bi bi-unlock-fill"></i>
                </button>
            </td>
            <td>
                <button class="action-button edit-team-btn" onclick="editTeam(${time.id})" title="Editar Time">
                    <i class="bi bi-plus-square"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ✅ CORREÇÃO: Função para preencher formulário de time para edição
async function editTeam(teamId) {
    try {
        const response = await fetch(`http://localhost:3000/times/${teamId}`);
        const result = await response.json();
        
        if (result.success) {
            const team = result.data;
            
            // Preencher formulário com dados do time
            document.getElementById('teamName').value = team.nome;
            document.getElementById('teamManager').value = team.gestorId || '';
            
            // Adicionar ID do time como data attribute no formulário
            document.getElementById('teamForm').setAttribute('data-editing-id', teamId);
            
            // Mudar texto do botão para indicar edição
            const submitBtn = document.querySelector('#teamForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'ATUALIZAR';
            }
            
            console.log('✅ Formulário preenchido para edição do time:', team.nome);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao carregar dados do time');
    }
}

// ✅ CORREÇÃO: Função saveTeam adaptada para formulário na página
async function saveTeam() {
    console.log('💾 Tentando salvar time...');

    try {
        // ✅ OBTER ELEMENTOS DO FORMULÁRIO NA PÁGINA
        const teamName = document.getElementById('teamName');
        const teamManager = document.getElementById('teamManager');
        const teamForm = document.getElementById('teamForm');

        if (!teamName || !teamManager) {
            throw new Error('Elementos do formulário de time não encontrados');
        }

        // Verificar se é edição ou criação
        const editingId = teamForm.getAttribute('data-editing-id');
        const teamData = {
            nome: teamName.value,
            gestorId: teamManager.value || null
        };

        // ✅ VALIDAÇÃO BÁSICA
        if (!teamData.nome) {
            throw new Error('Preencha o nome do time');
        }

        const url = editingId ? `http://localhost:3000/times/${editingId}` : 'http://localhost:3000/times';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamData)
        });

        const result = await response.json();

        if (result.success) {
            // ✅ LIMPAR FORMULÁRIO E RECARREGAR DADOS
            teamForm.reset();
            teamForm.removeAttribute('data-editing-id');
            
            // Restaurar texto do botão
            const submitBtn = document.querySelector('#teamForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'SALVAR';
            }
            
            loadTimes();
            showAlert('✅ Time salvo com sucesso!', 'success');
            console.log('✅ Time salvo com sucesso:', result.data);
        } else {
            throw new Error(result.error || 'Erro desconhecido ao salvar time');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar time:', error);
        alert('❌ Erro ao salvar time: ' + error.message);
    }
}

async function toggleTeamStatus(teamId) {
    if (!confirm('Tem certeza que deseja inativar este time?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/times/${teamId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            loadTimes();
            showAlert('✅ Time inativado com sucesso!', 'success');
        } else {
            alert('❌ Erro ao inativar time: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao inativar time');
    }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

function showAlert(message, type) {
    // Criar alerta Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ✅ CORREÇÃO: Adicionar função para limpar formulários
function clearForms() {
    const userForm = document.getElementById('userForm');
    const teamForm = document.getElementById('teamForm');
    
    if (userForm) {
        userForm.reset();
        userForm.removeAttribute('data-editing-id');
        const userBtn = userForm.querySelector('button[type="submit"]');
        if (userBtn) userBtn.textContent = 'SALVAR';
    }
    
    if (teamForm) {
        teamForm.reset();
        teamForm.removeAttribute('data-editing-id');
        const teamBtn = teamForm.querySelector('button[type="submit"]');
        if (teamBtn) teamBtn.textContent = 'SALVAR';
    }
}

// ✅ CORREÇÃO: Adicionar botões de limpar formulários (opcional)
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar botão de limpar ao formulário de usuário
    const userForm = document.getElementById('userForm');
    if (userForm) {
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn btn-secondary ms-2';
        clearBtn.textContent = 'LIMPAR';
        clearBtn.onclick = function() {
            userForm.reset();
            userForm.removeAttribute('data-editing-id');
            const submitBtn = userForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'SALVAR';
        };
        
        const buttonContainer = userForm.querySelector('.text-center');
        if (buttonContainer) {
            buttonContainer.appendChild(clearBtn);
        }
    }

    // Adicionar botão de limpar ao formulário de time
    const teamForm = document.getElementById('teamForm');
    if (teamForm) {
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn btn-secondary ms-2';
        clearBtn.textContent = 'LIMPAR';
        clearBtn.onclick = function() {
            teamForm.reset();
            teamForm.removeAttribute('data-editing-id');
            const submitBtn = teamForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'SALVAR';
        };
        
        const buttonContainer = teamForm.querySelector('.text-center');
        if (buttonContainer) {
            buttonContainer.appendChild(clearBtn);
        }
    }
});