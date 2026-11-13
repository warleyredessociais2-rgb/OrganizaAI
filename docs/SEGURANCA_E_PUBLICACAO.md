# Segurança e publicação — checklist antes do deploy

Este documento lista pendências para publicação da versão atual do OrganizaAI. **Não publique a aplicação em produção antes de concluir os itens críticos.**

## Credenciais

- [ ] Revogar e substituir **todas** as senhas do PostgreSQL e chaves `SESSION_SECRET` que tenham aparecido em capturas, logs ou outras divulgações.
- [ ] Verificar que nenhuma credencial foi incluída em commits, arquivos rastreados ou configurações públicas.
- [ ] Manter `.env` somente no computador; usar os segredos privados do provedor de hospedagem para o deploy.
- [ ] Manter `DATABASE_URL` e `TEST_DATABASE_URL` em bancos distintos. Não executar comandos de migração ou testes com escrita no banco principal sem backup.

## Banco e rede

- [x] Remover `ssl.rejectUnauthorized: false` do código. A aplicação agora exige validação do certificado TLS do PostgreSQL.
- [ ] Validar a conexão real dos dois bancos após essa mudança. Se a CA não for reconhecida, baixar o certificado oficial do projeto no Supabase e definir `DB_SSL_CA_PATH` no `.env` local; não desativar a validação.
- [ ] Confirmar a cadeia de certificados e a forma correta de estabelecer TLS com o PostgreSQL hospedado.
- [ ] Criar e testar política de backups e restauração de dados.
- [ ] Usar usuário de banco e permissões adequados, sem credenciais administrativas desnecessárias.

## HTTP, sessões e autenticação

- [ ] Publicar apenas com HTTPS.
- [ ] Confirmar `NODE_ENV=production`: atualmente ativa `cookie.secure`.
- [ ] Se a hospedagem usar proxy reverso, configurar `trust proxy` **somente para o proxy confiável**, para que cookies seguros funcionem. Não habilitar confiança indiscriminada.
- [ ] Revisar proteção CSRF/origem das requisições mutáveis e a política de cookies.
- [ ] Implementar limites de tentativas de login e cadastro com proteção compatível com múltiplas instâncias de servidor.
- [ ] Validar logout, expiração, renovação e revogação de sessão em produção.
- [ ] Revisar cabeçalhos HTTP adicionais, mensagens de erro e logs para não revelar dados sensíveis.

## Qualidade

- [x] Rotas sem sessão recusam leitura e exclusão de projetos (testes manuais em ambiente local).
- [x] `X-Powered-By` ocultado e corpo JSON limitado a 32 KB (testes manuais locais).
- [x] Testes locais, API e integração executados com êxito em banco separado, conforme validação manual de 13/11/2026.
- [ ] Repetir `npm ci`, `npm test` e `npm audit` em ambiente limpo após alterações finais.
- [ ] Validar acessibilidade, navegação por teclado, layout móvel e fluxos completos no navegador.
- [ ] Verificar status da automação GitHub Actions na revisão final.
- [ ] Fazer teste de instalação do zero e de recuperação de falhas.

## Implantação

- [ ] Selecionar hospedagem compatível com aplicação Node.js persistente e conexões PostgreSQL.
- [ ] Definir domínio, ambiente e variáveis de produção, sem incluir `TEST_DATABASE_URL` na produção.
- [ ] Testar inicialização, sessão, CRUD, exclusões, registros e backup após deploy.
- [ ] Criar release estável somente após critérios de aceite cumpridos.

## Escopo de versão

Esta checklist cobre a versão atual de **projetos e tarefas**. Documentos, React, Go, RAG, agentes e MCP continuam como desenvolvimento posterior do projeto original.
