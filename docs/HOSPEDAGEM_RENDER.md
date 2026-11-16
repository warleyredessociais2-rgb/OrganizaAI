# Hospedagem de pré-visualização — Render + Supabase

Este procedimento prepara a primeira versão web do OrganizaAI (projetos e tarefas). **Nenhum serviço Render foi criado automaticamente pelo repositório.** A criação deve ser feita pelo proprietário na plataforma, depois de rever custos, privacidade e credenciais.

## Antes de começar

- Confirmar testes locais aprovados e migrações 000, 001 e 002 aplicadas ao banco principal.
- Confirmar backup recente e restauração testada. O backup de 13/11/2026 recuperou 1 usuário, 1 projeto e 2 tarefas, mas deve ser renovado após mudanças relevantes.
- Confirmar que senhas de banco e `SESSION_SECRET` anteriormente expostas foram substituídas.
- Nunca enviar o `.env`, o backup ou uma senha ao GitHub.
- A conta existente deve ter uma senha própria e conhecida para permitir login; cadastro público fica bloqueado por padrão em produção.
- Uma aplicação Render do tipo Web Service é acessível publicamente. Para testar com dados reais, revisar exposição e riscos antes da criação.

## Preparar um Web Service manualmente

1. Acessar https://dashboard.render.com e conectar a conta GitHub autorizada.
2. Escolher **New → Web Service** e selecionar `warleyredessociais2-rgb/OrganizaAI`.
3. Escolher **Node** como runtime, com o diretório raiz do repositório (sem subpasta).
4. Para validar a versão atual em desenvolvimento, selecionar a branch `chore/bootstrap-database`. Depois de revisar e aprovar o PR, promover a versão estável à `main`.
5. Build command: `npm ci`. Start command: `npm start`.
6. Health Check Path: `/health`. Essa rota só retorna 200 quando consegue uma consulta de leitura ao PostgreSQL; caso contrário responde 503 sem revelar detalhes.
7. Desabilitar **Auto-Deploy** até a configuração estar validada.
8. O plano **Free** pode servir apenas para testes/demonstrações. Há suspensão por inatividade e recursos efêmeros. Para uma aplicação estável/produção, planejar plano apropriado, backup, monitoramento e custos.

O servidor já lê a variável `PORT` fornecida pelo Render; não configure porta fixa.

## Variáveis de ambiente privadas

Adicionar manualmente **somente** as variáveis necessárias no Render, sem importar todo o arquivo `.env`.

| Variável | Valor / orientação |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Conexão **principal** do Supabase, armazenada como segredo no Render; verificar se é a URL apropriada para o ambiente IPv4/pooler |
| `SESSION_SECRET` | Chave forte aleatória **nova e exclusiva para a hospedagem**, guardada em gerenciador de senhas |
| `DB_SSL_CA_PATH` | `/etc/secrets/principal.crt` |
| `TRUST_PROXY_HOPS` | `1` **somente** se a topologia real do Render tiver um único proxy confiável e sobrescrever os cabeçalhos `X-Forwarded-*`; validar os cookies `Secure` em HTTPS |
| `ALLOW_PUBLIC_SIGNUP` | `false` (valor padrão de produção: cadastro bloqueado) |
| `APP_ORIGIN` | Opcional no subdomínio padrão Render; o código usa `RENDER_EXTERNAL_URL` automaticamente. Se usar domínio próprio, informar a origem HTTPS exata (ex.: `https://organizaai.exemplo`, sem `/app`) |

**Não adicionar:** `TEST_DATABASE_URL`, `TEST_DB_SSL_CA_PATH`, `ORGANIZAAI_TEST_DATABASE` nem segredos de outros serviços.

### Certificado CA Supabase

O código exige a verificação do certificado TLS e lê o arquivo informado em `DB_SSL_CA_PATH`. O caminho Windows salvo no `.env` local **não funciona em Linux**.

No Render, após a criação do serviço, abra **Environment → Secret Files → Add Secret File**, informe o nome `principal.crt` e cole o conteúdo exato do certificado **CA público do projeto principal** baixado no Supabase. O Render disponibiliza o arquivo em `/etc/secrets/principal.crt`. O arquivo contém um bloco `BEGIN CERTIFICATE`, nunca uma chave privada.

Se o primeiro deploy falhar por ausência desse arquivo, **não desabilite TLS**: adicione o arquivo e faça novo deploy. Se aparecer erro de certificado/hostname, valide a URL Supabase e a CA correspondente. A definição de `DATABASE_URL` em local errado, ou URL com parâmetros SSL que sobrepõem as opções do cliente, pode afetar essa validação.

## Verificação após publicar

1. Abrir `https://<subdominio>.onrender.com/health` e conferir status 200 e `{"status":"ok"}`.
2. Abrir `https://<subdominio>.onrender.com/app/` e verificar a interface.
3. Entrar com uma conta já existente, confirmar `/auth/me` e gerenciamento de projetos/tarefas.
4. Verificar que cookies de sessão são `Secure`, `HttpOnly` e `SameSite=Lax`; confirmar login/logout após reinício.
5. Conferir que a tentativa de cadastro público está bloqueada (`403`), sem expor dados reais.
6. Validar resposta `429` dos limites **apenas em ambiente controlado**, sem bloquear o usuário real por excesso de tentativas.
7. Confirmar cabeçalhos HTTP, console e logs; não divulgar mensagens internas nem senhas.
8. Conferir backup, política de retenção e recuperação. Nunca testar restauração diretamente sobre o banco principal.

## Pendências antes de considerar produção estável

- Revisar e mesclar PR após testes funcionais no navegador.
- Validar configurações de proxy, cookies e origem no domínio real.
- Implementar limpeza periódica controlada dos registros expirados de limites de autenticação.
- Rever CSP e outras defesas de segurança e acessibilidade; auditar credenciais no histórico remoto.
- Planejar monitoramento, backups regulares e plano de hospedagem adequado.

Fontes oficiais: https://render.com/docs/deploy-node-express-app , https://render.com/docs/configure-environment-variables , https://render.com/docs/free , https://render.com/docs/health-checks , https://supabase.com/docs/guides/platform/ssl-enforcement .
