// Aguarda o DOM ser completamente carregado
document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DA PÁGINA DE ADMINISTRAÇÃO (admin.html) ---

    const formCadUsuario = document.getElementById('form-cad-usuario');
    const formCadTime = document.getElementById('form-cad-time');
    const tableUsuarios = document.getElementById('table-usuarios')?.querySelector('tbody');
    const tableTimes = document.getElementById('table-times')?.querySelector('tbody');

    // Requisito 8: Cadastrar Usuário
    if (formCadUsuario) {
        formCadUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('usuario-nome').value;
            const setor = document.getElementById('usuario-setor').value;
            const cargo = document.getElementById('usuario-cargo').value;
            const cpf = document.getElementById('usuario-cpf').value;

            // Simula adição à tabela
            const newRow = tableUsuarios.insertRow();
            newRow.innerHTML = `
                <td>${nome}</td>
                <td>${setor}</td>
                <td>${cargo}</td>
                <td class="text-center">
                    <button class="btn-icon btn-status" data-status="ativo" aria-label="Inativar">
                        <i class="bi bi-unlock-fill"></i>
                    </button>
                </td>
                <td>******</td>
                <td class="text-center">
                    <button class="btn-icon btn-edit-user" aria-label="Editar">
                        <i class="bi bi-plus-square-fill"></i>
                    </button>
                </td>
            `;
            alert('Usuário cadastrado com sucesso!');
            this.reset();
            addEventListenersToTableButtons(); // Reatribui eventos aos novos botões
        });
    }

    // Requisito 9: Cadastrar Time
    if (formCadTime) {
        formCadTime.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('time-nome').value;
            const gestor = document.getElementById('time-gestor').value;

            // Simula adição à tabela
            const newRow = tableTimes.insertRow();
            newRow.innerHTML = `
                <td>${nome}</td>
                <td>${gestor}</td>
                <td class="text-center">
                    <button class="btn-icon btn-status" data-status="ativo" aria-label="Inativar">
                        <i class="bi bi-unlock-fill"></i>
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn-icon btn-edit-time" aria-label="Editar">
                        <i class="bi bi-plus-square-fill"></i>
                    </button>
                </td>
            `;
            alert('Time cadastrado com sucesso!');
            this.reset();
            addEventListenersToTableButtons(); // Reatribui eventos aos novos botões
        });
    }

    // Requisitos 10 e 11: Funções de Editar e Mudar Status
    function handleStatusClick(e) {
        const button = e.currentTarget;
        const icon = button.querySelector('i');
        const currentStatus = button.getAttribute('data-status');

        if (currentStatus === 'ativo') {
            button.setAttribute('data-status', 'inativo');
            button.setAttribute('aria-label', 'Reativar');
            icon.classList.remove('bi-unlock-fill');
            icon.classList.add('bi-lock-fill');
            alert('Item inativado.');
        } else {
            button.setAttribute('data-status', 'ativo');
            button.setAttribute('aria-label', 'Inativar');
            icon.classList.remove('bi-lock-fill');
            icon.classList.add('bi-unlock-fill');
            alert('Item reativado.');
        }
    }

    function handleEditUserClick(e) {
        const row = e.currentTarget.closest('tr');
        const nome = row.cells[0].textContent;
        alert(`Simulando edição do usuário: ${nome}. \nEm um app real, abriria um pop-up ou levaria a outra página.`);
    }

    function handleEditTimeClick(e) {
        const row = e.currentTarget.closest('tr');
        const nome = row.cells[0].textContent;
        alert(`Simulando edição do time: ${nome}.`);
    }

    // Função para adicionar eventos aos botões das tabelas
    function addEventListenersToTableButtons() {
        document.querySelectorAll('.btn-status').forEach(btn => btn.addEventListener('click', handleStatusClick));
        document.querySelectorAll('.btn-edit-user').forEach(btn => btn.addEventListener('click', handleEditUserClick));
        document.querySelectorAll('.btn-edit-time').forEach(btn => btn.addEventListener('click', handleEditTimeClick));
    }
    
    // Adiciona os eventos quando a página carrega pela primeira vez
    addEventListenersToTableButtons();

    // ... (manter o código JS das outras páginas, se estiver no mesmo arquivo)
});