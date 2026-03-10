# Railway Setup - Guia Rápido

## ✅ Status Atual
- Railway CLI instalado
- Login feito como: danjorge@gmail.com
- Projeto criado: dropship-hub
- URL: https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

## 🎯 Próximos Passos (Via Interface Web - Mais Fácil)

### 1. Adicionar PostgreSQL

**Acesse:** https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

**No dashboard do projeto:**
1. Clique em "+ New" (canto superior direito)
2. Selecione "Database"
3. Escolha "Add PostgreSQL"
4. Railway vai criar o database automaticamente

### 2. Adicionar Redis (Opcional mas Recomendado)

1. Clique em "+ New" novamente
2. Selecione "Database"
3. Escolha "Add Redis"

### 3. Deploy do Backend

**Opção A: Via Interface (Recomendado)**
1. No projeto Railway, clique em "+ New"
2. Selecione "GitHub Repo"
3. Conecte seu repositório dropship-hub
4. Railway detecta automaticamente NestJS
5. Configure variáveis de ambiente (ver abaixo)
6. Deploy automático!

**Opção B: Via CLI**
```bash
railway up
```

### 4. Configurar Variáveis de Ambiente

No Railway dashboard, vá em seu serviço > Variables:

**Copiar do PostgreSQL (automático):**
- `DATABASE_URL` - Railway já configura automaticamente quando você adiciona PostgreSQL

**Adicionar manualmente:**
```bash
JWT_SECRET=d4de2f746ff461007228aa8824b555a77337a9b08703515e4ef78c3189c4b140
APP_ENC_KEY=9b2f245b72880f1c9dc7ac1a34af1254fcbcac30ecd0289d26704fc1c97e8be3
NODE_ENV=production
PORT=3000

# Redis (se adicionou)
REDIS_HOST=${{Redis.RAILWAY_PRIVATE_DOMAIN}}
REDIS_PORT=6379

# Frontend (será a URL do Railway)
FRONTEND_URL=https://dropship-hub-production.up.railway.app
CORS_ORIGIN=https://dropship-hub-production.up.railway.app

# Shopee (deixar vazio por enquanto)
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://dropship-hub-production.up.railway.app/integrations/shopee/callback
```

### 5. Rodar Migrations

Após deploy, você precisa rodar as migrations.

**Via Railway CLI:**
```bash
# Conectar ao projeto
railway link

# Rodar migrations
railway run npx prisma migrate deploy

# Rodar seed de demo
railway run npx ts-node prisma/seed-demo.ts
```

**Ou via Railway Dashboard:**
1. Vá em Settings > Deploy
2. Em "Build Command" adicione: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Redeploy

### 6. Obter URL do Deploy

Após deploy bem-sucedido:
1. No Railway dashboard, vá em Settings > Networking
2. Clique em "Generate Domain"
3. Você receberá uma URL tipo: `dropship-hub-production.up.railway.app`
4. Esta é sua URL HTTPS para a Shopee!

### 7. Testar o Sistema

```bash
# Testar se está online
curl https://dropship-hub-production.up.railway.app/api

# Testar login
curl -X POST https://dropship-hub-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo-merchant@dropshiphub.com","password":"DemoMerchant2024!"}'
```

---

## 🚀 Deploy Rápido (Alternativa CLI)

Se preferir fazer tudo via CLI:

```bash
# 1. Link ao projeto (já feito)
railway link

# 2. Adicionar PostgreSQL via dashboard (mais fácil)
# Acesse: https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

# 3. Deploy
railway up

# 4. Rodar migrations
railway run npx prisma migrate deploy
railway run npx ts-node prisma/seed-demo.ts

# 5. Abrir no navegador
railway open
```

---

## 📋 Checklist de Verificação

Antes de submeter para Shopee:

- [ ] PostgreSQL adicionado no Railway
- [ ] Backend deployado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodadas
- [ ] Seed executado (contas demo criadas)
- [ ] URL HTTPS gerada
- [ ] Teste de login funcionando
- [ ] Página /integrations acessível
- [ ] Card Shopee visível

---

## 🔗 Links Úteis

**Projeto Railway:**
https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

**Documentação Railway:**
- https://docs.railway.com/guides/nestjs
- https://docs.railway.com/databases/postgresql

**Após Deploy:**
- URL do App: https://dropship-hub-production.up.railway.app
- Swagger API: https://dropship-hub-production.up.railway.app/api
- Integrations: https://dropship-hub-production.up.railway.app/integrations

---

## ⚠️ Troubleshooting

**Erro: Database connection failed**
- Verifique se PostgreSQL foi adicionado
- Verifique se DATABASE_URL está configurado
- Railway configura automaticamente quando você adiciona PostgreSQL

**Erro: Build failed**
- Verifique logs no Railway dashboard
- Certifique-se que package.json tem script "build"
- Verifique se todas as dependências estão no package.json

**Erro: Migrations não rodaram**
- Execute manualmente: `railway run npx prisma migrate deploy`
- Ou adicione ao build command

---

## 📞 Próximo Passo

**AGORA:**
1. Acesse: https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f
2. Adicione PostgreSQL pelo dashboard (botão "+ New" > Database > PostgreSQL)
3. Volte aqui e rode: `railway up`
