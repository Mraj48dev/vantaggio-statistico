# 🌐 Cloud-First Setup Guide - Vantaggio Statistico

**Guida step-by-step per configurare l'ambiente di sviluppo cloud-first come specificato nella roadmap.**

## 🎯 Obiettivo

Configurare un ambiente di sviluppo completamente cloud-based che garantisca:
- **Parità assoluta** tra sviluppo e produzione
- **Zero setup locale** - tutto su GitHub/Vercel
- **Collaborazione team** senza conflitti di ambiente
- **Deploy automatico** ad ogni commit

---

## 📋 **STEP 1: GitHub Repository Setup**

### 1.1 Creare il Repository
```bash
# Opzione A: Nuovo repository su GitHub
# 1. Vai su github.com/new
# 2. Nome repository: "vantaggio-statistico"
# 3. Descrizione: "Casino strategy platform with statistical advantage"
# 4. Repository pubblico o privato
# 5. Non aggiungere README (già presente)

# Opzione B: CLI (se hai GitHub CLI)
gh repo create vantaggio-statistico --public --clone
```

### 1.2 Push del Codice Esistente
```bash
# Nel direttorio corrente del progetto:
git init
git add .
git commit -m "🎰 Initial commit - Vantaggio Statistico Foundation

✅ Complete modular architecture implemented
✅ Premium casino UI components
✅ Database schema with Prisma
✅ Shared domain contracts
✅ Cloud-first configuration ready

Following roadmap Phase 1: Foundation"

git branch -M main
git remote add origin https://github.com/TUO_USERNAME/vantaggio-statistico.git
git push -u origin main
```

---

## 🚀 **STEP 2: Vercel Deployment Setup**

### 2.1 Collegare Repository a Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Accedi con GitHub account
3. Clicca "New Project"
4. Importa il repository `vantaggio-statistico`
5. **Framework**: Next.js (auto-detected)
6. **Root Directory**: `.` (default)
7. **Build Command**: `npm run build` (auto-detected)
8. **Output Directory**: `.next` (auto-detected)

### 2.2 Configurare Environment Variables su Vercel
```bash
# Nel dashboard Vercel del progetto:
# Settings → Environment Variables → Aggiungi:

DATABASE_URL=postgresql://username:password@hostname:5432/vantaggio_statistico
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
NEXTAUTH_SECRET=your-secret-here
```

### 2.3 Deploy Automatico
- ✅ **Deploy su push**: Automatico ad ogni commit su `main`
- ✅ **Preview deployment**: Automatico per ogni PR
- ✅ **Live URL**: `https://vantaggio-statistico.vercel.app`

---

## 💻 **STEP 3: GitHub Codespaces Setup**

### 3.1 Attivare Codespaces
1. Vai sul repository GitHub
2. Clicca il bottone verde "Code"
3. Tab "Codespaces"
4. Clicca "Create codespace on main"

### 3.2 Configurazione Automatica
Il file `.devcontainer/devcontainer.json` configurerà automaticamente:
- ✅ **Node.js 18**
- ✅ **Extensions VSCode** (Tailwind, Prisma, TypeScript)
- ✅ **Port forwarding** (3000, 3001, 5555)
- ✅ **Auto-install dependencies**

### 3.3 Primo Avvio in Codespaces
```bash
# Il codespace si avvia automaticamente e esegue:
npm install          # Auto-eseguito da postCreateCommand
npm run db:generate  # Auto-eseguito da postStartCommand

# Poi puoi eseguire:
npm run dev          # Server su port forwarded
npm run db:studio    # Prisma Studio su port 5555
```

---

## 🗄️ **STEP 4: Database Cloud Setup (Neon)**

### 4.1 Creare Database su Neon
1. Vai su [neon.tech](https://neon.tech)
2. Accedi con GitHub
3. Crea nuovo progetto: "vantaggio-statistico"
4. **Region**: Europe (fra) per latenza ottimale
5. **PostgreSQL Version**: 15+

### 4.2 Configurare Connection String
```bash
# Copia la connection string da Neon dashboard
# Formato: postgresql://username:password@hostname:5432/dbname

# Aggiungi a Vercel Environment Variables:
DATABASE_URL="postgresql://username:password@hostname:5432/vantaggio_statistico?sslmode=require"
```

### 4.3 Setup Database Schema
```bash
# In Codespaces o localmente:
npm run db:push      # Crea schema su Neon
npm run db:seed      # Popola dati iniziali
npm run db:studio    # Verifica database (forwarded port)
```

---

## 🔑 **STEP 5: Services Integration**

### 5.1 Clerk Authentication Setup
1. Vai su [clerk.com](https://clerk.com)
2. Crea nuovo progetto: "Vantaggio Statistico"
3. Configura:
   - **Allowed domains**: `vantaggio-statistico.vercel.app`
   - **Sign-in URL**: `/sign-in`
   - **After sign-in**: `/dashboard`
4. Copia API keys → Vercel Environment Variables

### 5.2 Stripe Payments Setup
1. Vai su [stripe.com](https://stripe.com)
2. Crea account o accedi
3. Configura:
   - **Test mode** inizialmente
   - **Webhook endpoint**: `https://vantaggio-statistico.vercel.app/api/webhooks/stripe`
4. Copia API keys → Vercel Environment Variables

---

## 🔄 **STEP 6: CI/CD Pipeline Verification**

### 6.1 GitHub Actions Check
```bash
# Il file .github/workflows/ci.yml è già configurato
# Verifica che si attivi su push:

git add .
git commit -m "🚀 Cloud setup configuration"
git push origin main

# Controlla GitHub Actions tab per verificare:
# ✅ Code Quality & Type Safety
# ✅ Unit & Integration Tests
# ✅ Deploy to Vercel
```

### 6.2 Vercel Deploy Verification
- ✅ **Build logs**: Controllare nel Vercel dashboard
- ✅ **Live site**: Aprire l'URL di produzione
- ✅ **Function logs**: Verificare API routes

---

## 🎯 **STEP 7: Team Development Workflow**

### 7.1 Workflow per Nuove Features
```bash
# Ogni sviluppatore:
1. Apre GitHub Codespace dal repository
2. Crea feature branch: git checkout -b feature/AUTH-001
3. Sviluppa in ambiente cloud identico a produzione
4. Push → automatic preview deployment su Vercel
5. Code review → merge → automatic production deployment
```

### 7.2 Environment Parity Guarantees
- ✅ **Codespaces** = **Vercel Production** (identico Node.js, dependencies)
- ✅ **Database** = Neon PostgreSQL per tutti gli ambienti
- ✅ **APIs** = Same environment variables e configurazioni
- ✅ **Build process** = Identico tra CI e Vercel

---

## ✅ **Checklist Completamento Cloud Setup**

### Infrastruttura
- [ ] Repository GitHub creato e configurato
- [ ] Vercel collegato con deploy automatico
- [ ] Codespaces configurato con devcontainer.json
- [ ] GitHub Actions CI/CD pipeline attivo

### Services
- [ ] Database Neon configurato e collegato
- [ ] Clerk authentication setup
- [ ] Stripe payments configurato (test mode)
- [ ] Environment variables su Vercel

### Verification
- [ ] Build su Vercel successful
- [ ] Codespace si avvia senza errori
- [ ] Database accessibile da cloud environment
- [ ] Live URL funzionante: `https://vantaggio-statistico.vercel.app`

### Team Ready
- [ ] README aggiornato con cloud-first instructions
- [ ] Environment variables documentate
- [ ] Development workflow definito
- [ ] Deploy pipeline testato

---

## 🎮 **Next Steps dopo Cloud Setup**

Una volta completato il cloud setup, seguire la roadmap:

### **Week 3**: Auth & Permissions Implementation
- Implementare Auth module con Clerk integration
- Sistema permissions granulare
- User sync con database

### **Week 4-5**: Game Engine Implementation
- Roulette engine funzionante
- Metodo Fibonacci operativo
- Session management

**🌟 Target**: Piattaforma live su cloud con primo metodo betting funzionante!

---

**🎰 Vantaggio Statistico** - *Cloud-First Casino Platform Development*