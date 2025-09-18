        // --- Lógica para o botão Editar/Salvar ---

        // 1. Inicializa os tooltips do Bootstrap
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

        // 2. Seleciona os elementos que vamos manipular
        const editSaveBtn = document.getElementById('edit-save-btn');
        const editableField = document.querySelector('.editable-field');
        const btnIcon = editSaveBtn.querySelector('i');
        const btnTooltip = bootstrap.Tooltip.getInstance(editSaveBtn);

        // 3. Adiciona o evento de clique ao botão
        editSaveBtn.addEventListener('click', () => {
            const isReadOnly = editableField.hasAttribute('readonly');

            if (isReadOnly) {
                // MODO EDIÇÃO: Se o campo está bloqueado, libera para editar
                
                editableField.removeAttribute('readonly');
                editableField.classList.add('editing'); // Adiciona classe para feedback visual
                editableField.focus(); // Foca no campo para o usuário digitar
                
                // Altera o ícone para "Salvar" (check)
                btnIcon.classList.remove('bi-box-arrow-up');
                btnIcon.classList.add('bi-check-lg');
                
                // Atualiza o tooltip
                btnTooltip.setContent({ '.tooltip-inner': 'Salvar Alterações' });
                
            } else {
                // MODO SALVAR: Se o campo está editável, salva e bloqueia
                
                editableField.setAttribute('readonly', true);
                editableField.classList.remove('editing');
                
                // Altera o ícone de volta para "Enviar/Editar"
                btnIcon.classList.remove('bi-check-lg');
                btnIcon.classList.add('bi-box-arrow-up');

                // Atualiza o tooltip
                btnTooltip.setContent({ '.tooltip-inner': 'Habilitar Edição' });

                // Simulação: Aqui você enviaria o dado para o backend
                console.log('Valor salvo:', editableField.value);
                alert('Retorno salvo com sucesso!');
            }
        });