# 🚀 Guia Rápido de Deploy - Railway

## ✅ O que você já fez:
- ✅ Railway CLI instalado
- ✅ Login feito (danjorge@gmail.com)
- ✅ Projeto criado: dropship-hub
- ✅ Arquivos de configuração criados (railway.json, nixpacks.toml)

## 🎯 Próximos 5 Passos (10 minutos)

### 1️⃣ Adicionar PostgreSQL (2 min)

**Acesse:** https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

1. Clique no botão **"+ New"** (canto superior direito)
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Aguarde ~30 segundos até ficar pronto

### 2️⃣ Fazer Push para GitHub (1 min)

Se ainda não está no GitHub:

```bash
git add .
git commit -m "Add Railway config and security features"
git push origin main
```

### 3️⃣ Conectar GitHub ao Railway (3 min)

No projeto Railway:
1. Clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Autorize Railway a acessar seu GitHub
4. Selecione o repositório **dropship-hub**
5. Clique em **"Deploy Now"**

Railway vai:
- Detectar NestJS automaticamente
- Instalar dependências
- Rodar build
- Fazer deploy

### 4️⃣ Conectar PostgreSQL ao Serviço (1 min)

1. Clique no serviço do seu app (dropship-hub)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"** → **"Add Reference"**
4. Selecione o PostgreSQL
5. Escolha **DATABASE_URL**
6. Salvar

Isso conecta automaticamente o database ao seu app!

### 5️⃣ Adicionar Variáveis de Ambiente (2 min)

Na mesma aba **"Variables"**, adicione:

```
JWT_SECRET=d4de2f746ff461007228aa8824b555a77337a9b08703515e4ef78c3189c4b140
APP_ENC_KEY=9b2f245b72880f1c9dc7ac1a34af1254fcbcac30ecd0289d26704fc1c97e8be3
NODE_ENV=production
PORT=3000
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://seu-app.up.railway.app/integrations/shopee/callback
```

**Importante:** Depois que gerar o domínio (próximo passo), volte e atualize:
- `SHOPEE_REDIRECT_URL`
- `FRONTEND_URL` (adicione com a URL gerada)
- `CORS_ORIGIN` (adicione com a URL gerada)

### 6️⃣ Gerar Domínio Público (1 min)

1. No serviço, vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Você receberá uma URL tipo: `dropship-hub-production.up.railway.app`
4. **Copie esta URL!** Você vai precisar para a Shopee

### 7️⃣ Rodar Migrations e Seed (2 min)

Via Railway CLI:

```bash
# Conectar ao projeto
railway link

# Rodar migrations
railway run npx prisma migrate deploy

# Rodar seed (criar contas demo)
railway run npx ts-node prisma/seed-demo.ts
```

**Ou via Dashboard:**
1. No serviço, vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Selecione **"View Logs"**
4. Verifique se as migrations rodaram automaticamente

Se não rodaram, adicione ao **Build Command** em Settings:
```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

---

## ✅ Verificação Final

Teste se está funcionando:

```bash
# Substituir pela sua URL do Railway
URL="https://dropship-hub-production.up.railway.app"

# Testar API
curl $URL/api

# Testar login
curl -X POST $URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo-merchant@dropshiphub.com","password":"DemoMerchant2024!"}'
```

Se retornar um token JWT, está funcionando! 🎉

---

## 📋 Informações para Shopee

Depois que tudo estiver funcionando:

**URL de Acesso:**
```
https://dropship-hub-production.up.railway.app
```

**Credenciais de Teste:**
```
Email: demo-merchant@dropshiphub.com
Senha: DemoMerchant2024!
```

**Passo a Passo:**
```
1. Acesse a URL acima (HTTPS com TLS 1.2+)
2. Clique em "Login"
3. Use as credenciais fornecidas
4. No menu lateral, clique em "Integrações"
5. Você verá o card "Shopee" com status de integração
```

**Para o campo "Remarks":**
```
Produto: Dropship Hub - SaaS Multi-Tenant para Dropshipping B2B

Integrações Implementadas:
- Shopee (OAuth 2.0, API v2, Webhooks)
- Mercado Livre (estrutura pronta)

Compliance:
- Shopee DPP completo
- HTTPS/TLS 1.2+
- Encryption AES-256-GCM
- Audit Logging
- Data Retention (90 dias)

Tipo: ISV (Independent Software Vendor)
NÃO somos vendedor individual ou afiliado.

API Documentation: https://dropship-hub-production.up.railway.app/api

Contato: danjorge@gmail.com
```

---

## 🎯 Alternativa Mais Rápida (Se GitHub não funcionar)

Se tiver problemas com GitHub, use deploy direto via CLI:

```bash
# Certifique-se que PostgreSQL foi adicionado no dashboard primeiro!

# Link ao projeto (se ainda não fez)
railway link

# Deploy
railway up

# Após deploy, rodar migrations
railway run npx prisma migrate deploy
railway run npx ts-node prisma/seed-demo.ts
```

---

## ⚠️ Troubleshooting

**Deploy falha com erro de database:**
- Certifique-se que PostgreSQL foi adicionado no dashboard
- Verifique se DATABASE_URL está nas variáveis
- Railway conecta automaticamente quando você adiciona a referência

**Build falha:**
- Verifique logs no Railway dashboard
- Certifique-se que package.json tem todas as dependências
- Verifique se railway.json e nixpacks.toml estão no repositório

**Migrations não rodam:**
- Execute manualmente: `railway run npx prisma migrate deploy`
- Ou adicione ao Build Command

**Seed falha:**
- Certifique-se que migrations rodaram primeiro
- Execute: `railway run npx ts-node prisma/seed-demo.ts`

---

## 🚀 Pronto!

Depois de completar estes passos, você terá:
- ✅ Sistema rodando em HTTPS
- ✅ PostgreSQL configurado
- ✅ Contas demo criadas
- ✅ URL pública para a Shopee
- ✅ Tudo pronto para aprovação ISV!

**Tempo total: ~10-15 minutos** ⏱️
