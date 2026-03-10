# 🚨 AÇÃO URGENTE: Deploy em 5 Minutos

## ❌ Problema Atual
O Railway CLI está falhando porque **não há PostgreSQL configurado**.

## ✅ Solução Imediata (5 minutos)

### Passo 1: Adicionar PostgreSQL (2 min)

**ABRA AGORA:** https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f

1. Clique no botão **"+ New"** (canto superior direito)
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Aguarde ~30 segundos até aparecer "Ready"

### Passo 2: Deploy via Dashboard (3 min)

**Opção A: Upload Direto (Mais Rápido)**

1. No projeto Railway, clique **"+ New"**
2. Selecione **"Empty Service"**
3. Vá em **Settings** → **Source**
4. Clique em **"Deploy from Local Directory"**
5. Selecione a pasta do projeto
6. Railway faz upload e deploy

**Opção B: GitHub (Se tiver repo)**

Se você já tem o código no GitHub:
1. Clique **"+ New"** → **"GitHub Repo"**
2. Selecione o repositório
3. Deploy automático

**Opção C: Criar GitHub Repo Agora**

```bash
# 1. Criar repo no GitHub
# Acesse: https://github.com/new
# Nome: dropship-hub
# Público ou Privado
# NÃO inicialize com README

# 2. Conectar local ao GitHub
git remote add origin https://github.com/SEU-USUARIO/dropship-hub.git
git branch -M main
git push -u origin main

# 3. No Railway, conectar GitHub repo
```

### Passo 3: Conectar PostgreSQL ao Serviço (1 min)

Depois do deploy:
1. Clique no serviço **dropship-hub**
2. Vá em **Variables**
3. Clique **"+ New Variable"** → **"Add Reference"**
4. Selecione **PostgreSQL**
5. Escolha **DATABASE_URL**
6. Salvar

### Passo 4: Adicionar Variáveis Obrigatórias (1 min)

Na aba **Variables**, adicione:

```
JWT_SECRET=d4de2f746ff461007228aa8824b555a77337a9b08703515e4ef78c3189c4b140
APP_ENC_KEY=9b2f245b72880f1c9dc7ac1a34af1254fcbcac30ecd0289d26704fc1c97e8be3
NODE_ENV=production
PORT=3000
```

### Passo 5: Gerar Domínio Público (30 seg)

1. No serviço, vá em **Settings** → **Networking**
2. Clique **"Generate Domain"**
3. Copie a URL gerada (ex: `dropship-hub-production.up.railway.app`)

### Passo 6: Atualizar Variáveis com a URL (30 seg)

Volte em **Variables** e adicione:

```
FRONTEND_URL=https://SUA-URL-AQUI.up.railway.app
CORS_ORIGIN=https://SUA-URL-AQUI.up.railway.app
SHOPEE_REDIRECT_URL=https://SUA-URL-AQUI.up.railway.app/integrations/shopee/callback
```

### Passo 7: Rodar Migrations e Seed (1 min)

Via CLI:
```bash
railway link
railway run npx prisma migrate deploy
railway run npx ts-node prisma/seed-demo.ts
```

**OU** adicione ao Build Command em Settings:
```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

---

## 🎯 Alternativa SUPER RÁPIDA: Vercel + Supabase

Se Railway continuar dando problema, use esta combinação:

### 1. Database: Supabase (2 min)
1. Acesse: https://supabase.com
2. Crie conta
3. Crie novo projeto
4. Copie a **Connection String** (Settings → Database)

### 2. Deploy: Vercel (3 min)
```bash
# Criar repo GitHub primeiro
git remote add origin https://github.com/SEU-USUARIO/dropship-hub.git
git push -u origin main

# Deploy no Vercel
vercel --prod
```

Quando Vercel perguntar por variáveis:
```
DATABASE_URL=postgresql://... (do Supabase)
JWT_SECRET=d4de2f746ff461007228aa8824b555a77337a9b08703515e4ef78c3189c4b140
APP_ENC_KEY=9b2f245b72880f1c9dc7ac1a34af1254fcbcac30ecd0289d26704fc1c97e8be3
NODE_ENV=production
```

---

## ✅ Checklist Final

Depois do deploy bem-sucedido:

- [ ] Sistema acessível via HTTPS
- [ ] Login funciona com demo-merchant@dropshiphub.com
- [ ] Página /integrations acessível
- [ ] Card Shopee visível
- [ ] API Swagger em /api

**Teste:**
```bash
curl https://SUA-URL/api
```

---

## 📝 Para Shopee

**URL:** https://SUA-URL-AQUI.up.railway.app  
**Login:** demo-merchant@dropshiphub.com  
**Senha:** DemoMerchant2024!  

**Passo a passo:**
1. Acesse a URL (HTTPS)
2. Login com credenciais
3. Menu → Integrações
4. Card Shopee visível

---

## 🆘 Se TUDO falhar

Use **Render.com** (mais simples que Railway):

1. Acesse: https://render.com
2. Crie conta
3. **New** → **PostgreSQL** (grátis)
4. **New** → **Web Service**
5. Conecte GitHub
6. Render detecta NestJS automaticamente
7. Adicione variáveis de ambiente
8. Deploy!

---

**IMPORTANTE:** O problema do Railway é que você PRECISA adicionar PostgreSQL via dashboard ANTES de fazer deploy. O CLI não está funcionando para isso.

**AÇÃO AGORA:**
1. Abra: https://railway.com/project/50f7bef8-a276-4538-be34-6a49f94b6a6f
2. Adicione PostgreSQL
3. Tente deploy novamente
