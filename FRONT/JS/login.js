// ✅ SISTEMA DE LOGIN MELHORADO - CPF COMO SENHA
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value;

  // Validações básicas
  if (!nome) {
      alert('Por favor, preencha seu nome completo');
      return;
  }

  if (!cpf) {
      alert('Por favor, preencha seu CPF');
      return;
  }

  // Limpar CPF (remover pontos e traços)
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Validação simples de CPF
  if (cpfLimpo.length < 11) {
      alert('CPF deve ter pelo menos 11 números');
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
              cpf: cpfLimpo 
          }),
      });

      const result = await response.json();
      
      if (result.success) {
          // ✅ Salvar dados do usuário no localStorage
          localStorage.setItem('user', JSON.stringify(result.data));
          
          // ✅ Redirecionar baseado no cargo
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

// ✅ MASCARAR CPF NO INPUT (OPCIONAL)
document.getElementById('cpf').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  e.target.value = value;
});

// ✅ VERIFICAR SE JÁ ESTÁ LOGADO
document.addEventListener('DOMContentLoaded', function() {
  const userData = localStorage.getItem('user');
  if (userData) {
      const user = JSON.parse(userData);
      // Preencher automaticamente o nome se já estiver logado
      document.getElementById('nome').value = user.nome || '';
  }
});