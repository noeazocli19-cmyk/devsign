import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales — DevSign",
  description:
    "Mentions légales de DevSign : éditeur, directeur de la publication, hébergement (Vercel / Neon PostgreSQL), prestataires (SaaSPay, Resend), contact et propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      description="Informations légales relatives à l'éditeur de la plateforme DevSign, à son hébergement et à ses prestataires."
    >
      <LegalSection id="editeur" title="1. Éditeur de la plateforme">
        <LegalList
          items={[
            <>
              Dénomination : <strong>DevSign</strong>
            </>,
            <>
              Forme juridique : <span className="text-foreground">[à compléter — ex. SARL / SAS / Entreprise individuelle]</span>
            </>,
            <>
              Siège social : <span className="text-foreground">[à compléter — adresse complète]</span>
            </>,
            <>
              Immatriculation : <span className="text-foreground">[à compléter — RCCM / SIRET / identifiant fiscal]</span>
            </>,
            <>
              Directeur de la publication : <span className="text-foreground">[à compléter — nom du représentant légal]</span>
            </>,
            <>
              Contact : <span className="font-mono text-foreground">contact@devsign.app</span> · <span className="text-foreground">[téléphone facultatif]</span>
            </>,
          ]}
        />
        <p className="rounded-lg border bg-muted/40 p-4 text-sm">
          ℹ️ Les champs marqués « à compléter » doivent être renseignés avec les informations réelles de votre entreprise avant la mise en production — c&apos;est une obligation légale. Ce point figure dans le guide de déploiement.
        </p>
      </LegalSection>

      <LegalSection id="hebergement" title="2. Hébergement">
        <LegalList
          items={[
            <>
              Application : hébergée sur <strong>Vercel</strong> (Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis) ou tout hébergeur équivalent retenu par l&apos;éditeur.
            </>,
            <>
              Base de données : <strong>Neon PostgreSQL</strong> (Neon, Inc.) — bases chiffrées, sauvegardes automatiques.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="prestataires" title="3. Prestataires essentiels">
        <LegalList
          items={[
            <>
              <strong>SaaSPay</strong> — traitement des paiements (acomptes clients et abonnements DevSign). DevSign n&apos;accède jamais aux données bancaires complètes : elles sont saisies directement chez SaaSPay.
            </>,
            <>
              <strong>Resend</strong> — envoi des emails transactionnels (envoi de contrat, signature, confirmation de paiement, rappels).
            </>,
            <>
              <strong>Google</strong> — authentification sociale « Continuer avec Google » (OAuth 2.0), activée uniquement sur le choix de l&apos;utilisateur.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="propriete" title="4. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments de la plateforme (structure, code, textes, interface, marque DevSign, logo, modèles de contrats fournis) est protégé par le droit d&apos;auteur et le droit des marques. Toute reproduction ou exploitation sans autorisation écrite préalable est interdite. Les utilisateurs conservent l&apos;entière propriété de leurs propres contenus et contrats.
        </p>
      </LegalSection>

      <LegalSection id="acces" title="5. Accessibilité et compatibilité">
        <p>
          La plateforme est accessible 24 h/24, 7 j/7, sauf cas de force majeure, interruption programmée ou dysfonctionnement réseau. Elle est conçue pour fonctionner sur les navigateurs récents (Chrome, Edge, Firefox, Safari) sur ordinateur et mobile, selon une approche « mobile-first ». Conformément aux bonnes pratiques d&apos;accessibilité, les interfaces visent la conformité WCAG 2.1 niveau AA (contrastes, navigation clavier, libellés).
        </p>
      </LegalSection>

      <LegalSection id="signalement" title="6. Signalement">
        <p>
          Pour signaler tout contenu illicite, faille de sécurité ou problème d&apos;accessibilité, écrivez à <span className="font-mono text-foreground">legal@devsign.app</span> (contentieux/contenus) ou <span className="font-mono text-foreground">security@devsign.app</span> (failles — divulgation responsable). Nous nous engageons à accuser réception sous 72 heures.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
