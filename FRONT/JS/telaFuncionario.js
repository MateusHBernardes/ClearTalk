document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões com a classe .btn-edit-save
    const editButtons = document.querySelectorAll('.btn-edit-save');

    // Adiciona um evento de clique para cada botão
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Encontra a linha (tr) e a célula (td) onde o botão está
            const row = this.closest('tr');
            const editableCell = row.querySelector('.editable-cell');
            const textSpan = editableCell.querySelector('.cell-text');
            const inputField = editableCell.querySelector('.cell-input');
            const icon = this.querySelector('i');

            // Verifica se a linha está no modo de edição
            const isEditing = row.classList.contains('editing');

            if (isEditing) {
                // --- MODO SALVAR ---
                // 1. Pega o novo valor do input
                const newValue = inputField.value;

                // 2. Atualiza o texto do span
                textSpan.textContent = newValue;
                
                // --- Em uma aplicação real, aqui você enviaria 'newValue' para o backend/banco de dados ---
                console.log('Salvando dados:', newValue);
                alert('Dados salvos com sucesso!');
                // --- Fim da chamada ao backend ---

                // 3. Alterna a visibilidade dos elementos
                inputField.style.display = 'none';
                textSpan.style.display = 'inline';

                // 4. Muda o ícone de volta para "editar" (upload)
                icon.classList.remove('bi-check-lg');
                icon.classList.add('bi-upload');

                // 5. Remove a classe de controle 'editing'
                row.classList.remove('editing');
            } else {
                // --- MODO EDITAR ---
                // 1. Alterna a visibilidade
                textSpan.style.display = 'none';
                inputField.style.display = 'block';
                inputField.focus(); // Foca no campo para digitação imediata

                // 2. Muda o ícone para "salvar" (check)
                icon.classList.remove('bi-upload');
                icon.classList.add('bi-check-lg');

                // 3. Adiciona uma classe para sabermos que estamos em modo de edição
                row.classList.add('editing');
            }
        });
    });
});