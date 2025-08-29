document.addEventListener('DOMContentLoaded', () => {

    // --- SIMULAÇÃO DE BANCO DE DADOS ---
    let usuarios = [
        { id: 1, nome: 'Fulano da Silva', setor: 'TI', cargo: 'Gestor', cpf: '111.111.111-11', status: 'ativo' },
        { id: 2, nome: 'Ciclana de Souza', setor: 'RH', cargo: 'Analista', cpf: '222.222.222-22', status: 'ativo' },
    ];

    let times = [
        { id: 101, nome: 'Time Alpha', gestorId: 1, status: 'ativo' }
    ];

    // --- SELETORES DE ELEMENTOS ---
    const formUsuario = document.getElementById('form-usuario');
    const formTime = document.getElementById('form-time');
    const tabelaUsuariosBody = document.getElementById('tabela-usuarios-body');
    const tabelaTimesBody = document.getElementById('tabela-times-body');
    const gestorSelect = document.getElementById('time-gestor');
    
    // --- MODAL ---
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const formEditUsuario = document.getElementById('form-edit-usuario');

    // --- FUNÇÕES AUXILIARES ---
    const mascararCPF = (cpf) => `***.${cpf.substring(4, 7)}.${cpf.substring(8, 11)}-**`;

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderizarTabelaUsuarios() {
        tabelaUsuariosBody.innerHTML = '';
        usuarios.forEach(user => {
            const isAtivo = user.status === 'ativo';
            const statusIcon = isAtivo ? 'fa-lock-open' : 'fa-lock';
            const statusTitle = isAtivo ? 'Ativo (clique para inativar)' : 'Inativo (clique para reativar)';

            const linha = `
                <tr>
                    <td>${user.nome}</td>
                    <td>${user.setor}</td>
                    <td>${user.cargo}</td>
                    <td class="text-center">
                        <i class="fas ${statusIcon} action-icon" data-id="${user.id}" data-action="toggle-status" title="${statusTitle}"></i>
                    </td>
                    <td>${mascararCPF(user.cpf)}</td>
                    <td class="text-center">
                        <i class="fas fa-plus-square action-icon icon-edit" data-id="${user.id}" data-action="edit-user" title="Editar Usuário"></i>
                    </td>
                </tr>
            `;
            tabelaUsuariosBody.innerHTML += linha;
        });
    }

    function renderizarTabelaTimes() {
        tabelaTimesBody.innerHTML = '';
        times.forEach(time => {
            const gestor = usuarios.find(u => u.id === time.gestorId);
            const isAtivo = time.status === 'ativo';
            const statusIcon = isAtivo ? 'fa-lock-open' : 'fa-lock';
            const statusTitle = isAtivo ? 'Ativo (clique para inativar)' : 'Inativo (clique para reativar)';

            const linha = `
                <tr>
                    <td>${time.nome}</td>
                    <td>${gestor ? gestor.nome : 'N/A'}</td>
                    <td class="text-center">
                        <i class="fas ${statusIcon} action-icon" data-id="${time.id}" data-action="toggle-status" title="${statusTitle}"></i>
                    </td>
                    <td class="text-center">
                        <i class="fas fa-plus-square action-icon icon-edit" data-id="${time.id}" data-action="edit-time" title="Editar Time (não implementado)"></i>
                    </td>
                </tr>
            `;
            tabelaTimesBody.innerHTML += linha;
        });
    }

    function popularGestores() {
        // Guarda a opção "Selecione"
        const placeholder = gestorSelect.options[0];
        gestorSelect.innerHTML = '';
        gestorSelect.appendChild(placeholder); // Adiciona de volta

        const gestores = usuarios.filter(u => u.status === 'ativo'); // Apenas usuários ativos podem ser gestores
        gestores.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.nome;
            gestorSelect.appendChild(option);
        });
    }

    // --- LÓGICA DE CADASTRO ---

    formUsuario.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('user-nome').value.trim();
        const setor = document.getElementById('user-setor').value.trim();
        const cargo = document.getElementById('user-cargo').value.trim();
        const cpf = document.getElementById('user-cpf').value.trim();

        if (usuarios.some(u => u.cpf === cpf)) {
            alert('Erro: CPF já cadastrado no sistema.');
            return;
        }

        const novoUsuario = { id: Date.now(), nome, setor, cargo, cpf, status: 'ativo' };
        usuarios.push(novoUsuario);

        alert('Usuário cadastrado com sucesso!');
        formUsuario.reset();
        renderizarTabelaUsuarios();
        popularGestores(); // Atualiza a lista de gestores
    });

    formTime.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('time-nome').value.trim();
        const gestorId = parseInt(document.getElementById('time-gestor').value);

        if (!nome || !gestorId) {
            alert('Erro: Preencha todos os campos para cadastrar o time.');
            return;
        }

        const novoTime = { id: Date.now(), nome, gestorId, status: 'ativo' };
        times.push(novoTime);

        alert('Time cadastrado com sucesso!');
        formTime.reset();
        renderizarTabelaTimes();
    });

    // --- LÓGICA DE AÇÕES NAS TABELAS (EDIÇÃO E STATUS) ---

    tabelaUsuariosBody.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        const id = parseInt(target.dataset.id);

        if (action === 'toggle-status') {
            const user = usuarios.find(u => u.id === id);
            user.status = user.status === 'ativo' ? 'inativo' : 'ativo';
            renderizarTabelaUsuarios();
            popularGestores(); // Status do gestor pode ter mudado
        }

        if (action === 'edit-user') {
            const user = usuarios.find(u => u.id === id);
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-user-nome').value = user.nome;
            document.getElementById('edit-user-setor').value = user.setor;
            document.getElementById('edit-user-cargo').value = user.cargo;
            document.getElementById('edit-user-cpf').value = user.cpf;
            editUserModal.show();
        }
    });
    
    tabelaTimesBody.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        const id = parseInt(target.dataset.id);

        if (action === 'toggle-status') {
            const time = times.find(t => t.id === id);
            time.status = time.status === 'ativo' ? 'inativo' : 'ativo';
            renderizarTabelaTimes();
        }
        
        if (action === 'edit-time') {
            // A lógica de edição de time seria similar à de usuário (com um modal próprio)
            alert('Funcionalidade "Editar Time" a ser implementada.');
        }
    });

    // --- LÓGICA DE ATUALIZAÇÃO (MODAL) ---
    formEditUsuario.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-user-id').value);
        const nome = document.getElementById('edit-user-nome').value.trim();
        const setor = document.getElementById('edit-user-setor').value.trim();
        const cargo = document.getElementById('edit-user-cargo').value.trim();
        
        const userIndex = usuarios.findIndex(u => u.id === id);
        if(userIndex > -1) {
            usuarios[userIndex].nome = nome;
            usuarios[userIndex].setor = setor;
            usuarios[userIndex].cargo = cargo;
        }
        
        alert('Usuário atualizado com sucesso!');
        editUserModal.hide();
        renderizarTabelaUsuarios();
        popularGestores();
    });


    // --- INICIALIZAÇÃO ---
    function init() {
        renderizarTabelaUsuarios();
        renderizarTabelaTimes();
        popularGestores();
    }

    init();
}); 