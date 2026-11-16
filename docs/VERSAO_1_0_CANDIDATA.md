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
- [x] Confirmar em 16/11/2026 que a versão online responde HTTP 200 e `{"status":"ok"}`, com CSP presente, `X-Content-Type-Options: nosniff` e `Cache-Control: no-store` na rota `/health` (comprovação pelo PowerShell).
- [x] Confirmar no domínio real acesso sem login HTTP 401, `Cache-Control: no-store` na rota privada e bloqueio de origem externa HTTP 403 (16/11/2026, terminal PowerShell).
- [ ] Auditar conteúdo da CSP, demais cabeçalhos e comportamento em diferentes navegadores; os resultados pontuais não comprovam segurança integral.
- [x] Rotina semanal ativada no Windows (domingos às 18h, usuário conectado): execução manual do Agendador em 16/11/2026 resultou em `LastTaskResult=0` e log `SUCESSO - novo backup e catalogo verificado`. Próxima execução exibida pelo Windows: 22/11/2026 às 18h.
- [ ] Verificar primeira execução natural do agendamento em 22/11/2026; o resultado de teste não garante funcionamento futuro.
- [ ] Proteger cópias: a pasta `Documentos/OneDrive/OrganizaAI-Backups` pode sincronizar arquivos `.backup` sem criptografia adicional com o OneDrive. Confirmar que não há compartilhamento da pasta, proteger a conta Microsoft com MFA e considerar uma cópia adicional criptografada independente.
- [ ] Estabelecer retenção **proposta**: manter 8 backups semanais recentes mais 3 cópias mensais fora dessa janela, com conferência mensal de restauração. **Não automatizar exclusão** antes de validar criptografia, retenção e recuperação.
- [x] Reduzir exposição em backups futuros: `pg_dump` mantém a definição da tabela `public.sessoes`, mas exclui seus dados; alteração atualizada no VS Code em 16/11/2026; falta validar com um backup gerado após a atualização. **Isso não altera nem sanitiza backups anteriores, que devem ser tratados como confidenciais.**
- [ ] Revisar privilégios da conta PostgreSQL, limpeza de registros expirados de limitação de autenticação e considerações do proxy reverso.
- [ ] Testar usabilidade e acessibilidade em navegação por teclado e celular.
- [ ] Revisar alterações, decidir mesclagem na branch principal e publicar tag/release `v1.0.0` somente após aceite dos itens críticos.

## Limitações atuais

- Não há fluxo automatizado de recuperação de senha por e-mail; a redefinição atual é administrativa.
- O plano Free da Render pode suspender serviço ocioso, provocando demora no primeiro acesso.
- O sistema não inclui ainda módulos de documentos, RAG, agentes de IA ou MCP. Essas funcionalidades pertencem a fases futuras.

## Princípio de segurança

Não guardar `.env`, senha, URL com credenciais, cookie de sessão nem arquivo de backup no repositório ou em capturas públicas. Não executar restauração no banco principal.
