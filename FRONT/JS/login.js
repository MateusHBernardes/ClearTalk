// Adicione este script no seu login.html
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
  
    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, cpf }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.data));
        // Redireciona baseado no cargo
        switch(result.data.cargo) {
          case 'admin':
            window.location.href = 'telaAdmin.html';
            break;
          case 'gestor':
            window.location.href = 'telaGestor.html';
            break;
          default:
            window.location.href = 'telaFuncionario.html';
        }
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão com o servidor');
    }
  });