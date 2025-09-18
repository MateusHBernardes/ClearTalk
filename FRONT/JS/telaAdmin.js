document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const teamForm = document.getElementById('teamForm');
    const usersTableBody = document.getElementById('usersTableBody');
    const teamsTableBody = document.getElementById('teamsTableBody');

    // --- LÓGICA PARA USUÁRIOS ---

    // Salvar (Criar ou Editar) Usuário
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulação de salvamento
        alert('Usuário salvo com sucesso!');
        userForm.reset();
    });

    // Ações na Tabela de Usuários (Editar e Status)
    usersTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        // Editar Usuário
        if (button.classList.contains('edit-user-btn')) {
            const row = button.closest('tr');
            const nome = row.cells[0].textContent;
            // Lógica para carregar os dados no formulário
            document.getElementById('userName').value = nome;
            document.getElementById('userSector').value = row.cells[1].textContent;
            document.getElementById('userRole').value = row.cells[2].textContent;
            document.getElementById('userCPF').value = "CPF Carregado"; // Evitar expor CPF real
            
            alert(`Dados de '${nome}' carregados para edição.`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Mudar Status do Usuário
        if (button.classList.contains('status-user-btn')) {
            const icon = button.querySelector('i');
            if (icon.classList.contains('bi-unlock-fill')) {
                icon.classList.remove('bi-unlock-fill');
                icon.classList.add('bi-lock-fill');
                alert('Usuário inativado.');
            } else {
                icon.classList.remove('bi-lock-fill');
                icon.classList.add('bi-unlock-fill');
                alert('Usuário reativado.');
            }
        }
    });

    // --- LÓGICA PARA TIMES ---

    // Salvar (Criar ou Editar) Time
    teamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Time salvo com sucesso!');
        teamForm.reset();
    });

    // Ações na Tabela de Times (Editar e Status)
    teamsTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        // Editar Time
        if (button.classList.contains('edit-team-btn')) {
            const row = button.closest('tr');
            const nome = row.cells[0].textContent;
            document.getElementById('teamName').value = nome;
            document.getElementById('teamManager').value = row.cells[1].textContent;
            
            alert(`Dados do time '${nome}' carregados para edição.`);
             window.scrollTo({ top: document.getElementById('teamForm').offsetTop - 20, behavior: 'smooth' });
        }

        // Mudar Status do Time
        if (button.classList.contains('status-team-btn')) {
            const icon = button.querySelector('i');
            if (icon.classList.contains('bi-unlock-fill')) {
                icon.classList.remove('bi-unlock-fill');
                icon.classList.add('bi-lock-fill');
                alert('Time inativado.');
            } else {
                icon.classList.remove('bi-lock-fill');
                icon.classList.add('bi-unlock-fill');
                alert('Time reativado.');
            }
        }
    });
});