"use client";

// ─── Éditeur inline d'un contrat en brouillon ────────────────
// Titre, objet, livrables, révisions, clauses + lignes de devis avec recalcul live.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { IP_OWNERSHIP, MAINTENANCE_TYPES } from "@/lib/status";
import { formatAmount } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type EditableContract = {
  id: string;
  title: string;
  objectText: string;
  deliverables: string[];
  revisions: number;
  paymentTermsText: string;
  ipOwnership: string;
  maintenanceType: string;
  maintenanceText: string;
  cancellationText: string;
  taxRate: number;
  discount: number;
  depositPercent: number;
  currency: string;
  items: { name: string; quantity: number; unitPrice: number }[];
};

type ItemRow = { name: string; quantity: string; unitPrice: string };

export function ContractEditor({ contract }: { contract: EditableContract }) {
  const router = useRouter();

  const [title, setTitle] = useState(contract.title);
  const [objectText, setObjectText] = useState(contract.objectText);
  const [deliverables, setDeliverables] = useState<string[]>(contract.deliverables.length ? [...contract.deliverables] : [""]);
  const [revisions, setRevisions] = useState(String(contract.revisions));
  const [paymentTermsText, setPaymentTermsText] = useState(contract.paymentTermsText);
  const [ipOwnership, setIpOwnership] = useState(contract.ipOwnership);
  const [maintenanceType, setMaintenanceType] = useState(contract.maintenanceType);
  const [maintenanceText, setMaintenanceText] = useState(contract.maintenanceText);
  const [cancellationText, setCancellationText] = useState(contract.cancellationText);
  const [taxRate, setTaxRate] = useState(String(contract.taxRate));
  const [discount, setDiscount] = useState(String(contract.discount));
  const [depositPercent, setDepositPercent] = useState(contract.depositPercent);
  const [items, setItems] = useState<ItemRow[]>(
    contract.items.length
      ? contract.items.map((it) => ({ name: it.name, quantity: String(it.quantity), unitPrice: String(it.unitPrice) }))
      : [{ name: "", quantity: "1", unitPrice: "0" }]
  );
  const [saving, setSaving] = useState(false);

  // ── Recalcul live (même logique que le serveur) ──
  const calc = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const discountN = Math.max(0, Number(discount) || 0);
    const afterDiscount = Math.max(0, subtotal - discountN);
    const taxRateN = Math.min(50, Math.max(0, Number(taxRate) || 0));
    const taxAmount = Math.round(afterDiscount * taxRateN) / 100;
    const total = afterDiscount + taxAmount;
    const depositAmount = Math.round(total * depositPercent) / 100;
    const balance = Math.max(0, total - depositAmount);
    return { subtotal, taxRateN, taxAmount, total, depositAmount, balance };
  }, [items, discount, taxRate, depositPercent]);

  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const removeItem = (index: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  const addItem = () => setItems((prev) => [...prev, { name: "", quantity: "1", unitPrice: "0" }]);

  const updateDeliverable = (index: number, value: string) =>
    setDeliverables((prev) => prev.map((d, i) => (i === index ? value : d)));
  const removeDeliverable = (index: number) => setDeliverables((prev) => prev.filter((_, i) => i !== index));
  const addDeliverable = () => setDeliverables((prev) => [...prev, ""]);

  async function handleSave() {
    const cleanedItems = items
      .filter((it) => it.name.trim())
      .map((it) => ({ name: it.name.trim(), quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 }));

    if (title.trim().length < 2) {
      toast.error("Le titre du contrat est requis (2 caractères minimum).");
      return;
    }
    if (cleanedItems.length === 0) {
      toast.error("Le devis doit contenir au moins une ligne nommée.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          objectText: objectText.trim() || null,
          deliverables: deliverables.map((d) => d.trim()).filter(Boolean),
          revisions: Math.max(0, Number(revisions) || 0),
          paymentTermsText: paymentTermsText.trim() || null,
          ipOwnership,
          maintenanceType,
          maintenanceText: maintenanceType === "CUSTOM" ? maintenanceText.trim() || null : null,
          cancellationText: cancellationText.trim() || null,
          taxRate: calc.taxRateN,
          discount: Math.max(0, Number(discount) || 0),
          depositPercent,
          items: cleanedItems,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Les modifications n'ont pas pu être enregistrées.");
        return;
      }
      toast.success("Contrat mis à jour ✅");
      router.refresh();
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="contract-editor" className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            Modifier le brouillon
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Brouillon</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Tout reste modifiable jusqu'à l'envoi au client.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-3 sm:mt-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        {/* Titre + objet */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre du contrat</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-revisions">Révisions incluses</Label>
            <Input id="edit-revisions" type="number" min="0" max="10" inputMode="numeric" value={revisions} onChange={(e) => setRevisions(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-object">Objet du contrat</Label>
          <Textarea id="edit-object" value={objectText} onChange={(e) => setObjectText(e.target.value)} rows={3} />
        </div>

        {/* Livrables */}
        <div className="space-y-2">
          <Label>Livrables</Label>
          <div className="space-y-2">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={d} onChange={(e) => updateDeliverable(i, e.target.value)} placeholder={`Livrable ${i + 1}`} aria-label={`Livrable ${i + 1}`} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDeliverable(i)} aria-label={`Supprimer le livrable ${i + 1}`} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
            <Plus className="h-4 w-4" aria-hidden /> Ajouter
          </Button>
        </div>

        {/* Lignes de devis */}
        <div className="space-y-3">
          <Label>Lignes du devis</Label>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-xl border bg-card p-3 sm:grid-cols-[1fr_5rem_8rem_auto] sm:gap-3">
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <Label htmlFor={`edit-item-name-${i}`} className="text-xs text-muted-foreground">Prestation</Label>
                <Input id={`edit-item-name-${i}`} value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Nom de la prestation" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`edit-item-qty-${i}`} className="text-xs text-muted-foreground">Qté</Label>
                <Input id={`edit-item-qty-${i}`} type="number" min="0.5" step="0.5" inputMode="decimal" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} className="text-right" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`edit-item-price-${i}`} className="text-xs text-muted-foreground">Prix unitaire</Label>
                <Input id={`edit-item-price-${i}`} type="number" min="0" step="1000" inputMode="numeric" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: e.target.value })} className="text-right" />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length <= 1} aria-label={`Supprimer la ligne ${i + 1}`} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une ligne
          </Button>
        </div>

        {/* Montants + acompte */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div className="grid grid-cols-2 items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-discount" className="text-xs text-muted-foreground">Remise (FCFA)</Label>
                <Input id="edit-discount" type="number" min="0" step="1000" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-tax" className="text-xs text-muted-foreground">Taxes (%)</Label>
                <Input id="edit-tax" type="number" min="0" max="50" step="0.5" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="text-right" />
              </div>
            </div>
            <dl className="space-y-2 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd className="font-medium tabular-nums">{formatAmount(calc.subtotal, contract.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Taxes</dt>
                <dd className="font-medium tabular-nums">{formatAmount(calc.taxAmount, contract.currency)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-semibold">TOTAL</dt>
                <dd className="text-lg font-bold tabular-nums text-primary">{formatAmount(calc.total, contract.currency)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-deposit" className="text-xs text-muted-foreground">Acompte à la signature</Label>
                <span className="text-sm font-semibold tabular-nums text-primary">{depositPercent} %</span>
              </div>
              <Slider id="edit-deposit" value={[depositPercent]} onValueChange={(v) => setDepositPercent(v[0] ?? 50)} min={0} max={100} step={5} aria-label="Pourcentage d'acompte" />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <p className="text-xs font-medium text-emerald-700">Acompte ({depositPercent} %)</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-emerald-800">{formatAmount(calc.depositAmount, contract.currency)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 ring-1 ring-border">
                <p className="text-xs font-medium text-muted-foreground">Solde</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{formatAmount(calc.balance, contract.currency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clauses */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-payment-terms">Conditions de paiement</Label>
            <Input id="edit-payment-terms" value={paymentTermsText} onChange={(e) => setPaymentTermsText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ip">Propriété intellectuelle</Label>
            <Select value={ipOwnership} onValueChange={setIpOwnership}>
              <SelectTrigger id="edit-ip" className="w-full">
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
          <div className="space-y-2">
            <Label htmlFor="edit-maintenance">Maintenance</Label>
            <Select value={maintenanceType} onValueChange={setMaintenanceType}>
              <SelectTrigger id="edit-maintenance" className="w-full">
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-maintenance-text">Détails de la maintenance</Label>
              <Textarea id="edit-maintenance-text" value={maintenanceText} onChange={(e) => setMaintenanceText(e.target.value)} rows={2} />
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-cancellation">Conditions d'annulation</Label>
            <Textarea id="edit-cancellation" value={cancellationText} onChange={(e) => setCancellationText(e.target.value)} rows={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
