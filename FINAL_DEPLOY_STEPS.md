# 🚀 Deploy Final - Render.com (5 minutos)

## ❌ Railway não está funcionando
Múltiplas tentativas de build falharam. Render.com é mais confiável.

## ✅ Passos Finais (Siga EXATAMENTE)

### 1. Criar Repositório GitHub (1 min)

**Acesse:** https://github.com/new

- **Nome:** dropship-hub
- **Visibilidade:** Público ou Privado (tanto faz)
- **NÃO** inicialize com README

Clique em **"Create repository"**

### 2. Conectar e Push (1 min)

Copie e cole estes comandos (substitua SEU-USUARIO):

```bash
git remote add origin https://github.com/SEU-USUARIO/dropship-hub.git
git branch -M main
git push -u origin main
```

### 3. Deploy no Render (2 min)

1. **Acesse:** https://render.com
2. **Faça login** com GitHub
3. **Clique em "New +"** → **"Blueprint"**
4. **Conecte** seu repositório dropship-hub
5. Render detecta `render.yaml` automaticamente
6. **Clique em "Apply"**

Render vai:
- ✅ Criar PostgreSQL grátis
- ✅ Deploy do backend
- ✅ Gerar HTTPS automático
- ✅ Configurar variáveis

### 4. Aguardar Deploy (2-3 min)

Render vai mostrar o progresso. Aguarde até ver "Live".

### 5. Adicionar Variáveis Extras (30 seg)

No dashboard do Render, vá no serviço **dropship-hub**:

1. Clique em **"Environment"**
2. Adicione:

```
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://dropship-hub.onrender.com/integrations/shopee/callback
FRONTEND_URL=https://dropship-hub.onrender.com
CORS_ORIGIN=https://dropship-hub.onrender.com
```

(Substitua `dropship-hub` pelo nome real do seu serviço)

3. Clique **"Save Changes"**

### 6. Rodar Migrations e Seed (1 min)

No Render dashboard:

1. Vá no serviço **dropship-hub**
2. Clique em **"Shell"** (no menu lateral)
3. Execute:

```bash
npx prisma migrate deploy
npx ts-node prisma/seed-demo.ts
```

### 7. Obter URL e Testar (30 seg)

Sua URL será algo como:
```
https://dropship-hub.onrender.com
```

Teste:
```bash
curl https://dropship-hub.onrender.com/api
```

Se retornar HTML do Swagger, está funcionando! ✅

---

## 📝 Para Submeter à Shopee

**URL de Acesso:**
```
https://dropship-hub.onrender.com
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
3. Insira as credenciais fornecidas
4. No menu lateral, clique em "Integrações"
5. Você verá o card "Shopee" com status de integração
```

**Remarks (Campo de Observações):**
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

API Documentation: https://dropship-hub.onrender.com/api

Contato: danjorge@gmail.com
```

---

## ⚠️ Importante

**Render Free Tier:**
- Serviço "dorme" após 15 min de inatividade
- Primeiro acesso pode demorar ~30 segundos para "acordar"
- Para Shopee, isso é OK - eles vão testar e aprovar

**Se quiser evitar o "sleep":**
- Upgrade para plano pago ($7/mês)
- Ou use um serviço de "ping" para manter ativo

---

## ✅ Checklist Final

Antes de submeter à Shopee:

- [ ] Repositório GitHub criado
- [ ] Código no GitHub
- [ ] Deploy no Render completo
- [ ] PostgreSQL conectado
- [ ] Migrations rodadas
- [ ] Seed executado (contas demo criadas)
- [ ] URL HTTPS funcionando
- [ ] Login testado
- [ ] Página /integrations acessível
- [ ] Card Shopee visível
- [ ] API Swagger em /api

---

## 🎯 AÇÃO AGORA

**Passo 1:** Criar repo GitHub  
**Passo 2:** Push código  
**Passo 3:** Deploy no Render  

**Tempo total: 5-7 minutos**

Depois disso, você terá tudo pronto para a Shopee aprovar! 🚀
