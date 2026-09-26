import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — DevSign",
  description:
    "Conditions générales d'utilisation de DevSign : compte, abonnements (2 000 / 6 000 FCFA par mois), signature électronique, paiements SaaSPay, responsabilités et résiliation.",
  alternates: { canonical: "/conditions-utilisation" },
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      description="Les présentes conditions régissent l'accès et l'utilisation de la plateforme DevSign. En créant un compte ou en utilisant le service, vous les acceptez sans réserve."
    >
      <LegalSection id="definitions" title="1. Définitions">
        <LegalList
          items={[
            <>
              <strong>« DevSign »</strong>, « nous » : la plateforme SaaS de gestion de contrats, signature électronique et encaissement d&apos;acomptes, éditée et hébergée conformément aux mentions légales.
            </>,
            <>
              <strong>« Utilisateur »</strong>, « vous » : le professionnel (développeur, freelance, agence) titulaire d&apos;un compte DevSign.
            </>,
            <>
              <strong>« Client final »</strong> : la personne à qui l&apos;Utilisateur adresse un lien de contrat DevSign ; elle consulte, signe et paie <strong>sans créer de compte</strong>.
            </>,
            <>
              <strong>« Contrat »</strong> : tout document de prestation créé sur DevSign (proposition, devis, contrat de prestation).
            </>,
            <>
              <strong>« SaaSPay »</strong> : le prestataire de paiement traitant les transactions d&apos;acomptes. DevSign n&apos;est pas un établissement de paiement : les fonds sont traités par SaaSPay.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="objet" title="2. Objet du service">
        <p>
          DevSign permet de créer des contrats de prestation professionnels, de les envoyer via un lien unique, d&apos;obtenir la signature électronique du client final, d&apos;encaisser un acompte via SaaSPay et de suivre l&apos;état des projets (de la création au lancement automatique après paiement). Le service est accessible depuis <span className="font-mono text-foreground">devsign.app</span>, sur navigateur web (ordinateur et mobile).
        </p>
      </LegalSection>

      <LegalSection id="compte" title="3. Compte Utilisateur">
        <LegalList
          ordered
          items={[
            "L'inscription nécessite une adresse email valide et un mot de passe conforme aux exigences de sécurité affichées ; la connexion via un compte Google (« Continuer avec Google ») est également proposée.",
            "Vous vous engagez à fournir des informations exactes et à les maintenir à jour (identité, entreprise, coordonnées).",
            "Vos identifiants sont personnels et confidentiels ; vous êtes responsable de toute activité réalisée via votre compte.",
            "Le service est réservé aux personnes majeures agissant dans un cadre professionnel.",
          ]}
        />
      </LegalSection>

      <LegalSection id="abonnements" title="4. Abonnements et tarifs">
        <p>DevSign propose trois formules mensuelles, sans engagement de durée :</p>
        <LegalList
          items={[
            <>
              <strong>Gratuit — 0 FCFA</strong> : 3 contrats par mois, modèles basiques, signature électronique, espace client.
            </>,
            <>
              <strong>Pro — 2 000 FCFA / mois</strong> : contrats illimités, modèles personnalisés, branding de l&apos;espace client, rappels automatiques, analytics avancés, paiements SaaSPay intégrés, historique et PDF.
            </>,
            <>
              <strong>Agency — 6 000 FCFA / mois</strong> : toutes les fonctionnalités Pro, plusieurs membres d&apos;équipe, plusieurs marques (white-label), gestion d&apos;équipe et rôles, support prioritaire.
            </>,
          ]}
        />
        <p>
          Les abonnements payants sont facturés à l&apos;avance, chaque mois, via notre prestataire de paiement SaaSPay, en franc CFA (FCFA/XOF). Le renouvellement est automatique et peut être interrompu à tout moment depuis les paramètres de facturation ; l&apos;arrêt prend effet à la fin de la période en cours, sans remise au prorata. Toute modification de tarif sera communiquée au moins 30 jours à l&apos;avance et ne s&apos;appliquera qu&apos;aux périodes ultérieures.
        </p>
      </LegalSection>

      <LegalSection id="signature" title="5. Valeur juridique de la signature électronique">
        <p>
          DevSign met en œuvre un processus de signature électronique conforme aux exigences d&apos;un consentement fiable : identification du signataire (nom saisi, adresse IP, user-agent), horodatage de chaque action, identifiant unique de signature, journal des événements (envoi, ouverture, signature, paiement) et conservation des preuves associées au contrat.
        </p>
        <p>
          Conformément à la réglementation applicable (notamment, pour l&apos;espace UEMOA/OHADA, l&apos;Acte uniforme relatif au droit commercial général et aux législations nationales reconnaissant la signature électronique, ainsi que, pour l&apos;Union européenne, le règlement eIDAS n° 910/2014), la signature recueillie via DevSign présente une valeur probatoire reconnue, sous réserve de l&apos;appréciation souveraine des tribunaux. Le document signé et ses métadonnées sont téléchargeables en PDF à tout moment.
        </p>
      </LegalSection>

      <LegalSection id="paiements" title="6. Paiements et acomptes">
        <LegalList
          ordered
          items={[
            "Les acomptes de vos clients finaux sont encaissés par SaaSPay, prestataire de paiement indépendant. DevSign ne détient jamais les fonds.",
            "Une confirmation de paiement n'est validée qu'après vérification côté serveur (webhook SaaSPay authentifié et idempotent). Aucun statut n'est déduit du seul navigateur.",
            "En cas de paiement échoué, le client final peut réessayer depuis son espace de consultation ; une notification est adressée à l'Utilisateur.",
            "Les éventuels litiges de paiement (rétrofacturation, remboursement) relèvent des règles de SaaSPay et de la relation commerciale entre l'Utilisateur et son client final ; DevSign les accompagne en fournissant les preuves de signature.",
          ]}
        />
      </LegalSection>

      <LegalSection id="engagements" title="7. Engagements des Utilisateurs">
        <p>Vous vous engagez notamment à :</p>
        <LegalList
          items={[
            "n'utiliser DevSign que pour des contrats licites et un contenu qui vous appartient ou que vous êtes autorisé à utiliser ;",
            "ne pas porter atteinte à la sécurité de la plateforme (intrusion, scraping massif, ingénierie inverse, contournement des contrôles d'accès) ;",
            "respecter les droits de vos clients finaux et la réglementation applicable à votre activité (mentions obligatoires, TVA, facturation) ;",
            "ne pas utiliser le service pour envoyer du spam ou des contenus illicites, diffamatoires ou trompeurs.",
          ]}
        />
      </LegalSection>

      <LegalSection id="responsabilite" title="8. Responsabilité">
        <p>
          DevSign fournit le service « en l&apos;état » avec une diligence professionnelle, sans garantie d&apos;ininterrompitude absolue. Notre responsabilité, toutes causes confondues, est limitée au montant des abonnements versés par l&apos;Utilisateur au cours des douze (12) derniers mois. DevSign n&apos;est pas responsable : du contenu des contrats créés par les Utilisateurs ; des litiges commerciaux entre un Utilisateur et son client final ; des dysfonctionnements imputables à des tiers (SaaSPay, opérateurs réseau, hébergeurs) ; de la perte de données non signalée dans les 30 jours suivant l&apos;incident.
        </p>
      </LegalSection>

      <LegalSection id="proprietes" title="9. Propriété intellectuelle">
        <p>
          La plateforme (logiciel, interface, modèles fournis, marque DevSign, logo) est protégée par le droit de la propriété intellectuelle. Vous conservez l&apos;intégralité des droits sur vos contrats et données ; vous nous accordez uniquement la licence technique nécessaire à l&apos;hébergement et au fonctionnement du service. Les modèles de contrats proposés par DevSign sont fournis à titre indicatif et ne constituent pas un conseil juridique ; il vous appartient de les faire valider par un professionnel du droit pour votre situation.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="10. Données personnelles">
        <p>
          Le traitement de vos données et de celles de vos clients finaux est décrit dans notre{" "}
          <a href="/politique-confidentialite" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
            Politique de confidentialité
          </a>
          . DevSign applique le principe de minimisation : seules les données nécessaires au service sont collectées et conservées.
        </p>
      </LegalSection>

      <LegalSection id="disponibilite" title="11. Disponibilité et support">
        <p>
          Nous visons une disponibilité élevée du service (objectif indicatif de 99 % mensuel, hors maintenance planifiée et force majeure). Le support est assuré par email à <span className="font-mono text-foreground">support@devsign.app</span> ; le plan Agency bénéficie d&apos;un traitement prioritaire.
        </p>
      </LegalSection>

      <LegalSection id="resiliation" title="12. Résiliation">
        <LegalList
          items={[
            "Vous pouvez clôturer votre compte à tout moment depuis les paramètres ; vos contrats en cours restent accessibles en export jusqu'à la clôture effective.",
            "Nous pouvons suspendre ou résilier un compte en cas de violation des présentes conditions, après notification et sans effet immédiat si la violation est corrigeable dans un délai raisonnable de 7 jours.",
            "En cas de résiliation, les périodes déjà payées ne sont pas remboursées, sauf disposition légale impérative contraire.",
          ]}
        />
      </LegalSection>

      <LegalSection id="modifications" title="13. Modifications des conditions">
        <p>
          Les présentes conditions peuvent être modifiées pour refléter l&apos;évolution du service ou de la réglementation. Les Utilisateurs sont informés par email au moins 15 jours avant l&apos;entrée en vigueur ; la poursuite de l&apos;utilisation vaut acceptation. La version applicable est celle consultable à tout moment sur cette page.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="14. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit applicable au siège de l&apos;éditeur (voir mentions légales). En cas de litige, une solution amiable sera recherchée en priorité (contact : <span className="font-mono text-foreground">legal@devsign.app</span>) ; à défaut, les tribunaux compétents seront saisis conformément aux règles de procédure applicables.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
