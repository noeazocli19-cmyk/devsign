"use client";

// ─── Wizard de création de projet / contrat — 4 étapes ───────
// Client → Projet → Devis → Contrat, avec calculs live et validation.

import { Fragment, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Calculator,
  Check,
  FileText,
  FolderKanban,
  Loader2,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";

import { projectCreateSchema } from "@/lib/validations";
import { IP_OWNERSHIP, MAINTENANCE_TYPES, PROJECT_TYPES } from "@/lib/status";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ClientOption = { id: string; firstName: string; lastName: string; email: string; company: string | null };

export type WizardTemplate = {
  name: string;
  objectText: string | null;
  deliverables: string[];
  paymentTermsText: string | null;
  revisions: number;
  ipOwnership: string;
  maintenanceType: string;
  cancellationText: string | null;
};

type ItemRow = { name: string; quantity: string; unitPrice: string };

const STEPS = [
  { title: "Client", icon: User },
  { title: "Projet", icon: FolderKanban },
  { title: "Devis", icon: Calculator },
  { title: "Contrat", icon: FileText },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_ITEMS: ItemRow[] = [
  { name: "Design UI/UX", quantity: "1", unitPrice: "150000" },
  { name: "Développement", quantity: "1", unitPrice: "250000" },
];

const TEMPLATE_ITEMS: ItemRow[] = [
  { name: "Création UI/UX", quantity: "1", unitPrice: "100000" },
  { name: "Développement", quantity: "1", unitPrice: "350000" },
  { name: "Hébergement", quantity: "1", unitPrice: "50000" },
  { name: "SEO", quantity: "1", unitPrice: "100000" },
];

const DEFAULT_DELIVERABLES = ["Design", "Développement", "Responsive", "SEO", "Mise en ligne"];

const DEFAULT_CANCELLATION =
  "En cas d'annulation en cours de projet, les travaux réalisés jusqu'à la date d'annulation restent dus au prorata de l'avancement validé.";

function defaultObjectFor(type: string): string {
  switch (type) {
    case "SITE_VITRINE":
      return "Création d'un site vitrine professionnel comprenant la conception graphique, l'intégration des contenus fournis par le client, l'optimisation pour les moteurs de recherche et la mise en ligne.";
    case "ECOMMERCE":
      return "Réalisation d'une boutique en ligne complète : catalogue produits, tunnel de commande, paiement en ligne sécurisé et interface d'administration des commandes.";
    case "WEB_APP":
      return "Conception et développement d'une application web sur mesure, incluant les fonctionnalités définies avec le client et un tableau de bord d'administration.";
    case "MOBILE_APP":
      return "Conception et développement d'une application mobile (iOS et Android), incluant la publication sur l'App Store et Google Play.";
    case "SAAS":
      return "Développement d'un produit SaaS : architecture technique, authentification, système d'abonnements et tableau de bord administrateur.";
    case "MAINTENANCE":
      return "Prestation de maintenance : mises à jour de sécurité, sauvegardes régulières, supervision de disponibilité et correctifs de bugs.";
    case "DESIGN":
      return "Création de l'identité visuelle et des interfaces utilisateur, livrées en fichiers sources éditables.";
    default:
      return "Prestation de services numériques conformément au périmètre défini entre les parties, détaillé dans le présent contrat.";
  }
}

function termsFor(depositPercent: number): string {
  return `${depositPercent} % à la signature${depositPercent < 100 ? `, ${100 - depositPercent} % à la livraison` : ""}`;
}

export function ProjectWizard({
  clients,
  template,
  templateName,
}: {
  clients: ClientOption[];
  template: WizardTemplate | null;
  templateName: string | null;
}) {
  const router = useRouter();

  // ── Étape courante ──
  const [step, setStep] = useState(0);

  // ── Étape 1 : client ──
  const [clientMode, setClientMode] = useState<"existing" | "new">(clients.length > 0 ? "existing" : "new");
  const [existingClientId, setExistingClientId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  // ── Étape 2 : projet ──
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("SITE_VITRINE");
  const [startDate, setStartDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // ── Étape 3 : devis ──
  const [items, setItems] = useState<ItemRow[]>(template ? TEMPLATE_ITEMS.map((i) => ({ ...i })) : DEFAULT_ITEMS.map((i) => ({ ...i })));
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [depositPercent, setDepositPercent] = useState(50);

  // ── Étape 4 : contrat ──
  const [objectText, setObjectText] = useState(template?.objectText ?? defaultObjectFor("SITE_VITRINE"));
  const [deliverables, setDeliverables] = useState<string[]>(template?.deliverables?.length ? [...template.deliverables] : [...DEFAULT_DELIVERABLES]);
  const [revisions, setRevisions] = useState(String(template?.revisions ?? 2));
  const [paymentTermsText, setPaymentTermsText] = useState(template?.paymentTermsText ?? termsFor(50));
  const [ipOwnership, setIpOwnership] = useState(template?.ipOwnership ?? "TRANSFER_AFTER_FULL_PAYMENT");
  const [maintenanceType, setMaintenanceType] = useState(template?.maintenanceType ?? "NONE");
  const [maintenanceText, setMaintenanceText] = useState("");
  const [cancellationText, setCancellationText] = useState(template?.cancellationText ?? DEFAULT_CANCELLATION);
  const [submitting, setSubmitting] = useState(false);

  // Les textes auto-générés ne s'écrasent pas les saisies manuelles.
  const objectTouched = useRef(Boolean(template?.objectText));
  const termsTouched = useRef(Boolean(template?.paymentTermsText));

  // ── Calculs live du devis ──
  const calc = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const discountN = Math.max(0, Number(discount) || 0);
    const afterDiscount = Math.max(0, subtotal - discountN);
    const taxRateN = Math.min(50, Math.max(0, Number(taxRate) || 0));
    const taxAmount = Math.round(afterDiscount * taxRateN) / 100;
    const total = afterDiscount + taxAmount;
    const depositAmount = Math.round(total * depositPercent) / 100;
    const balance = Math.max(0, total - depositAmount);
    return { subtotal, discountN, taxRateN, taxAmount, total, depositAmount, balance };
  }, [items, discount, taxRate, depositPercent]);

  // ── Validation par étape ──
  const clientValid =
    clientMode === "existing"
      ? existingClientId !== ""
      : firstName.trim().length >= 2 && lastName.trim().length >= 2 && EMAIL_RE.test(email.trim());

  const projectValid = projectName.trim().length >= 2 && Boolean(PROJECT_TYPES[projectType]);

  const quoteValid =
    items.length >= 1 &&
    items.every((it) => it.name.trim().length >= 1 && (Number(it.quantity) || 0) > 0 && (Number(it.unitPrice) || 0) >= 0) &&
    calc.total >= 0;

  const contractValid = deliverables.some((d) => d.trim().length > 0);

  const stepValid = [clientValid, projectValid, quoteValid, contractValid][step];

  const selectedClient = clients.find((c) => c.id === existingClientId);

  // ── Navigation ──
  const goNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  // ── Items (devis) ──
  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const removeItem = (index: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  const addItem = () => setItems((prev) => [...prev, { name: "", quantity: "1", unitPrice: "0" }]);

  // ── Livrables ──
  const updateDeliverable = (index: number, value: string) =>
    setDeliverables((prev) => prev.map((d, i) => (i === index ? value : d)));
  const removeDeliverable = (index: number) => setDeliverables((prev) => prev.filter((_, i) => i !== index));
  const addDeliverable = () => setDeliverables((prev) => [...prev, ""]);

  // ── Soumission ──
  async function handleSubmit() {
    if (!clientValid || !projectValid || !quoteValid || !contractValid) {
      toast.error("Merci de compléter toutes les étapes avant de créer le contrat.");
      return;
    }

    const payload = {
      client:
        clientMode === "existing"
          ? { existingClientId }
          : {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              phone: phone.trim() || undefined,
              company: company.trim() || undefined,
            },
      project: {
        name: projectName.trim(),
        description: description.trim() || undefined,
        type: projectType,
        startDate: startDate || undefined,
        deliveryDate: deliveryDate || undefined,
      },
      quote: {
        items: items
          .filter((it) => it.name.trim())
          .map((it) => ({ name: it.name.trim(), quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 })),
        taxRate: calc.taxRateN,
        discount: calc.discountN,
        depositPercent,
      },
      contract: {
        objectText: objectText.trim() || undefined,
        deliverables: deliverables.map((d) => d.trim()).filter(Boolean),
        revisions: Math.max(0, Number(revisions) || 0),
        paymentTermsText: paymentTermsText.trim() || undefined,
        ipOwnership,
        maintenanceType,
        maintenanceText: maintenanceType === "CUSTOM" ? maintenanceText.trim() || undefined : undefined,
        cancellationText: cancellationText.trim() || undefined,
      },
    };

    // Validation zod complète avant envoi (garde de robustesse)
    const parsed = projectCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // Paywall : limite du plan Gratuit atteinte → proposer la mise à niveau
        if (json?.code === "PLAN_LIMIT_REACHED") {
          toast.error(json.error ?? "Limite du plan Gratuit atteinte (3 contrats/mois).", {
            duration: 10000,
            action: { label: "Passer Pro", onClick: () => router.push("/abonnement") },
          });
          router.push("/abonnement");
          return;
        }
        toast.error(json.error ?? "Impossible de créer le contrat. Réessayez.");
        return;
      }
      toast.success("Contrat créé avec succès 🎉");
      router.push(`/contracts/${json.data.id}`);
    } catch {
      toast.error("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {templateName && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            Modèle <strong className="font-semibold">{templateName}</strong> appliqué — les champs du contrat sont préremplis.
          </span>
        </div>
      )}

      {/* ── Stepper ── */}
      <nav aria-label="Étapes du wizard" className="rounded-xl border bg-card p-4 sm:p-5">
        <p className="mb-3 text-xs font-medium text-muted-foreground sm:hidden">
          Étape {step + 1} sur {STEPS.length}
        </p>
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const current = i === step;
            return (
              <Fragment key={s.title}>
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn("flex shrink-0 flex-col items-center gap-1.5 outline-none sm:flex-row sm:gap-2.5", i <= step ? "cursor-pointer" : "cursor-default")}
                  aria-current={current ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      done && "border-primary bg-primary text-primary-foreground",
                      current && "border-primary bg-emerald-50 text-primary ring-4 ring-emerald-100",
                      !done && !current && "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className={cn("text-[10px] font-medium sm:text-xs", current ? "text-foreground" : "text-muted-foreground")}>{s.title}</span>
                </button>
                {i < STEPS.length - 1 && <div className={cn("mx-1 h-px flex-1 sm:mx-2", i < step ? "bg-primary" : "bg-border")} aria-hidden />}
              </Fragment>
            );
          })}
        </div>
      </nav>

      {/* ── Étape courante ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-xl border bg-card p-5 sm:p-6"
        >
          {/* ═══ ÉTAPE 1 — CLIENT ═══ */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Qui est votre client ?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sélectionnez un client existant ou créez-en un nouveau.</p>
              </div>

              <RadioGroup value={clientMode} onValueChange={(v) => setClientMode(v as "existing" | "new")} className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    clientMode === "existing" ? "border-primary bg-emerald-50/60 ring-1 ring-primary/30" : "hover:bg-accent/50"
                  )}
                >
                  <RadioGroupItem value="existing" className="mt-0.5" disabled={clients.length === 0} />
                  <div className="space-y-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" aria-hidden /> Client existant
                    </span>
                    <span className="block text-xs text-muted-foreground">{clients.length > 0 ? `${clients.length} client(s) enregistré(s)` : "Aucun client enregistré"}</span>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    clientMode === "new" ? "border-primary bg-emerald-50/60 ring-1 ring-primary/30" : "hover:bg-accent/50"
                  )}
                >
                  <RadioGroupItem value="new" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" aria-hidden /> Nouveau client
                    </span>
                    <span className="block text-xs text-muted-foreground">Créer une nouvelle fiche client</span>
                  </div>
                </label>
              </RadioGroup>

              {clientMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="existing-client">Sélectionnez le client</Label>
                  <Select value={existingClientId} onValueChange={setExistingClientId}>
                    <SelectTrigger id="existing-client" className="w-full">
                      <SelectValue placeholder={clients.length > 0 ? "Choisir un client…" : "Aucun client disponible"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                          {c.company ? ` — ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClient && <p className="text-xs text-muted-foreground">Contact : {selectedClient.email}</p>}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Prénom *</Label>
                    <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Awa" autoComplete="given-name" />
                    {firstName.trim().length > 0 && firstName.trim().length < 2 && <p className="text-xs text-destructive">2 caractères minimum.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Nom *</Label>
                    <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Diop" autoComplete="family-name" />
                    {lastName.trim().length > 0 && lastName.trim().length < 2 && <p className="text-xs text-destructive">2 caractères minimum.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email *</Label>
                    <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="awa@exemple.com" autoComplete="email" inputMode="email" />
                    {email.trim().length > 0 && !EMAIL_RE.test(email.trim()) && <p className="text-xs text-destructive">Adresse email invalide.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Téléphone</Label>
                    <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" autoComplete="tel" inputMode="tel" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="client-company">Entreprise</Label>
                    <Input id="client-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ba Cosmetics (optionnel)" autoComplete="organization" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ ÉTAPE 2 — PROJET ═══ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">De quel projet s'agit-il ?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ces informations apparaissent dans le contrat et suivent le projet jusqu'à la livraison.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-name">Nom du projet *</Label>
                  <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Site vitrine Studio Kër" />
                  {projectName.trim().length > 0 && projectName.trim().length < 2 && <p className="text-xs text-destructive">2 caractères minimum.</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-type">Type de projet</Label>
                  <Select
                    value={projectType}
                    onValueChange={(v) => {
                      setProjectType(v);
                      if (!objectTouched.current) setObjectText(defaultObjectFor(v));
                    }}
                  >
                    <SelectTrigger id="project-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden sm:block" />
                <div className="space-y-2">
                  <Label htmlFor="start-date">Date de début</Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Date de livraison</Label>
                  <Input id="delivery-date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contexte, objectifs, périmètre… (optionnel)" rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* ═══ ÉTAPE 3 — DEVIS ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Construisons le devis</h2>
                <p className="mt-1 text-sm text-muted-foreground">Les montants sont calculés automatiquement, en FCFA.</p>
              </div>

              {/* Lignes de devis */}
              <div className="space-y-3">
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-xl border bg-muted/30 p-3 sm:grid-cols-[1fr_5rem_8rem_auto] sm:gap-3">
                    <div className="col-span-2 space-y-1.5 sm:col-span-1">
                      <Label htmlFor={`item-name-${i}`} className="text-xs text-muted-foreground">Prestation</Label>
                      <Input id={`item-name-${i}`} value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Ex. Développement front-end" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-qty-${i}`} className="text-xs text-muted-foreground">Qté</Label>
                      <Input id={`item-qty-${i}`} type="number" min="0.5" step="0.5" inputMode="decimal" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} className="text-right" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-price-${i}`} className="text-xs text-muted-foreground">Prix unitaire</Label>
                      <Input id={`item-price-${i}`} type="number" min="0" step="1000" inputMode="numeric" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} className="text-right" />
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1">
                      <span className="text-xs font-medium tabular-nums text-muted-foreground sm:hidden">
                        {formatAmount((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}
                      </span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length <= 1} aria-label={`Supprimer la ligne ${it.name || i + 1}`} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4" aria-hidden /> Ajouter une ligne
                </Button>
              </div>

              {/* Calculs */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <div className="grid grid-cols-2 items-end gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="discount" className="text-xs text-muted-foreground">Remise (FCFA)</Label>
                      <Input id="discount" type="number" min="0" step="1000" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tax-rate" className="text-xs text-muted-foreground">Taxes (%)</Label>
                      <Input id="tax-rate" type="number" min="0" max="50" step="0.5" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="text-right" />
                    </div>
                  </div>
                  <dl className="space-y-2 border-t pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Sous-total</dt>
                      <dd className="font-medium tabular-nums">{formatAmount(calc.subtotal)}</dd>
                    </div>
                    {calc.discountN > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Remise</dt>
                        <dd className="font-medium tabular-nums text-destructive">− {formatAmount(calc.discountN)}</dd>
                      </div>
                    )}
                    {calc.taxRateN > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Taxes ({calc.taxRateN} %)</dt>
                        <dd className="font-medium tabular-nums">{formatAmount(calc.taxAmount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <dt className="font-semibold">TOTAL</dt>
                      <dd className="text-lg font-bold tabular-nums text-primary">{formatAmount(calc.total)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="deposit" className="text-xs text-muted-foreground">Acompte à la signature</Label>
                      <span className="text-sm font-semibold tabular-nums text-primary">{depositPercent} %</span>
                    </div>
                    <Slider
                      id="deposit"
                      value={[depositPercent]}
                      onValueChange={(v) => {
                        const p = v[0] ?? 50;
                        setDepositPercent(p);
                        if (!termsTouched.current) setPaymentTermsText(termsFor(p));
                      }}
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Pourcentage d'acompte"
                    />
                    <p className="text-xs text-muted-foreground">Ajustez le pourcentage d'acompte demandé au client (0 à 100 %).</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t pt-3">
                    <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
                      <p className="text-xs font-medium text-emerald-700">Acompte ({depositPercent} %)</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-emerald-800">{formatAmount(calc.depositAmount)}</p>
                    </div>
                    <div className="rounded-lg bg-card p-3 ring-1 ring-border">
                      <p className="text-xs font-medium text-muted-foreground">Solde à la livraison</p>
                      <p className="mt-1 text-lg font-bold tabular-nums">{formatAmount(calc.balance)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ÉTAPE 4 — CONTRAT ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Le contrat</h2>
                <p className="mt-1 text-sm text-muted-foreground">Vérifiez et ajustez les clauses — tout est modifiable après création tant que le contrat est un brouillon.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="object-text">Objet du contrat</Label>
                <Textarea id="object-text" value={objectText} onChange={(e) => { setObjectText(e.target.value); objectTouched.current = true; }} rows={3} />
              </div>

              {/* Livrables */}
              <div className="space-y-2">
                <Label>Livrables</Label>
                <div className="space-y-2">
                  {deliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <Input value={d} onChange={(e) => updateDeliverable(i, e.target.value)} placeholder={`Livrable ${i + 1}`} aria-label={`Livrable ${i + 1}`} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDeliverable(i)} aria-label={`Supprimer le livrable ${i + 1}`} className="shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                  <Plus className="h-4 w-4" aria-hidden /> Ajouter un livrable
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="revisions">Révisions incluses</Label>
                  <Input id="revisions" type="number" min="0" max="10" inputMode="numeric" value={revisions} onChange={(e) => setRevisions(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip">Propriété intellectuelle</Label>
                  <Select value={ipOwnership} onValueChange={setIpOwnership}>
                    <SelectTrigger id="ip" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IP_OWNERSHIP).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="payment-terms">Conditions de paiement</Label>
                  <Input id="payment-terms" value={paymentTermsText} onChange={(e) => { setPaymentTermsText(e.target.value); termsTouched.current = true; }} />
                  <p className="text-xs text-muted-foreground">Générées selon l'acompte ({depositPercent} %) — modifiables librement.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance">Maintenance</Label>
                  <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                    <SelectTrigger id="maintenance" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MAINTENANCE_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {maintenanceType === "CUSTOM" && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-text">Détails de la maintenance</Label>
                    <Textarea id="maintenance-text" value={maintenanceText} onChange={(e) => setMaintenanceText(e.target.value)} placeholder="Décrivez la maintenance convenue…" rows={2} />
                  </div>
                )}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cancellation">Conditions d'annulation</Label>
                  <Textarea id="cancellation" value={cancellationText} onChange={(e) => setCancellationText(e.target.value)} rows={2} />
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-emerald-900">Récapitulatif</h3>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Client</dt>
                    <dd className="font-medium text-emerald-950">
                      {clientMode === "existing" && selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : `${firstName || "—"} ${lastName}`.trim()}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Projet</dt>
                    <dd className="font-medium text-emerald-950">{projectName || "—"} · {PROJECT_TYPES[projectType]}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Devis</dt>
                    <dd className="font-medium text-emerald-950">
                      {items.filter((i) => i.name.trim()).length} ligne(s) · TOTAL {formatAmount(calc.total)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Acompte / Solde</dt>
                    <dd className="font-medium text-emerald-950">
                      {formatAmount(calc.depositAmount)} / {formatAmount(calc.balance)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Livrables</dt>
                    <dd className="font-medium text-emerald-950">{deliverables.filter((d) => d.trim()).length} prévu(s) · {revisions} révision(s)</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-emerald-700/80">Maintenance</dt>
                    <dd className="font-medium text-emerald-950">{MAINTENANCE_TYPES[maintenanceType]}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
          Retour
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={!stepValid}>
            Continuer <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={!stepValid || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
            {submitting ? "Création…" : "Créer le contrat"}
          </Button>
        )}
      </div>
    </div>
  );
}
