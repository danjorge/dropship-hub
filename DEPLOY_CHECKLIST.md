# Checklist de Deploy para Verificação Shopee ISV

## ✅ Pré-requisitos

### 1. Ambiente de Deploy
- [ ] Escolher plataforma (Vercel, Railway, Render, AWS, etc.)
- [ ] Configurar domínio próprio (opcional mas recomendado)
- [ ] Garantir HTTPS com TLS 1.2+

### 2. Variáveis de Ambiente
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_HOST=...
REDIS_PORT=6379

# Security
JWT_SECRET=<32+ caracteres>
APP_ENC_KEY=<32+ caracteres>

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com

# Frontend
FRONTEND_URL=https://seu-dominio.com

# Shopee (deixar vazio por enquanto - será preenchido após aprovação)
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_REDIRECT_URL=https://seu-dominio.com/integrations/shopee/callback
```

### 3. Database Setup
```bash
# Rodar migrations
npx prisma migrate deploy

# Rodar seed de demonstração
npx ts-node prisma/seed-demo.ts
```

---

## 📋 Passos de Deploy

### Backend (NestJS)

**Opção 1: Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente no dashboard Vercel
```

**Opção 2: Railway**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Configurar variáveis no dashboard Railway
```

**Opção 3: Render**
1. Conectar repositório GitHub
2. Configurar como "Web Service"
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`
5. Adicionar variáveis de ambiente

### Frontend (React)

**Opção 1: Vercel**
```bash
cd web
vercel --prod
```

**Opção 2: Netlify**
```bash
cd web
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔍 Verificação Pós-Deploy

### 1. Testar Acesso
- [ ] Acessar URL via HTTPS
- [ ] Verificar certificado SSL válido
- [ ] Confirmar TLS 1.2+

### 2. Testar Login
- [ ] Login com demo-merchant@dropshiphub.com
- [ ] Verificar dashboard carrega
- [ ] Confirmar organização "Demo Store" selecionada

### 3. Testar Página de Integrações
- [ ] Navegar para /integrations
- [ ] Verificar card Shopee visível
- [ ] Confirmar botão "Conectar Shopee" funcional
- [ ] Verificar descrição e status corretos

### 4. Testar API
- [ ] Acessar /api (Swagger)
- [ ] Verificar endpoints de integração documentados
- [ ] Testar endpoint GET /integrations/status

### 5. Verificar Logs
- [ ] Sem erros no console do navegador
- [ ] Sem erros nos logs do servidor
- [ ] Requests HTTPS funcionando

---

## 📸 Screenshots para Shopee

Tirar screenshots de:

1. **Login Page**
   - Mostrando URL HTTPS

2. **Dashboard**
   - Mostrando menu lateral com "Integrações"
   - Mostrando organização "Demo Store" (MERCHANT)

3. **Página de Integrações**
   - Mostrando card Shopee
   - Mostrando status e botão de conexão

4. **Swagger API**
   - Mostrando endpoints de integração

5. **Integração Conectada** (se possível testar)
   - Mostrando status "Conectado"
   - Mostrando informações da integração

---

## 📝 Informações para Submissão Shopee

### Copiar e Preencher:

**URL de Acesso:**
```
https://[SEU-DOMINIO-AQUI]
```

**Credenciais:**
```
Email: demo-merchant@dropshiphub.com
Senha: DemoMerchant2024!
```

**Passo a Passo:**
```
1. Acesse a URL acima via HTTPS
2. Clique em "Login" no canto superior direito
3. Insira as credenciais fornecidas
4. No menu lateral, clique em "Integrações"
5. Você verá o card "Shopee" com status de integração
6. A integração está identificável e funcional
```

**Remarks (Campo de Observações):**
```
Produto: Dropship Hub - SaaS Multi-Tenant para Dropshipping B2B

Integrações Ativas:
- Shopee (OAuth 2.0, API v2, Webhooks implementados)
- Mercado Livre (estrutura pronta)

Compliance:
- Shopee DPP completo
- HTTPS/TLS 1.2+
- Encryption AES-256-GCM
- Audit Logging
- Data Retention (90 dias)

Tipo: ISV (Independent Software Vendor)
Não somos vendedor individual ou afiliado.

Documentação técnica completa disponível em:
https://[SEU-DOMINIO]/api (Swagger)

Contato: [SEU EMAIL]
```

---

## 🚨 Troubleshooting

### Problema: HTTPS não funciona
**Solução:**
- Vercel/Netlify: HTTPS automático
- Outros: Configurar Let's Encrypt ou Cloudflare

### Problema: Database connection error
**Solução:**
- Verificar DATABASE_URL correto
- Confirmar database acessível de fora
- Usar database cloud (Railway, Supabase, etc.)

### Problema: CORS errors
**Solução:**
- Adicionar domínio frontend em CORS_ORIGIN
- Verificar FRONTEND_URL está correto

### Problema: Login não funciona
**Solução:**
- Verificar JWT_SECRET configurado
- Confirmar seed rodou com sucesso
- Checar logs do servidor

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do servidor
2. Verificar console do navegador
3. Testar endpoints via Swagger
4. Verificar variáveis de ambiente

---

## ✅ Checklist Final

Antes de submeter para Shopee:

- [ ] Sistema acessível via HTTPS
- [ ] TLS 1.2+ confirmado
- [ ] Login funcional com credenciais demo
- [ ] Página de Integrações acessível
- [ ] Card Shopee visível e identificável
- [ ] Status de integração claro
- [ ] Botão "Conectar" funcional
- [ ] API Swagger acessível
- [ ] Screenshots tirados
- [ ] Informações de contato prontas
- [ ] Documento SHOPEE_ISV_VERIFICATION.md revisado

---

**Pronto para submissão! 🚀**
