# Template de Resposta para Shopee Open Platform
**Para submissão no campo "Remarks" do perfil de desenvolvedor**

---

## Informações da Conta de Teste

**URL de Acesso:**  
https://[SEU-DOMINIO-AQUI].vercel.app

**Protocolo:**  
HTTPS com TLS 1.2+

**Credenciais de Login (Merchant):**
```
Email: demo-merchant@dropshiphub.com
Senha: DemoMerchant2024!
```

---

## Passo a Passo até Integrações/API

**1. Acesso:**
- Acesse a URL acima
- Clique em "Login" no canto superior direito
- Insira as credenciais fornecidas
- Clique em "Entrar"

**2. Dashboard:**
- Após login, você verá o dashboard principal
- Verifique que a organização "Demo Store" está selecionada (canto superior direito)
- Tipo: MERCHANT (necessário para conectar marketplaces)

**3. Navegação até Integrações:**
- No menu lateral esquerdo, clique em "Integrações"
- Ou acesse diretamente: https://[SEU-DOMINIO]/integrations

**4. Integração Shopee Identificável:**
- Você verá o card "Shopee" com:
  - Nome: Shopee
  - Descrição: "Conecte sua loja Shopee para sincronizar pedidos e anúncios"
  - Status: "Não Conectado" ou "Conectado" (se já testado)
  - Botão: "Conectar Shopee"

**5. Funcionalidade:**
- Ao clicar em "Conectar Shopee", o sistema:
  - Gera URL de autorização OAuth 2.0
  - Inclui assinatura HMAC-SHA256
  - Redireciona para Shopee Partner Authorization
  - Após aprovação, armazena credenciais criptografadas
  - Atualiza status para "ACTIVE"

---

## Sobre o Produto

**Nome:** Dropship Hub  
**Tipo:** SaaS Multi-Tenant para Dropshipping B2B  

**Descrição:**
Plataforma que conecta fornecedores com lojistas, permitindo integração com marketplaces (Shopee, Mercado Livre) para sincronização automática de produtos, pedidos e fulfillment.

**Integrações Ativas:**
- ✅ Shopee (OAuth 2.0, API v2, Webhooks)
- 🔄 Mercado Livre (em preparação)

**Compliance:**
- ✅ Shopee DPP (Data Protection Policy)
- ✅ HTTPS/TLS 1.2+
- ✅ Encryption AES-256-GCM
- ✅ Audit Logging
- ✅ Data Retention (90 dias)

**Documentação Técnica:**
- API Swagger: https://[SEU-DOMINIO]/api
- GitHub: [seu-repo] (se público)

---

## Observações Importantes

**Somos um ISV (Independent Software Vendor):**
- ✅ Produto SaaS real em desenvolvimento
- ✅ Arquitetura multi-tenant profissional
- ✅ Integração Shopee funcional e identificável
- ✅ Compliance com Shopee DPP implementado

**NÃO somos:**
- ❌ Vendedor Shopee individual
- ❌ Afiliado Shopee

**Ambiente:**
- Staging/Demo para verificação
- Dados de teste/mock
- Integração real com Shopee API
- Pronto para revisão técnica

---

## Contato

**Desenvolvedor:**  
Nome: [SEU NOME]  
Email: [SEU EMAIL]  
LinkedIn: [SEU LINKEDIN]

**Empresa:**  
Nome: Dropship Hub  
Email: [EMAIL DA EMPRESA]

---

**Documentação Completa:**  
Ver arquivo SHOPEE_ISV_VERIFICATION.md para detalhes técnicos completos.
