# 🎰 Vantaggio Statistico

**Casino Strategy Platform** - Una piattaforma avanzata per strategie di casinò che guida i giocatori attraverso decisioni statisticamente informate per massimizzare il potenziale di vincita.

## 🚀 Stato del Progetto

**✅ FASE 1: FOUNDATION COMPLETATA**

La base architetturale della piattaforma è stata implementata seguendo rigorosamente la roadmap con focus su modularità, Clean Architecture e premium UX per l'ambiente casino.

### ✨ Caratteristiche Implementate

- **🏗️ Architettura Modulare**: Bounded contexts completamente indipendenti
- **🎨 Design Casino Premium**: Sistema di design luxury con oro, verde e nero
- **📱 Responsive & Mobile-First**: Ottimizzato per gaming mobile
- **🔗 Contratti Stabili**: Interfacce standardizzate tra moduli
- **💎 Componenti UI Casino**: Componenti premium per ambiente casinò
- **🗄️ Schema Database Completo**: Modello dati per tutti i moduli

## 🛠️ Stack Tecnologico

### Frontend & Backend
- **Next.js 15** con App Router e TypeScript
- **Tailwind CSS** con design system casino-themed
- **Framer Motion** per animazioni premium
- **React Hook Form** + Zod per validazione

### Database & Backend Services
- **PostgreSQL** con Prisma ORM
- **Clerk.com** per autenticazione
- **Stripe** per pagamenti e subscriptions
- **Vercel** per hosting e deploy

### Architettura
- **Clean Architecture** (Domain, Application, Infrastructure)
- **Ports & Adapters** per modularità
- **Event-Driven** per comunicazione tra moduli
- **Result/Option Types** per gestione errori

## 📁 Struttura del Progetto

```
src/
├── modules/                    # Bounded Contexts (Moduli)
│   ├── auth/                   # Autenticazione e gestione utenti
│   ├── permissions/            # RBAC e pacchetti
│   ├── games/                  # Tipi di gioco (Roulette, Blackjack)
│   ├── methods/                # Metodi di betting (Fibonacci, Martingale)
│   ├── sessions/               # Gestione sessioni di gioco
│   ├── analytics/              # Dashboard e reportistica
│   └── payments/               # Subscriptions e billing
├── shared/                     # Codice condiviso
│   ├── domain/                 # Tipi e contratti condivisi
│   ├── infrastructure/         # Utilities e configurazioni
│   └── ui/                     # Componenti UI riutilizzabili
└── app/                        # Next.js App Router
```

## 🎯 Moduli Implementati (Contratti)

### 1. **AUTH MODULE**
- Integrazione Clerk per autenticazione
- Sync utenti con database locale
- Gestione sessioni e profili

### 2. **PERMISSIONS MODULE**
- Sistema granulare di permessi
- Pacchetti Free e Premium
- Access control per features

### 3. **GAMES MODULE**
- Roulette Europea (implementata)
- Configurazioni gioco estensibili
- Validazione risultati di gioco

### 4. **METHODS MODULE**
- **Interfaccia Standardizzata** per tutti i metodi:
  ```typescript
  interface MethodInput/MethodOutput
  ```
- Fibonacci (Free tier)
- Martingale, Paroli, D'Alembert (Premium)

### 5. **SESSIONS MODULE**
- Creazione e gestione sessioni
- Tracking bets e progressioni
- Pause/Resume functionality

### 6. **ANALYTICS MODULE**
- Dashboard utente personalizzate
- Performance tracking per metodi
- Export dati in vari formati

### 7. **PAYMENTS MODULE**
- Integrazione Stripe completa
- Subscription management
- Webhook processing

## 🎨 Design System Casino

### Palette Colori
- **Casino Gold**: `#ffb700` - Lusso e prestigio
- **Casino Green**: `#16a34a` - Tavolo da gioco
- **Casino Red**: `#dc2626` - Accent dinamici
- **Casino Dark**: Gradienti scuri per profondità

### Componenti Premium
- **CasinoCard**: Cards luxury con glassmorphism
- **MoneyDisplay**: Formattazione italiana valuta
- **RouletteWheel**: Ruota animata interattiva

### Animazioni
- Hover effects sottili
- Transizioni fluide 300ms
- Effetti glow per elementi premium
- Spin animations per roulette

## 🗄️ Database Schema

### Moduli Principali
- **Users**: Gestione utenti e Clerk sync
- **Packages/Permissions**: Sistema RBAC
- **GameTypes/Methods**: Configurazioni gioco
- **Sessions/Bets**: Tracking gameplay
- **Subscriptions/Payments**: Billing Stripe

### Features
- **Relazioni ottimizzate** per performance
- **Enums TypeScript-safe** per status
- **JSON fields** per configurazioni flessibili
- **Audit trails** per compliance

## 🚀 Cloud-First Development Setup

### **Opzione 1: GitHub Codespaces (Raccomandato)**

```bash
# 1. Apri GitHub repository
# 2. Clicca "Code" → "Codespaces" → "Create codespace"
# 3. L'ambiente si configura automaticamente con devcontainer.json
# 4. Esegui i comandi di setup:

npm install
npm run db:generate
npm run dev  # Server automaticamente su porta forwarded
```

### **Opzione 2: Vercel Development**

```bash
# 1. Collega repository a Vercel
# 2. Deploy automatico ad ogni push su main
# 3. Ambiente identico a produzione
# 4. Live URL immediato
```

## 🔧 Comandi Disponibili

```bash
# Sviluppo Cloud
npm run dev              # Server sviluppo (auto-forwarded in Codespaces)
npm run build           # Build produzione (identico a Vercel)
npm run lint            # Controllo codice
npm run type-check      # Verifica TypeScript

# Database Cloud (Neon)
npm run db:generate     # Genera Prisma client
npm run db:push         # Aggiorna schema su Neon
npm run db:seed         # Popola dati iniziali
npm run db:studio       # Prisma Studio (forwarded port 5555)

# Testing & CI/CD
npm test               # Test (eseguiti anche in GitHub Actions)
npm run test:watch     # Test in watch mode
npm run test:coverage  # Report coverage
```

## 🌐 Cloud Infrastructure

### **Live URLs**
- **Production**: `https://vantaggio-statistico.vercel.app` (dopo setup)
- **Preview**: Auto-generato per ogni PR
- **Codespaces**: Port forwarding automatico

### **Services Integrati**
- **Database**: Neon PostgreSQL serverless
- **Auth**: Clerk.com authentication
- **Payments**: Stripe integration
- **CI/CD**: GitHub Actions → Vercel
- **Development**: GitHub Codespaces

## 📊 Metriche di Successo - Fase 1

✅ **Architettura**
- Moduli 100% indipendenti
- Zero dipendenze dirette tra bounded contexts
- Contratti stabili e documentati
- Clean Architecture implementata

✅ **UI/UX**
- Design casino premium implementato
- Componenti responsive e touch-friendly
- Animazioni fluide e realistiche
- Sistema colori coerente

✅ **Database**
- Schema completo per tutti i moduli
- Seed data per sviluppo
- Ottimizzazioni performance
- Type safety completa

## 🔄 Prossimi Passi (Fase 2)

### Week 3-5: Game Engine & Auth Implementation
1. **Implementazione Auth Module** con Clerk
2. **Sistema Permissions** granulare
3. **Roulette Engine** funzionante
4. **Metodo Fibonacci** operativo

### Priorità
- Configurazione environment variabili
- Setup database su Neon
- Integrazione Clerk authentication
- Primo metodo betting funzionante

---

## 👥 Team Development

Questo progetto segue una **architettura modulare rigorosa** dove ogni sviluppatore può lavorare su moduli indipendenti senza conflitti.

### Regole Architetturali
- **ZERO dipendenze** dirette tra moduli
- Comunicazione **SOLO tramite contratti**
- **Event-driven** per operazioni asincrone
- **Ports & Adapters** per integrazioni esterne

---

**🎰 Vantaggio Statistico** - *Where Mathematics Meets Casino Strategy*

*Powered by Next.js 15, TypeScript, and Premium Casino UX Design*