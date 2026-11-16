# Segurança e publicação — checklist de estabilização da versão 1.0

Este documento acompanha a estabilização da versão de projetos e tarefas, publicada em HTTPS na Render em 16/11/2026. **A publicação e os testes funcionais não substituem a revisão das pendências de segurança restantes.**

## Credenciais

- [ ] Revogar e substituir **todas** as senhas do PostgreSQL e chaves `SESSION_SECRET` que tenham aparecido em capturas, logs ou outras divulgações.
- [ ] Verificar que nenhuma credencial foi incluída em commits, arquivos rastreados ou configurações públicas.
- [ ] Manter `.env` somente no computador; usar os segredos privados do provedor de hospedagem para o deploy.
- [ ] Manter `DATABASE_URL` e `TEST_DATABASE_URL` em bancos distintos. Não executar comandos de migração ou testes com escrita no banco principal sem backup.

## Banco e rede

- [x] Remover `ssl.rejectUnauthorized: false` do código. A aplicação agora exige validação do certificado TLS do PostgreSQL.
- [ ] Validar a conexão real dos dois bancos após essa mudança. Se a CA não for reconhecida, baixar o certificado oficial do projeto no Supabase e definir `DB_SSL_CA_PATH` no `.env` local; não desativar a validação.
- [ ] Confirmar a cadeia de certificados e a forma correta de estabelecer TLS com o PostgreSQL hospedado.
- [x] Criar e restaurar backup do esquema `public`: o backup de 16/11/2026 (8.431 bytes) foi restaurado com sucesso em PostgreSQL local temporario (1 usuario, 1 projeto, 2 tarefas); a instancia foi encerrada. O backup de 13/11 foi preservado.
- [ ] Definir frequencia, retencao, copias protegidas e testes periodicos dos backups; o backup pontual validado nao e uma rotina automatizada.
- [ ] Usar usuário de banco e permissões adequados, sem credenciais administrativas desnecessárias.

## HTTP, sessões e autenticação

- [x] Publicar a interface apenas no endereço público HTTPS do Render (`https://organizaai-ukvh.onrender.com/app/`).
- [ ] Confirmar `NODE_ENV=production`: atualmente ativa `cookie.secure`.
- [x] O código permite configurar `TRUST_PROXY_HOPS` explicitamente e mantém a confiança em proxies desabilitada por padrão.
- [ ] Se a hospedagem usar proxy reverso, configurar `TRUST_PROXY_HOPS` de acordo com sua topologia real; confirmar que o proxy sobrescreve os cabeçalhos `X-Forwarded-*`, sem permitir acesso direto não confiável ao Node.js.
- [x] Validar `Origin`, `Referer` e `Sec-Fetch-Site` para requisições mutáveis; em produção, recusar requisições sem prova de origem.
- [x] Permitir usar `RENDER_EXTERNAL_URL` como origem HTTPS inicial no Render; `APP_ORIGIN` permanece configuravel para dominio proprio.
- [x] Bloquear cadastro publico por padrao em producao, preservando login de contas existentes.
- [x] Disponibilizar `GET /health` com consulta de leitura ao PostgreSQL e respostas 200/503 sem detalhes internos.
- [ ] Validar cookies, origem, logout, expiração e sessão no domínio real. Login, consulta e CRUD foram testados manualmente em 16/11/2026; cadastro bloqueado e oculto na interface foi confirmado, mas verificações independentes de origem/cookies ainda pendem.
- [ ] Revisar a política de cookies e acrescentar medidas de defesa em profundidade (por exemplo, tokens CSRF) conforme a arquitetura de produção.
- [x] Implementar limitacao de tentativas de login e cadastro no codigo, com contadores atomicos no PostgreSQL, hashes HMAC de IP/e-mail, HTTP 429 e Retry-After.
- [ ] Aplicar `migrations/002_limites_autenticacao.sql` nos bancos principal e de testes, confirmar HTTP 429 e conexoes reais. **Nao publicar antes de aplicar a migracao.**
- [ ] Programar limpeza periodica de registros expirados em `organizaai_interno.limites_autenticacao` e revisar impacto de bloqueio temporario de contas/ips compartilhados.
- [ ] Validar logout, expiração, renovação e revogação de sessão em produção.
- [x] Configurar os cabeçalhos básicos `X-Content-Type-Options`, `Referrer-Policy` e `X-Frame-Options`.
- [ ] Revisar outros cabeçalhos HTTP (incluindo CSP), mensagens de erro e logs para não revelar dados sensíveis.

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
- [x] Testar `/health`, login, listagem, criação, edição, conclusão, exclusão e persistência no domínio online; restaurar um backup atualizado em servidor local descartável (16/11/2026).
- [ ] Verificar estado da sessão e cookies no navegador após login/logout e reinício do serviço.
- [ ] Criar release estável somente após critérios de aceite cumpridos.

## Escopo de versão

Esta checklist cobre a versão atual de **projetos e tarefas**. Documentos, React, Go, RAG, agentes e MCP continuam como desenvolvimento posterior do projeto original.
