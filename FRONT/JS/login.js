// ✅ SISTEMA DE LOGIN COM SENHA PERSONALIZADA
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const senha = document.getElementById('senha').value;

    if (!nome) {
        alert('Por favor, preencha seu nome');
        return;
    }

    if (!senha) {
        alert('Por favor, preencha sua senha');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nome: nome,
                senha: senha
            }),
        });

        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.data));
            
            switch(result.data.cargo) {
                case 'admin':
                    window.location.href = 'telaAdmin.html';
                    break;
                case 'gestor':
                    window.location.href = 'telaGestor.html';
                    break;
                case 'funcionario':
                    window.location.href = 'telaFuncionario.html';
                    break;
                default:
                    alert('Cargo não reconhecido');
                    window.location.href = 'login.html';
            }
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
});

// ✅ VERIFICAR SE JÁ ESTÁ LOGADO
document.addEventListener('DOMContentLoaded', function() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('nome').value = user.nome || '';
    }
});