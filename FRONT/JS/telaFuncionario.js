document.addEventListener('DOMContentLoaded', function() {

    // Requisito: Sair do sistema
    const logoutButton = document.getElementById('logoutBtn');
    logoutButton.addEventListener('click', function() {
        alert('Você saiu do sistema. Redirecionando para a tela de login.');
        window.location.href = 'login.html'; 
    });

    // Requisito: Editar e Salvar Campo (apenas para o Retorno)
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const fieldId = this.getAttribute('data-field-id');
            const spanElement = document.getElementById(fieldId + '-value');
            const isEditing = spanElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (!isEditing) {
                // Modo de Edição
                const currentValue = spanElement.textContent;
                const inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = currentValue;
                inputElement.classList.add('editable-field');
                spanElement.innerHTML = '';
                spanElement.appendChild(inputElement);
                inputElement.focus();
                icon.classList.remove('bi-pencil-square');
                icon.classList.add('bi-floppy'); // Muda o ícone para Salvar
                this.title = 'Salvar'; // Muda o título do botão
            } else {
                // Modo de Salvar
                const newValue = isEditing.value;
                
                if (newValue.trim() === '') {
                    alert('O campo não pode ser vazio!');
                    isEditing.focus();
                    return;
                }

                spanElement.textContent = newValue;
                icon.classList.remove('bi-floppy');
                icon.classList.add('bi-pencil-square');
                this.title = 'Editar Retorno';
                
                console.log(`Dados salvos para o campo ${fieldId}: ${newValue}`);
                alert(`Alterações salvas com sucesso para o campo Retorno!`);
            }
        });
    });
});