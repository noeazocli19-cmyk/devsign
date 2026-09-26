import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité — DevSign",
  description:
    "Politique de confidentialité DevSign : données collectées, finalités, base légale, durée de conservation, partage avec SaaSPay et Resend, sécurité, vos droits (accès, rectification, suppression).",
  alternates: { canonical: "/politique-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      description="Cette politique explique quelles données DevSign collecte, pourquoi, combien de temps elles sont conservées et quels sont vos droits. Nous appliquons une logique de minimisation : pas de revente, pas de publicité, pas de données superflues."
    >
      <LegalSection id="responsable" title="1. Responsable du traitement">
        <p>
          Le responsable du traitement est l&apos;éditeur de DevSign, identifié dans les{" "}
          <a href="/mentions-legales" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
            mentions légales
          </a>
          . Contact pour toute question relative aux données : <span className="font-mono text-foreground">privacy@devsign.app</span>.
        </p>
      </LegalSection>

      <LegalSection id="donnees-collectees" title="2. Données collectées">
        <LegalList
          items={[
            <>
              <strong>Compte Utilisateur</strong> : nom, adresse email, mot de passe (haché, jamais lisible), photo de profil éventuelle, profession, informations d&apos;entreprise (nom, logo, couleur, devise) que vous renseignez.
            </>,
            <>
              <strong>Connexion Google</strong> : si vous utilisez « Continuer avec Google », nous recevons de Google votre nom, votre email et votre photo de profil. Aucun mot de passe Google n&apos;est transmis à DevSign.
            </>,
            <>
              <strong>Données d&apos;activité</strong> : clients, projets, contrats et leur contenu (objets, montants, livrables), signatures, paiements, notifications, journal d&apos;activité et de relances.
            </>,
            <>
              <strong>Données des clients finaux (sans compte)</strong> : nom, email, téléphone éventuel fournis par l&apos;Utilisateur ; nom du signataire, adresse IP, navigateur (user-agent), date et identifiant de signature ; montant et référence de transaction.
            </>,
            <>
              <strong>Données techniques</strong> : journaux de connexion (logs), préférences de thème, identifiant de session (cookie essentiel).
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="finalites" title="3. Finalités et bases légales">
        <LegalList
          items={[
            <>
              <strong>Fournir le service</strong> (comptes, contrats, signature, paiements, notifications) — exécution du contrat qui nous lie à l&apos;Utilisateur.
            </>,
            <>
              <strong>Sécurité et preuve</strong> (métadonnées de signature, journaux, détection d&apos;abus) — intérêt légitime à la sécurité et à la valeur probatoire des contrats.
            </>,
            <>
              <strong>Communications liées au service</strong> (contrat envoyé, signature, acompte reçu, rappels de signature) — exécution du contrat ; chaque email contient un lien de désinscription pour les messages non essentiels.
            </>,
            <>
              <strong>Facturation des abonnements</strong> (plans Gratuit, Pro à 2 000 FCFA/mois, Agency à 6 000 FCFA/mois) — exécution du contrat et obligation légale comptable.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="destinataires" title="4. Destinataires et sous-traitants">
        <p>Nous ne vendons aucune donnée. Les seuls tiers impliqués sont :</p>
        <LegalList
          items={[
            <>
              <strong>SaaSPay</strong> (paiements) : traite les transactions d&apos;acomptes et d&apos;abonnements ; reçoit les données strictement nécessaires au paiement (montant, référence, email du payeur).
            </>,
            <>
              <strong>Resend</strong> (emails transactionnels) : envoie les emails liés au service en notre nom.
            </>,
            <>
              <strong>Google</strong> (connexion sociale) : uniquement si vous choisissez « Continuer avec Google », selon les règles de confidentialité de Google.
            </>,
            <>
              <strong>Hébergeur et base de données</strong> (ex. Vercel, Neon PostgreSQL) : stockage et exécution de l&apos;application, au sein de centres de données sécurisés.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="conservation" title="5. Durées de conservation">
        <LegalList
          items={[
            "Compte et données d'activité : pendant toute la durée d'utilisation, puis 12 mois après clôture (export possible avant suppression définitive).",
            "Métadonnées de signature et preuves associées : 10 ans après la signature, pour la valeur probatoire des contrats.",
            "Documents comptables et facturations : durée légale applicable (généralement 10 ans).",
            "Journaux techniques : 12 mois maximum.",
          ]}
        />
      </LegalSection>

      <LegalSection id="securite" title="6. Sécurité">
        <p>
          Nous appliquons des mesures proportionnées : mots de passe hachés (scrypt), sessions chiffrées httpOnly, contrôle d&apos;accès systématique à chaque requête (vérification de propriété des ressources), validation stricte des entrées, webhook de paiement authentifié par signature HMAC et idempotent, secrets exclusivement côté serveur, chiffrement en transit (HTTPS) et au repos au niveau de l&apos;hébergement.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="7. Cookies">
        <p>
          DevSign utilise uniquement des cookies strictement nécessaires : session d&apos;authentification (<span className="font-mono">better-auth.session_token</span>) et préférences d&apos;affichage. Aucun cookie publicitaire ni traceur tiers. Le consentement n&apos;est donc pas requis pour ces cookies essentiels.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="8. Vos droits">
        <p>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Pour les clients finaux, les demandes doivent être adressées en priorité à l&apos;Utilisateur (prestataire) qui nous a transmis vos données ; nous l&apos;accompagnons dans le traitement de votre demande.
        </p>
        <p>
          Pour exercer vos droits : <span className="font-mono text-foreground">privacy@devsign.app</span> — réponse sous 30 jours maximum. Vous pouvez également saisir l&apos;autorité de protection des données compétente de votre pays.
        </p>
      </LegalSection>

      <LegalSection id="transferts" title="9. Transferts internationaux">
        <p>
          Selon l&apos;hébergement retenu, les données peuvent être traitées hors de votre pays de résidence. Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types, mesures de chiffrement) afin d&apos;assurer un niveau de protection équivalent.
        </p>
      </LegalSection>

      <LegalSection id="mineurs" title="10. Mineurs et évolutions">
        <p>
          Le service est destiné aux professionnels majeurs et n&apos;est pas conçu pour les mineurs. Cette politique peut évoluer ; toute modification substantielle vous sera signalée (notification ou email) et la version en vigueur reste consultable sur cette page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
