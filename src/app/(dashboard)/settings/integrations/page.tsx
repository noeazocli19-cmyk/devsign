import { CheckCircle2, CircleDashed, Wallet, Mail, MessageCircle, Cloud, Slack, NotebookPen, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Paramètres — Intégrations" };

export default function IntegrationsSettingsPage() {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const saaspayConfigured = Boolean(process.env.SAASPAY_API_URL && process.env.SAASPAY_API_KEY && process.env.SAASPAY_SECRET_KEY);

  const INTEGRATIONS = [
    {
      icon: Wallet,
      name: "SaaSPay",
      description: "Encaissez les acomptes de vos clients directement depuis l'espace client.",
      configured: saaspayConfigured,
      activeLabel: "Connecté — mode production",
      inactiveLabel: "Mode simulation (clés non configurées)",
      soon: false,
    },
    {
      icon: Mail,
      name: "Resend",
      description: "Emails transactionnels : contrat envoyé, signature, paiement, rappels.",
      configured: resendConfigured,
      activeLabel: "Connecté",
      inactiveLabel: "Mode développement (emails journalisés)",
      soon: false,
    },
    {
      icon: MessageCircle,
      name: "WhatsApp",
      description: "Partagez vos contrats avec un message prérempli professionnel.",
      configured: true,
      activeLabel: "Actif",
      inactiveLabel: "",
      soon: false,
    },
    {
      icon: PenLine,
      name: "Signature avancée",
      description: "Certification eIDAS et horodatage qualifié.",
      configured: false,
      activeLabel: "",
      inactiveLabel: "",
      soon: true,
    },
    {
      icon: Cloud,
      name: "Google Drive",
      description: "Sauvegarde automatique de vos contrats dans le Drive.",
      configured: false,
      activeLabel: "",
      inactiveLabel: "",
      soon: true,
    },
    {
      icon: Slack,
      name: "Slack",
      description: "Notifications de signature et paiement dans votre canal d'équipe.",
      configured: false,
      activeLabel: "",
      inactiveLabel: "",
      soon: true,
    },
    {
      icon: NotebookPen,
      name: "Notion",
      description: "Synchronisez vos clients et projets avec vos bases Notion.",
      configured: false,
      activeLabel: "",
      inactiveLabel: "",
      soon: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {INTEGRATIONS.map((integration) => (
        <Card key={integration.name} className={integration.soon ? "opacity-70" : undefined}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <integration.icon className="h-5 w-5 text-foreground" />
              </span>
              {integration.soon ? (
                <Badge variant="outline" className="text-zinc-500">Bientôt</Badge>
              ) : integration.configured ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {integration.activeLabel}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <CircleDashed className="h-3.5 w-3.5" />
                  {integration.inactiveLabel}
                </span>
              )}
            </div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <CardDescription>{integration.description}</CardDescription>
          </CardHeader>
          {!integration.soon && (
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {integration.name === "SaaSPay" && "Configurez SAASPAY_API_URL, SAASPAY_API_KEY et SAASPAY_SECRET_KEY dans les variables d'environnement pour activer le mode production."}
                {integration.name === "Resend" && "Configurez RESEND_API_KEY et RESEND_FROM_EMAIL pour activer l'envoi réel d'emails."}
                {integration.name === "WhatsApp" && "Aucune configuration requise — le bouton de partage prépare automatiquement le message."}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
