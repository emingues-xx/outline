# 🚀 Deploy Outline com Chatbot no Railway

Este guia explica como fazer deploy do Outline com chatbot integrado no [Railway](https://railway.com/).

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.com/)
- Repositório GitHub com o código do Outline modificado
- Serviço de chatbot rodando (opcional)

## 🚀 Passos para Deploy

### 1. **Preparar o Repositório**

Certifique-se de que seu repositório contém:
- ✅ `Dockerfile` (já criado)
- ✅ `railway.json` (já criado)
- ✅ Todas as modificações do chatbot
- ✅ `package.json` com dependências atualizadas

### 2. **Criar Projeto no Railway**

1. Acesse [railway.com](https://railway.com/)
2. Clique em "Deploy from GitHub Repo"
3. Selecione seu repositório do Outline
4. Railway detectará automaticamente o `Dockerfile`

### 3. **Adicionar Serviços de Banco de Dados**

No dashboard do Railway:

1. **PostgreSQL:**
   - Clique em "+ New" → "Database" → "PostgreSQL"
   - Railway criará automaticamente a variável `DATABASE_URL`

2. **Redis:**
   - Clique em "+ New" → "Database" → "Redis"
   - Railway criará automaticamente a variável `REDIS_URL`

3. **Volume (Opcional):**
   - Clique em "+ New" → "Volume"
   - Nome: `outline-data`
   - Mount Path: `/app/data`
   - Isso permitirá persistência de arquivos locais

### 4. **Configurar Variáveis de Ambiente**

No seu serviço principal, adicione as variáveis:

```bash
# Obrigatórias
NODE_ENV=production
SECRET_KEY=sua-chave-secreta-aqui
UTILS_SECRET=seu-utils-secret-aqui
URL=https://seu-app.railway.app
COLLABORATION_URL=wss://seu-app.railway.app

# Chatbot (opcional)
CHATBOT_WEBHOOK_URL=https://seu-chatbot.railway.app/webhook/chatbot-outline

# Storage
FILE_STORAGE=local
```

### 5. **Gerar Chaves de Segurança**

```bash
# SECRET_KEY (32 bytes em hex)
openssl rand -hex 32

# UTILS_SECRET (qualquer string)
openssl rand -base64 32
```

### 6. **Deploy**

1. Railway fará o build automaticamente
2. O deploy será iniciado após o build
3. Acesse a URL fornecida pelo Railway

## 🔧 Configurações Avançadas

### **Domínio Personalizado**

1. No dashboard do Railway
2. Vá em "Settings" → "Domains"
3. Adicione seu domínio personalizado
4. Configure os DNS conforme instruções

### **Variáveis de Email (Opcional)**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_FROM_EMAIL=seu-email@gmail.com
```

### **OAuth Providers (Opcional)**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Slack OAuth
SLACK_CLIENT_ID=seu-slack-client-id
SLACK_CLIENT_SECRET=seu-slack-client-secret
```

## 🐛 Troubleshooting

### **Build Falha**
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `Dockerfile` está correto
- Veja os logs de build no Railway

### **App Não Inicia**
- Verifique as variáveis de ambiente
- Confirme se `DATABASE_URL` e `REDIS_URL` estão configuradas
- Veja os logs de runtime no Railway

### **Chatbot Não Funciona**
- Confirme se `CHATBOT_WEBHOOK_URL` está configurada
- Verifique se o serviço de chatbot está rodando
- Teste a URL do webhook manualmente

## 📊 Monitoramento

O Railway fornece:
- ✅ Logs em tempo real
- ✅ Métricas de performance
- ✅ Health checks automáticos
- ✅ Deploy automático a cada push

## 💰 Custos

- **Hobby Plan**: $5/mês (suficiente para desenvolvimento)
- **Pro Plan**: $20/mês (para produção)
- **Database**: Incluído nos planos

## 🎉 Pronto!

Seu Outline com chatbot estará rodando no Railway! 

**URL**: `https://seu-app.railway.app`

---

**Dica**: Use o Railway CLI para deploy local e debugging:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```
