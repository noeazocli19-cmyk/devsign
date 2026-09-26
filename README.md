# DevSign

> **Signez vos contrats. Recevez votre acompte. Lancez vos projets.**
> **Du premier message à l'acompte payé. Un seul lien.**

DevSign est un SaaS complet de gestion de contrats pour développeurs, freelances et agences : créez un devis, générez un contrat professionnel, envoyez un lien unique à votre client — il consulte, **signe électroniquement**, paie l'**acompte via SaaSPay**, et votre projet passe automatiquement **« En cours »**.

---

## ⚡ Démarrage rapide

```bash
# 1. Installer les dépendances
pnpm install        # (ou bun install)

# 2. Configurer l'environnement
cp .env.example .env
# → renseigner DATABASE_URL au minimum (SQLite en dev, Neon PostgreSQL en prod)

# 3. Créer la base + données de démonstration
pnpm db:push
pnpm db:seed

# 4. Lancer
pnpm dev            # http://localhost:3000
```

### Comptes de démonstration (créés par le seed)

| Rôle  | Email               | Mot de passe |
|-------|---------------------|--------------|
| User  | `demo@devsign.app`  | `Demo1234!`  |
| Admin | `admin@devsign.app` | `Admin1234!` |

> Le seed crée 4 clients, 8 contrats couvrant **tous les statuts**, 6 paiements, 8 modèles de contrats, notifications, activités et relances. Ne jamais exécuter le seed en production.

---

## 🧭 Le parcours produit (golden path)

```
Prospect → Proposition → Devis → Contrat → Signature → Acompte (SaaSPay) → Projet lancé
```

1. **Créer un projet** — `/projects/new` : assistant 4 étapes (client → projet → devis avec lignes/remises/taxes → contrat). L'acompte est calculé automatiquement.
2. **Générer le contrat** — référence `DS-2026-000241`, livrables, délais, révisions, propriété intellectuelle, maintenance, annulation, zones de signature.
3. **Envoyer le lien unique** — `/c/8xK29p` : le client consulte **sans créer de compte**. Copier le lien, l'envoyer par WhatsApp (message pré-rempli) ou par email (Resend).
4. **Signature électronique** — nom + signature manuscrite (tactile/souris) ou saisie cursive, case d'acceptation, **métadonnées conservées** (ID de signature, date, IP, user-agent).
5. **Paiement de l'acompte** — checkout SaaSPay (simulation intégrée en dev), confirmation **serveur uniquement** via webhook idempotent.
6. **Projet lancé automatiquement** — dès signature + acompte confirmé : `WAITING_PAYMENT → IN_PROGRESS`, notifications et emails déclenchés, page de célébration « Tout est prêt ! » avec téléchargement du contrat PDF.
7. **Relances automatiques** — 24 h / 3 jours / 7 jours après envoi sans signature (annulées dès signature ou paiement).

---

## 🧱 Stack technique

| Domaine     | Technologie |
|-------------|-------------|
| Framework   | **Next.js 16** (App Router, Server Components par défaut) + **TypeScript 5** |
| UI          | **Tailwind CSS 4**, **shadcn/ui** (New York), Lucide Icons, **Framer Motion** (micro-interactions), next-themes (sombre/clair), sonner (toasts) |
| Base de données | **Prisma ORM** — SQLite en sandbox/dev, **Neon PostgreSQL** en production (1 ligne à changer) |
| Auth        | **Better Auth 1.7** — email/mot de passe, **« Continuer avec Google »** (OAuth), sessions 30 j, vérification email, mot de passe oublié, multi-hôte |
| Emails      | **Resend** — contrat envoyé, signature, paiement confirmé, rappels, bienvenue (fallback console sans clé API) |
| Paiements   | **SaaSPay** via couche d'abstraction `PaymentProvider` (jamais appelée directement) |
| Charts      | recharts (analytics) |

---

## 📁 Architecture du code

```text
src/
├── app/
│   ├── page.tsx                    # Landing (hero animé, problème, 4 étapes, tarifs, FAQ)
│   ├── (auth)/                     # /login /register /forgot-password /reset-password /verify-email
│   ├── conditions-utilisation/     # CGU (tarifs, signature électronique, SaaSPay…)
│   ├── politique-confidentialite/  # Politique de confidentialité (données, droits, cookies)
│   ├── mentions-legales/           # Mentions légales (éditeur, hébergeurs, contact)
│   ├── sitemap.ts · robots.ts      # SEO
│   ├── (dashboard)/                # App protégée : dashboard, projects, clients, contracts,
│   │                               # payments, templates, documents, analytics, notifications,
│   │                               # settings/*, admin
│   ├── onboarding/                 # Flow 4 étapes après inscription
│   ├── c/[contractId]/             # ESPACE CLIENT PUBLIC (sans compte) :
│   │                               # consultation, /pay, /success, /pdf
│   └── api/
│       ├── auth/[...all]/          # Better Auth handler
│       ├── auth-misc/              # forgot-password (devResetUrl en sandbox)
│       ├── clients/  projects/  contracts/  templates/
│       ├── notifications/  settings/  dev/reminders/
│       ├── public/                 # signature + paiements publics
│       └── webhooks/saaspay/       # ⚠️ webhook paiement sécurisé & idempotent
├── components/                     # ui/ (shadcn), shared/, dashboard/, projects/,
│                                   # clients/, contracts/, public/, auth/, marketing/
└── lib/
    ├── auth.ts                     # Config Better Auth (multi-hôte, sessions, vérifs)
    ├── db.ts                       # Client Prisma singleton
    ├── workflow.ts                 # ⭐ MOTEUR CENTRAL — seule source des transitions d'état
    ├── payments/                   # provider.ts (interface) + saaspay.ts (implémentation)
    ├── email/                      # sendEmail (Resend) + templates HTML FR
    ├── validations.ts              # Schémas Zod (toutes les entrées)
    ├── status.ts  format.ts  reference.ts  plans.ts  session.ts  api-utils.ts
prisma/
├── schema.prisma                   # 16 modèles + index (voir ci-dessous)
└── seed.ts                         # Données de démonstration (dev uniquement)
docs/DEPLOIEMENT.md                 # Guide de mise en production pas à pas
```

### Connexion « Continuer avec Google »

Le bouton est intégré sur `/login` et `/register` (composant `components/auth/google-button.tsx`). Il devient fonctionnel dès que les variables `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont définies. Configuration dans [Google Cloud Console](https://console.cloud.google.com/apis/credentials) :

1. Créer un projet → écran de consentement OAuth (type externe) → créer des identifiants **OAuth client ID** de type *Application Web*.
2. **Redirect URIs autorisés** :
   - `https://VOTRE-DOMAINE/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (dev)
3. Copier le Client ID / Secret dans `.env` → redémarrer.

Les nouveaux comptes Google passent par l'onboarding (`newUserCallbackURL`), et l'email reçu de Google est considéré vérifié.

### Le moteur workflow (`src/lib/workflow.ts`)

**Toutes** les transitions d'état passent par ce module — jamais de mutation manuelle de statut :

- `createFullContract(input)` — projet + client + contrat + lignes + relances programmées
- `sendContract(id, userId)` — `DRAFT → SENT` + email + 3 relances (24 h/3 j/7 j)
- `markContractViewed(publicId)` — `SENT → VIEWED` (idempotent) + notification
- `signContractPublic(publicId, …)` — signature + métadonnées + `→ SIGNED` + emails
- `createDepositPayment(contractId)` — référence `PAY-…` + checkout SaaSPay
- `processPaymentEvent(event, source)` — **IDEMPOTENT** : webhook ou simulation, jamais deux traitements du même événement ; `Payment SUCCESS` + acompte atteint ⇒ projet `IN_PROGRESS`
- `processDueReminders()` — envoie les relances arrivées à échéance
- `sendManualReminder(contractId, userId)` — relance manuelle

### Modèle de données (Prisma)

`User · Account · Session · Verification` (Better Auth) — `CompanyProfile` (marque) — `Client` — `Project` — `Contract` (+ `ContractItem`) — `ContractTemplate` — `Signature` — `Payment` — `Invoice` — `Notification` — `Activity` — `Reminder` — `ErrorLog`.

- Références lisibles : `DS-2026-000241`, `PAY-…`, `SIG-2026-…`, `SP-…`
- Lien public court aléatoire : `devsign.app/c/8xK29p`
- Index sur toutes les clés étrangères + statuts + `publicId` unique
- Montants en `Float` (FCFA sans centimes) avec devise (`XOF`, `EUR`, `USD`)

### Machine à états

| Contrat | Paiement | Projet |
|---|---|---|
| `DRAFT → SENT → VIEWED → SIGNED` (+ `EXPIRED`, `CANCELLED`) | `PENDING → PROCESSING → SUCCESS` (+ `FAILED`, `CANCELLED`, `REFUNDED`) | `DRAFT → WAITING_SIGNATURE → WAITING_PAYMENT → IN_PROGRESS → COMPLETED` (+ `CANCELLED`) |

---

## 💳 Paiements SaaSPay — règles d'implémentation

1. **Abstraction obligatoire** : `lib/payments/provider.ts` définit l'interface `PaymentProvider` ; `SaaSPayProvider` (`lib/payments/saaspay.ts`) est la seule implémentation. Le reste de l'app dépend de l'interface uniquement → changer de fournisseur sans refonte.
2. **Jamais d'appel direct** à SaaSPay ailleurs dans le code.
3. **Aucune confiance au front** : un paiement n'est confirmé que par le **webhook serveur** `/api/webhooks/saaspay` (signature HMAC vérifiée) ou par le mode simulation (désactivé dès qu'une vraie clé `SAASPAY_SECRET_KEY` est configurée).
4. **Idempotence** : chaque événement est traité au plus une fois (`processedAt` sur le paiement, relecture d'état). Les retries du provider sont sans effet.
5. **Mode simulation** (par défaut en dev) : le checkout `/c/{id}/pay` est une page de paiement simulée — le parcours complet reste testable sans compte SaaSPay.

---

## 🔐 Sécurité

- Mots de passe hachés par Better Auth (scrypt), sessions httpOnly 30 jours
- Vérification **d'origine multi-hôte** : `baseURL` dynamique + `allowedHosts` (`*.space-z.ai`, localhost, `BETTER_AUTH_ALLOWED_HOSTS` en production) — contrôle CSRF « Origin === Host »
- Validation **Zod** côté serveur sur 100 % des entrées API
- Autorisation systématique : chaque requête vérifie la **propriété de la ressource** (`userId`)
- Webhook SaaSPay : vérification de signature HMAC + idempotence
- Secrets uniquement côté serveur (jamais préfixés `NEXT_PUBLIC_`)
- Espace client public : accès par lien à fort entropie, aucune donnée tierce exposée
- Anti-énumération sur la réinitialisation de mot de passe

---

## 📧 Emails (Resend)

Templates HTML en français dans `src/lib/email/templates.ts` :

| Email | Déclencheur | Objet |
|---|---|---|
| `contract-sent` | envoi du contrat | 📄 Votre contrat attend votre signature |
| `contract-signed` | signature client | ✅ Contrat signé — {client} a signé ! |
| `payment-confirmed` | acompte reçu | 💰 Acompte reçu — {montant} encaissés |
| `reminder` | 24 h / 3 j / 7 j / manuelle | ⏰ Rappel : contrat en attente de signature |
| `welcome` | inscription | 🚀 Bienvenue sur DevSign |

Sans `RESEND_API_KEY` (dev), chaque email est journalisé dans la console (`[DEV:EMAIL]`) et les comptes sont auto-vérifiés — le produit reste testable de bout en bout.

---

## 🌍 Variables d'environnement

Voir **`.env.example`** (copier vers `.env`). Les clés critiques :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | SQLite (`file:./db/custom.db`) ou Neon (`postgresql://…`) |
| `BETTER_AUTH_SECRET` | Secret de signature des sessions (≥ 32 caractères) |
| `BETTER_AUTH_URL` | URL canonique en production (fallback multi-hôte) |
| `BETTER_AUTH_ALLOWED_HOSTS` | Domaines autorisés en prod : `devsign.app,*.devsign.app` |
| `NEXT_PUBLIC_APP_URL` | URL publique (liens contrats dans les emails) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Envoi réel des emails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Connexion « Continuer avec Google » (OAuth) — optionnel |
| `SAASPAY_API_URL` / `SAASPAY_API_KEY` / `SAASPAY_SECRET_KEY` | Paiements réels (absents ⇒ mode simulation) |

---

## 🚀 Mise en production

Guide complet pas à pas dans **`docs/DEPLOIEMENT.md`** (Neon + Vercel + Resend + SaaSPay).

En résumé :

1. Créer la base **Neon PostgreSQL** → `DATABASE_URL`
2. Dans `prisma/schema.prisma`, basculer `provider = "postgresql"` puis `bun run db:push` (ou `prisma migrate deploy`)
3. Déployer sur **Vercel** avec toutes les variables d'environnement
4. Configurer le webhook SaaSPay : `https://votre-domaine/api/webhooks/saaspay`
5. Vérifier le domaine dans **Resend** et renseigner `RESEND_FROM_EMAIL`
6. **Ne jamais exécuter le seed en production.**

---

## 🧪 Qualité & tests

```bash
pnpm lint          # ESLint — 0 erreur
pnpm exec tsc --noEmit   # TypeScript — 0 erreur
```

Points de test critiques (déjà couverts pendant le développement) :

- **Webhook idempotent** : rejouer un événement de paiement ⇒ aucun double traitement, aucun double email
- Parcours complet : inscription → onboarding → client → projet → contrat → envoi → signature → acompte → projet « En cours »
- Autorisation : accès sans session ⇒ 401/307 ; ressource d'autrui ⇒ 404
- Validation : payload invalide ⇒ 422 avec messages FR
- Machine à états : modification d'un contrat envoyé ⇒ 409

---

## 🗺️ Feuille de route (le socle est prêt)

- [ ] Factures (`Invoice` déjà modélisé) et reçus PDF
- [ ] Abonnements & plafonds du plan Gratuit (3 contrats/mois)
- [ ] Signature à 2 parties (prestataire + client)
- [ ] Créneaux de paiement multiples (jalons) au lieu d'un seul acompte
- [ ] Mini-CRM (étiquettes, pipeline prospects)
- [ ] Assistant IA de rédaction de contrat
- [ ] Multi-langues (i18n) et multi-devises avancé

---

## 📄 Licence

Projet privé — tous droits réservés. © 2026 DevSign
