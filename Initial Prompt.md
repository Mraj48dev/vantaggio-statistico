## Idea Progettuale

# Claude Code Prompt: Vantaggio Statistico Platform

Create a comprehensive casino strategy platform called "Vantaggio Statistico" (Statistical Advantage) that guides casino players through statistically-driven decisions to maximize winning potential.

## Project Overview

Build a modular web application that helps casino players make informed betting decisions using proven statistical methods. The platform should start with roulette and be designed for easy expansion to other casino games and betting strategies.

## Core Requirements

### 1. Application Architecture
- Use a modern full-stack framework (preferably Next.js with TypeScript)
- Implement a modular, plugin-based architecture for easy game and strategy additions
- Use PostgreSQL for data persistence
- Implement proper authentication and authorization
- Create responsive design for desktop and mobile

### 2. Game System - Roulette (Initial Implementation)
- Support European Roulette (37 numbers: 0-36)
- Track game history and outcomes
- Real-time bet suggestions based on selected strategy
- Input validation for bets and game results

### 3. Strategy System (Plugin Architecture)
**Free Tier Strategy:**
- Fibonacci Method (base implementation)

**Premium Strategies to implement:**
- Paroli System
- Martingale System  
- D'Alembert System
- Labouchere System
- James Bond Strategy

**Strategy Interface Requirements:**
- Each strategy should be a separate module/plugin
- Common interface for: calculating next bet, managing progression, stop-loss logic
- Strategy-specific configuration options
- Historical performance tracking per strategy

### 4. User Management & Subscription System
- User registration/login with email verification
- Free tier: Access only to Fibonacci method
- Premium tier: Access to all strategies
- Subscription management (monthly/yearly plans)
- User profile management

### 5. Session Management
- Session creation with strategy selection
- Configure base bet amount and stop-loss limit
- Real-time bet calculation and suggestions
- Session history and statistics
- Ability to pause/resume sessions

### 6. Dashboard & Analytics
**User Dashboard:**
- Personal session history
- Win/loss statistics
- Strategy performance comparison
- Profit/loss tracking over time
- Active session management

**Aggregate Analytics (Public):**
- Platform-wide statistics (anonymized)
- Total euros won/lost across all users
- Most successful strategies
- Number of active sessions
- User engagement metrics

### 7. Admin Panel
**User Management:**
- View all user accounts and subscription status
- Access to all user sessions and bets for statistical analysis
- User activity monitoring

**Platform Management:**
- Enable/disable strategies
- Create discount codes and promotions
- Free trial activation
- Platform-wide analytics and reporting
- Strategy performance analysis

**Financial Management:**
- Revenue tracking
- Subscription analytics
- Refund processing

### 8. Database Schema Requirements

Design tables for:
- Users (id, email, subscription_tier, created_at, etc.)
- Sessions (id, user_id, game_type, strategy_id, base_bet, stop_loss, status, etc.)
- Bets (id, session_id, bet_amount, outcome, profit_loss, number_hit, etc.)
- Strategies (id, name, description, tier_required, is_active, etc.)
- Subscriptions (id, user_id, plan_type, status, start_date, end_date, etc.)

### 9. API Design
Create RESTful APIs for:
- Authentication endpoints
- User management
- Session management  
- Bet recording and suggestions
- Statistics and analytics
- Admin operations
- Subscription management

### 10. Security Requirements
- Secure password hashing
- JWT token management
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement
- GDPR compliance considerations

## Technical Implementation Details

### Frontend Requirements
- Clean, intuitive Italian UI (with English comments in code)
- Real-time updates for bet suggestions
- Interactive roulette wheel visualization
- Responsive charts for statistics
- Mobile-optimized interface

### Backend Requirements
- Robust error handling and logging
- Database migrations system
- Automated testing setup
- Environment-based configuration
- API documentation (OpenAPI/Swagger)

### Strategy Plugin System
Create an abstract Strategy class that all betting strategies must implement:
```typescript
interface BettingStrategy {
  calculateNextBet(history: BetHistory[], baseAmount: number): number;
  shouldStop(currentLoss: number, stopLoss: number): boolean;
  resetProgression(): void;
  getStrategyInfo(): StrategyMetadata;
}
```

### Deployment & DevOps
- Docker containerization
- Environment configuration for dev/staging/production
- Database backup strategy
- Monitoring and logging setup

## Key Features for Extensibility

1. **Game Plugin System**: Abstract game interface to easily add Blackjack, Poker, etc.
2. **Strategy Plugin System**: Modular strategy implementation for easy additions
3. **Configurable UI**: Component-based design for different game interfaces
4. **API Versioning**: Proper versioning for future mobile app development
5. **Event System**: For tracking user actions and triggering analytics

## Success Metrics to Track
- User registration and retention rates
- Strategy performance (win/loss ratios)
- Average session duration
- Subscription conversion rates
- User engagement with different strategies

## Phase 1 Deliverables
1. Complete roulette game implementation
2. Fibonacci strategy (free tier)
3. User authentication and basic dashboard
4. Admin panel basics
5. Subscription system foundation

Please implement this step by step, starting with the core architecture, database schema, and basic roulette functionality. Ensure the codebase is well-documented, tested, and ready for future expansions.

## Additional Notes
- All user-facing text should be in Italian
- Implement proper Italian number/currency formatting
- Consider Italian gambling regulations in the design
- Use modern CSS framework (Tailwind CSS recommended)
- Implement proper loading states and error messages
- Add Italian language validation messages

# Prompt di Kickoff – Vibe Coding (IT)

## Ruolo & Obiettivo
Agisci come **lead architect** e **code generator**.  
Genera uno scheletro di progetto pronto all’uso, con esempi concreti, basato su: **modular programming**, **Clean/Hexagonal Architecture (Ports & Adapters)**, **low coupling**, **high cohesion**, **immutabilità di default**, **errori come dati**, **composition root sottile** e **admin adapter per ogni modulo**.  

Prima di iniziare:
* **Individua e proponi lo stack tecnologico più adatto** (linguaggio, framework, tooling) in base alla descrizione del progetto.
* Tutto il codice deve contenere **commenti abbondanti e chiari**, per spiegare scelte architetturali, invarianti e motivazioni.
* Lo sviluppo deve avvenire **direttamente su GitHub**, garantendo **ambiente di sviluppo riproducibile e identico a quello di deploy** (ad esempio Vercel), evitando differenze tra locale e produzione.

---

## Requisiti Architetturali (vincolanti)

1. **Modular Monolith ben partizionato**  
   * Ogni modulo = **bounded context** con API interne stabili.  
   * **Alta coesione** interna, **basso accoppiamento** tra moduli.

2. **Clean / Architettura Esagonale**  
   * Strati: **domain**, **application**, **infrastructure**, **app (bootstrap/composition-root)**.  
   * **Ports (interfacce)** in domain e application; **Adapters** in infrastructure/edge.  
   * Il **composition root** avvia configurazione e wiring delle dipendenze — **nessuna logica di dominio**.

3. **Contratti e Tipi Ricchi**  
   * Modella invarianti con **value objects** o **ADT/union types**.  
   * Errori come dati (`Result`/`Either`, `Option`), senza eccezioni per flussi attesi.  
   * Pubblica **JSON Schema** o **OpenAPI** per tutte le interfacce esterne.

4. **Interfaccia di Amministrazione per Modulo (Admin Adapter)**  
   * Ogni modulo deve includere una **Admin Facade** che esponga:
     - `listUseCases()`
     - `validate(input)` (JSON Schema/OpenAPI)
     - `execute(useCase, input, { dryRun, idempotencyKey, sandbox })`
   * Fornisci **CLI** e **HTTP** (protetti) che delegano ai servizi applicativi del modulo.  
   * Supporto a **dry-run** e fixture/sandbox; log di tutte le azioni di admin per auditing.

5. **Testabilità & Qualità**  
   * Test obbligatori: **unit** (dominio), **contract/consumer** (porte), **integration** (adapters).  
   * Tutte le operazioni mutanti devono essere **idempotenti** e accettare `Idempotency-Key`.  
   * Pipeline CI pronta con lint/format e typecheck.

6. **Observability**  
   * Log strutturati, tracing opzionale, metriche di base.  
   * Endpoint di health e readiness.

7. **Sicurezza & Configurazione**  
   * Configurazione secondo i **12-factor**; nessun segreto nel repo.  
   * RBAC “admin” per gli adapter di amministrazione (pieno in dev/staging, limitato in prod).  
   * **Feature flag** per modifiche rischiose o migrazioni.

8. **Event-Driven (opzionale)**  
   * Quando serve, pubblica **eventi di dominio** dal layer application e documentali con AsyncAPI.

9. **Ambiente & Deploy**  
   * **Sviluppo diretto su GitHub** — niente setup “solo locale”.  
   * Fornisci ambiente di sviluppo **contenizzato o standardizzato** (Docker/Dev Containers, Nix, ecc.) per garantire **parità assoluta** tra GitHub Codespaces, sviluppo locale e deploy su Vercel o simili.

---

## Output Richiesto (in un’unica risposta)

### A. Struttura Cartelle (albero)
Mostra l’albero completo del progetto con almeno due moduli di esempio (es. `orders`, `payments`) e tutti i file chiave.

### B. File Chiave con Contenuto Reale
* `app/main.{ext}` – composition root sottile (config, DI, wiring, avvio HTTP/CLI).  
* `domain/**` – entità, value objects, porte, eventi di dominio.  
* `application/**` – use case che dipendono solo da porte.  
* `infrastructure/**` – adapter concreti (DB, HTTP client, queue, repository).  
* `admin/**` – Admin Facade per modulo + adapter CLI e HTTP.  
* `contracts/**` – JSON Schema/OpenAPI per input/output.  
* `tests/**` – unit + contract + integration.  
* `scripts/**` – seed/fixtures.  
* `observability/**` – logger, middleware tracing/metrics.  
* `README.md` – istruzioni per setup, uso di GitHub Codespaces/Vercel, comandi principali.  
* File di configurazione (es. `Dockerfile`, `docker-compose`, `devcontainer.json`) per garantire identità dell’ambiente.

### C. Esempi Concreti
1. **Use case** `PlaceOrder`  
   * Legge dati da porta `Carts`, chiama `Payments`, scrive su `Orders`.  
   * Restituisce `Result` tipizzato.  
   * Pubblica evento `OrderPlaced` (opzionale).  
2. **Admin Adapter** per `orders`  
   * CLI: `orders-admin execute PlaceOrder --input examples/place-order.json --dry-run`.  
   * HTTP: `POST /admin/orders/execute/PlaceOrder` con validazione schema.  
3. **Test**  
   * Unit test del dominio con casi limite.  
   * Contract test per la porta `Payments`.  
   * Integration test dell’admin HTTP con `dryRun`.  
4. **Observability**  
   * Log strutturati dell’esecuzione UC (input redatto, esito, latenza).

### D. Regole “Do/Don’t” (riassunto nel README)
* **Do:** interfacce stabili tra moduli, immutabilità di default, errori come dati, feature flag, ADR brevi, **commenti abbondanti e chiari nel codice**.  
* **Don’t:** logica nel `main`, dipendenze tra moduli tramite tipi concreti (usare porte), riflessione “magica” che riduce testabilità, o ambienti di sviluppo divergenti dal deploy.

---

## Parametri e Varianti (da compilare)
* Database/Storage: **{{DB}}** (oppure repo in-memory per demo).  
* Framework HTTP: **{{FRAMEWORK}}**.  
* Tooling: **{{TOOLING}}** (lint, formatter, test runner).  
* Packaging/Deploy: **{{DEPLOY}}** (facoltativo).

---

## Stile del Codice
* **Pulito e fortemente tipizzato**.  
* **Commenti abbondanti** che spieghino invarianti, motivazioni e decisioni architetturali.  
* Nomi espliciti, nessun boilerplate inutile.

---

## Criteri di Accettazione Automatici
* Il progetto **compila** e passa il **typecheck**.  
* `npm test` / `cargo test` / `pytest -q` → tutti i test verdi.  
* CLI e endpoint admin funzionano in **modalità dry-run**.  
* I moduli non importano mai classi concrete tra loro, solo **porte**.  
* Nessuna logica di dominio nel `main`.  
* Ambiente di sviluppo e di deploy (GitHub Codespaces / Vercel / locale) **identici e riproducibili**.

---

### Note Finali
Se una scelta è ambigua, preferisci **semplicità**, **testabilità** e **chiara separazione dei confini**.  
Mantieni contratti stabili: l’interno di ogni modulo può evolvere liberamente.  
Verifica sempre che l’ambiente GitHub (ad es. Codespaces) e quello di deploy (Vercel) siano **perfettamente allineati**.