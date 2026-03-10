# 🚀 Deploy Rápido com Render.com (5 minutos)

## Por que Render?
- ✅ Mais simples que Railway
- ✅ PostgreSQL incluído grátis
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ Sem problemas de build

## Passo a Passo

### 1. Criar Repositório GitHub (2 min)

```bash
# 1. Criar repo em: https://github.com/new
# Nome: dropship-hub
# Público ou Privado

# 2. Conectar local ao GitHub
git remote add origin https://github.com/SEU-USUARIO/dropship-hub.git
git add .
git commit -m "Add Render config and security features"
git push -u origin main
```

### 2. Deploy no Render (3 min)

1. **Acesse:** https://render.com
2. **Faça login** com GitHub
3. **Clique em "New +"** → **"Blueprint"**
4. **Conecte seu repositório** dropship-hub
5. **Render detecta** o arquivo `render.yaml` automaticamente
6. **Clique em "Apply"**

Render vai:
- Criar PostgreSQL automaticamente
- Fazer deploy do backend
- Gerar variáveis de ambiente
- Configurar HTTPS

### 3. Adicionar Variáveis Adicionais (1 min)

No dashboard do Render, vá no serviço e adicione:

```
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://seu-app.onrender.com/integrations/shopee/callback
FRONTEND_URL=https://seu-app.onrender.com
CORS_ORIGIN=https://seu-app.onrender.com
```

### 4. Rodar Migrations e Seed (1 min)

No Render dashboard:
1. Vá no serviço
2. Clique em "Shell"
3. Execute:

```bash
npx prisma migrate deploy
npx ts-node prisma/seed-demo.ts
```

**OU** adicione ao Build Command:
```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### 5. Obter URL

Render gera automaticamente uma URL tipo:
```
https://dropship-hub.onrender.com
```

---

## ✅ Pronto para Shopee!

**URL:** https://dropship-hub.onrender.com  
**Login:** demo-merchant@dropshiphub.com  
**Senha:** DemoMerchant2024!

**Teste:**
```bash
curl https://dropship-hub.onrender.com/api
```

---

## 🆚 Comparação

| Feature | Railway | Render | Vercel |
|---------|---------|--------|--------|
| Setup | Complexo | Fácil | Médio |
| PostgreSQL | Manual | Automático | Externo |
| Build | Problemas | Funciona | Funciona |
| HTTPS | Sim | Sim | Sim |
| Grátis | Sim | Sim | Sim |

**Recomendação: Use Render!** 🎯
