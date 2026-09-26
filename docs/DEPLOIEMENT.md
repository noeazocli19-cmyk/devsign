# 🚀 DevSign — Guide de mise en production

Ce guide couvre le passage de l'environnement de développement (sandbox SQLite + paiements simulés) à une **production réelle** : Neon PostgreSQL, Vercel, Resend, SaaSPay.

---

## 1. Base de données — Neon PostgreSQL

1. Créer un projet sur [neon.tech](https://neon.tech) (région proche des utilisateurs, ex. `eu-central-1`).
2. Copier la **connection string** (`postgresql://user:pass@ep-xxx.neon.tech/devsign?sslmode=require`).

```bash
# Dans prisma/schema.prisma, changer UNE ligne :
#   provider = "sqlite"  →  provider = "postgresql"

export DATABASE_URL="postgresql://…neon.tech/devsign?sslmode=require"
bun run db:push        # crée les tables
# ou, avec l'historique de migrations :
bunx prisma migrate deploy
```

> ⚠️ **Ne jamais exécuter `bun run db:seed` en production** — il crée des comptes et des données de démonstration.

---

## 2. Secrets d'authentification

```bash
openssl rand -base64 32   # → BETTER_AUTH_SECRET
```

Dans `.env` (ou les variables Vercel) :

```env
BETTER_AUTH_SECRET=<sortie de openssl>
BETTER_AUTH_URL=https://devsign.app
BETTER_AUTH_ALLOWED_HOSTS=devsign.app,*.devsign.app
NEXT_PUBLIC_APP_URL=https://devsign.app
```

- `BETTER_AUTH_URL` fixe l'URL canonique (emails, redirections).
- `BETTER_AUTH_ALLOWED_HOSTS` liste les domaines servis (avec wildcards si besoin).

---

## 3. Emails — Resend

1. Créer un compte [resend.com](https://resend.com), ajouter et **vérifier le domaine** (DNS SPF/DKIM).
2. Créer une clé API → `RESEND_API_KEY`.
3. Expéditeur : `RESEND_FROM_EMAIL="DevSign <notifications@devsign.app>"`.

Dès que la clé est présente, le basculement est automatique : emails réels, vérification d'email activée à l'inscription, comptes non auto-vérifiés.

---

## 4. Paiements — SaaSPay

L'application ne dépend que de l'interface `PaymentProvider` (`src/lib/payments/provider.ts`). L'implémentation `SaaSPayProvider` (`src/lib/payments/saaspay.ts`) lit :

```env
SAASPAY_API_URL=https://api.saaspay.com        # selon la doc du provider
SAASPAY_API_KEY=pk_…
SAASPAY_SECRET_KEY=sk_…
```

**Tant que `SAASPAY_SECRET_KEY` est vide, l'app reste en mode simulation** (checkout de test intégré) — pratique pour la préprod.

Configurer dans le tableau de bord SaaSPay :

| Paramètre | Valeur |
|---|---|
| URL du webhook | `https://devsign.app/api/webhooks/saaspay` |
| Événements | `payment.success`, `payment.failed`, `payment.refunded` |
| Secret de signature | → `SAASPAY_SECRET_KEY` (vérification HMAC côté serveur) |

Garanties déjà implémentées dans `processPaymentEvent` :

- **Idempotence** : un événement rejoué (retry du provider) n'est traité qu'une fois ;
- **Vérification de signature** HMAC avant tout traitement ;
- **Aucune confiance au retour navigateur** : seul le webhook (ou la simulation) confirme un paiement ;
- Mise à jour en cascade : `Payment SUCCESS` + acompte atteint ⇒ projet `IN_PROGRESS` + notifications + emails.

---

## 5. Déploiement — Vercel

```bash
# Depuis le dépôt Git du projet (push d'abord)
vercel link
vercel env add DATABASE_URL production
vercel env add BETTER_AUTH_SECRET production
# … toutes les variables de .env.example
vercel --prod
```

Checklist avant le premier déploiement :

- [ ] `prisma/schema.prisma` → `provider = "postgresql"`
- [ ] Toutes les variables de `.env.example` renseignées en **production**
- [ ] `NEXT_PUBLIC_APP_URL` = domaine final (utilisé dans les emails)
- [ ] Domaine personnalisé ajouté dans Vercel + DNS
- [ ] Webhook SaaSPay pointant sur le domaine final
- [ ] Test de bout en bout : contrat → signature → acompte → projet « En cours »

---

## 6. Vérifications post-déploiement

1. **Inscription** : créer un compte réel → email de vérification reçu → onboarding.
2. **Parcours client** : créer un contrat → l'envoyer → ouvrir le lien public **en navigation privée** → signer → payer un vrai acompte (montant minimal) → vérifier :
   - email « Contrat signé » reçu,
   - webhook SaaSPay reçu (logs serveur),
   - projet passé `IN_PROGRESS`,
   - page `/c/{id}/success` avec téléchargement PDF.
3. **Idempotence** : rejouer manuellement un événement de paiement (dashboard SaaSPay) → aucun doublon de notification/email.
4. **Sécurité** : accéder à `/dashboard` sans session → redirection `/login` ; API sans session → 401.

---

## 7. Exploitation

- **Logs d'erreur** : table `ErrorLog` (visible dans `/admin`) — erreurs applicatives et emails en échec.
- **Sauvegardes** : Neon effectue des backups automatiques ; exporter régulièrement avec `pg_dump` si besoin.
- **Monitoring** : activer les intégrations Vercel (Sentry, Axiom…) — les hooks d'erreur centralisent déjà dans `logError()`.
- **Relances automatiques** : `processDueReminders()` s'exécute au chargement du dashboard et via `POST /api/dev/reminders`. Pour un déclenchement horaire autonome, ajouter un **Vercel Cron** :

```json
// vercel.json
{ "crons": [{ "path": "/api/dev/reminders", "schedule": "0 * * * *" }] }
```

> ⚠️ Cette route exige une session — pour un cron public, ajouter un en-tête secret partagé avant la mise en production.
