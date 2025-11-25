const express = require("express");

module.exports = (User) => {
  const router = express.Router();

  // ✅ FUNÇÃO: Validar CPF CORRIGIDA
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    // Verificar tamanho
    if (cpf.length !== 11) {
      return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) {
      return false;
    }
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    return digito2 === parseInt(cpf.charAt(10));
  }

  // ✅ Rota de login
  router.post("/login", async (req, res) => {
    try {
      const { nome, senha } = req.body;
      
      if (!nome || !senha) {
        return res.status(400).json({ success: false, error: "Nome e senha são obrigatórios" });
      }

      const user = await User.findOne({ 
        where: { 
          nome: nome.trim()
        } 
      });
      
      if (!user) {
        return res.status(401).json({ success: false, error: "Usuário não encontrado" });
      }

      // Verificar senha
      if (user.senha !== senha) {
        return res.status(401).json({ success: false, error: "Senha incorreta" });
      }

      if (!user.status) {
        return res.status(403).json({ success: false, error: "Usuário inativo" });
      }

      res.json({ 
        success: true, 
        data: {
          id: user.id,
          nome: user.nome,
          cargo: user.cargo,
          setor: user.setor
        }
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ success: false, error: "Erro no servidor" });
    }
  });

  // ✅ Rota: criar usuário COM VALIDAÇÃO DE CPF ÚNICO
  router.post("/", async (req, res) => {
    try {
      const { nome, cpf, cargo, setor, senha } = req.body;
      
      if (!nome || !cpf || !cargo) {
        return res.status(400).json({ 
          success: false, 
          error: "Campos obrigatórios: nome, CPF e cargo" 
        });
      }

      // ✅ VALIDAR CPF - CORRIGIDO
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (!validarCPF(cpfLimpo)) {
        return res.status(400).json({ 
          success: false, 
          error: "CPF inválido" 
        });
      }

      // ✅ VERIFICAR SE CPF JÁ EXISTE (CADASTRO)
      const cpfExistente = await User.findOne({
        where: { cpf: cpfLimpo }
      });

      if (cpfExistente) {
        return res.status(400).json({ 
          success: false, 
          error: "CPF já cadastrado no sistema" 
        });
      }

      // Se senha for fornecida, validar
      let senhaFinal = '123456'; // Senha padrão
      
      if (senha) {
        if (senha.length < 5) {
          return res.status(400).json({ 
            success: false, 
            error: "Senha deve ter no mínimo 5 caracteres" 
          });
        }

        const temLetra = /[a-zA-Z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        
        if (!temLetra || !temNumero) {
          return res.status(400).json({ 
            success: false, 
            error: "Senha deve conter letras e números" 
          });
        }
        senhaFinal = senha;
      }

      const novoUser = await User.create({
        nome: nome.trim(),
        cpf: cpfLimpo, // Salvar CPF limpo
        cargo,
        setor: setor || 'Geral',
        senha: senhaFinal,
        status: true
      });

      // Retornar dados sem a senha
      const userSemSenha = {
        id: novoUser.id,
        nome: novoUser.nome,
        cpf: novoUser.cpf,
        cargo: novoUser.cargo,
        setor: novoUser.setor,
        status: novoUser.status
      };
      
      const mensagem = senha ? 
        "Usuário criado com sucesso!" :
        "Usuário criado com sucesso! Senha padrão: 123456";
      
      res.status(201).json({ 
        success: true, 
        data: userSemSenha,
        message: mensagem
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          success: false, 
          error: "CPF já cadastrado no sistema" 
        });
      }
      console.error('Erro ao criar usuário:', err);
      res.status(400).json({ 
        success: false, 
        error: "Erro ao criar usuário", 
        details: err.message 
      });
    }
  });

  // ✅ Rota: atualizar usuário COM VALIDAÇÃO DE CPF ÚNICO
  router.put("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      // ✅ VALIDAR CPF SE ESTIVER SENDO ATUALIZADO
      if (req.body.cpf) {
        const cpfLimpo = req.body.cpf.replace(/\D/g, '');
        if (!validarCPF(cpfLimpo)) {
          return res.status(400).json({ 
            success: false, 
            error: "CPF inválido" 
          });
        }

        // ✅ VERIFICAR SE CPF JÁ EXISTE (EDIÇÃO - EXCLUINDO O PRÓPRIO USUÁRIO)
        const cpfExistente = await User.findOne({
          where: { 
            cpf: cpfLimpo,
            id: { [require('sequelize').Op.ne]: req.params.id } // Excluir o próprio usuário da verificação
          }
        });

        if (cpfExistente) {
          return res.status(400).json({ 
            success: false, 
            error: "CPF já cadastrado no sistema" 
          });
        }

        req.body.cpf = cpfLimpo;
      }
      
      // ✅ SENHA NÃO É OBRIGATÓRIA NA EDIÇÃO - APENAS SE FOR FORNECIDA
      if (req.body.senha && req.body.senha.trim() !== '') {
        if (req.body.senha.length < 5) {
          return res.status(400).json({ 
            success: false, 
            error: "Senha deve ter no mínimo 5 caracteres" 
          });
        }

        const temLetra = /[a-zA-Z]/.test(req.body.senha);
        const temNumero = /[0-9]/.test(req.body.senha);
        
        if (!temLetra || !temNumero) {
          return res.status(400).json({ 
            success: false, 
            error: "Senha deve conter letras e números" 
          });
        }
      } else {
        // ❌ REMOVER SENHA DO UPDATE SE ESTIVER VAZIA (não atualizar senha)
        delete req.body.senha;
      }
      
      await user.update(req.body);

      // Retornar dados sem a senha
      const userSemSenha = {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf,
        cargo: user.cargo,
        setor: user.setor,
        status: user.status
      };
      
      res.json({ 
        success: true, 
        data: userSemSenha,
        message: "Usuário atualizado com sucesso!" 
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          success: false, 
          error: "CPF já cadastrado no sistema" 
        });
      }
      console.error('Erro ao atualizar usuário:', err);
      res.status(400).json({ success: false, error: "Erro ao atualizar usuário", details: err.message });
    }
  });

  // ✅ Rota: listar todos os usuários (SEM SENHA)
  router.get("/", async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome', 'setor', 'cargo', 'status', 'cpf', 'createdAt'],
        order: [['nome', 'ASC']]
      });
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar usuários" });
    }
  });

  // ✅ Rota: buscar usuário por ID (SEM SENHA)
  router.get("/:id", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      // Retornar sem senha
      const userSemSenha = {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf,
        cargo: user.cargo,
        setor: user.setor,
        status: user.status,
        createdAt: user.createdAt
      };
      
      res.json({ success: true, data: userSemSenha });
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao buscar usuário" });
    }
  });

  // ✅ Rota: inativar usuário
  router.patch("/:id/inativar", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      await user.update({ status: false });
      
      res.json({ 
        success: true, 
        message: "Usuário inativado com sucesso!",
        data: {
          id: user.id,
          nome: user.nome,
          status: user.status
        }
      });
    } catch (err) {
      console.error('Erro ao inativar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao inativar usuário" });
    }
  });

  // ✅ Rota: reativar usuário
  router.patch("/:id/reativar", async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      
      await user.update({ status: true });
      
      res.json({ 
        success: true, 
        message: "Usuário reativado com sucesso!",
        data: {
          id: user.id,
          nome: user.nome,
          status: user.status
        }
      });
    } catch (err) {
      console.error('Erro ao reativar usuário:', err);
      res.status(500).json({ success: false, error: "Erro ao reativar usuário" });
    }
  });

  return router;
};