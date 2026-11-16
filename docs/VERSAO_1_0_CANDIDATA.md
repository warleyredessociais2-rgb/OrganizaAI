# OrganizaAI — marco da versão 1.0 (candidata)

**Data de validação:** 16/11/2026  
**Escopo entregue:** gerenciamento pessoal de projetos e tarefas com autenticação, em Node.js/Express, PostgreSQL (Supabase) e interface HTML/CSS/JavaScript.  
**Endereço da implantação verificada:** https://organizaai-ukvh.onrender.com/app/  
**Estado:** primeira versão funcional, candidata à estabilização; **não** é certificação de segurança nem confirmação de produção madura.

## Funcionalidades verificadas

- [x] Disponibilidade HTTPS e `/health` com resposta `{"status":"ok"}`.
- [x] Login de usuário existente e carregamento de projetos e tarefas preexistentes.
- [x] Criação de projeto e tarefa temporários, conclusão e persistência após recarregar.
- [x] Edição de tarefa e persistência após recarregar.
- [x] Exclusão do projeto temporário, preservando os dados anteriores.
- [x] Formulário de cadastro público oculto com a opção de cadastro desativada no servidor.
- [x] Cookie de sessão conferido no navegador: `Secure`, `HttpOnly` e `SameSite=Lax`; sessão anteriormente exposta em captura encerrada por logout e novo login.
- [x] Arquivo `.env` não rastreado pelo Git e nenhum registro do caminho `.env` encontrado no histórico local consultado com `git log --all -- .env`.
- [x] GitHub Actions, workflow **Verificacoes seguras**, execução `43865051834`: 40 testes aprovados, 0 falhas, npm audit sem vulnerabilidades reportadas na data.
- [x] Backup `OrganizaAI-principal-20261116-090616.backup` (8.431 bytes) criado, catálogo validado e restaurado em PostgreSQL local descartável: 1 usuário, 1 projeto, 2 tarefas; servidor local encerrado.
- [x] Backup anterior de 13/11/2026 preservado.

## Pendências para declarar release estável

- [ ] Rever se algum segredo real (em outros arquivos, capturas ou logs) foi exposto; rotacionar credenciais que efetivamente tenham sido divulgadas, sem publicá-las.
- [ ] Validar os controles de sessão adicionais: revogação, expiração e comportamento de logout após reinício do serviço.
- [ ] Verificar defesas HTTP no domínio real, incluindo origem das requisições, cabeçalhos e CSP. Em 16/11/2026, CSP restrita e `Cache-Control: no-store` nas rotas privadas foram adicionados à branch `chore/bootstrap-database`; **aguardam testes de integração e publicação na Render**.
- [ ] Definir rotina de backups, retenção segura e periodicidade de teste de restauração; a cópia validada é pontual e manual.
- [ ] Revisar privilégios da conta PostgreSQL, limpeza de registros expirados de limitação de autenticação e considerações do proxy reverso.
- [ ] Testar usabilidade e acessibilidade em navegação por teclado e celular.
- [ ] Revisar alterações, decidir mesclagem na branch principal e publicar tag/release `v1.0.0` somente após aceite dos itens críticos.

## Limitações atuais

- Não há fluxo automatizado de recuperação de senha por e-mail; a redefinição atual é administrativa.
- O plano Free da Render pode suspender serviço ocioso, provocando demora no primeiro acesso.
- O sistema não inclui ainda módulos de documentos, RAG, agentes de IA ou MCP. Essas funcionalidades pertencem a fases futuras.

## Princípio de segurança

Não guardar `.env`, senha, URL com credenciais, cookie de sessão nem arquivo de backup no repositório ou em capturas públicas. Não executar restauração no banco principal.
