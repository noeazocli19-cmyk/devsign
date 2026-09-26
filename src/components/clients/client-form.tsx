"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { clientSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
};

export type EditableClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
};

const EMPTY: ClientFormValues = { firstName: "", lastName: "", email: "", phone: "", company: "", notes: "" };

const FIELD_LABELS: Record<string, string> = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  phone: "Téléphone",
  company: "Entreprise",
  notes: "Notes",
};

/**
 * Dialog de création / modification d'un client (zod clientSchema → /api/clients).
 * Réutilisé par la liste clients (« Nouveau client ») et la fiche client (« Modifier »).
 */
export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: EditableClient | null;
}) {
  const router = useRouter();
  const editing = Boolean(client?.id);
  const [values, setValues] = useState<ClientFormValues>(
    client
      ? {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone ?? "",
          company: client.company ?? "",
          notes: client.notes ?? "",
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ClientFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = clientSchema.safeParse({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      company: values.company.trim() || null,
      notes: values.notes.trim() || null,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/clients/${client!.id}` : "/api/clients", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? "Une erreur est survenue. Merci de réessayer.");
        return;
      }
      toast.success(editing ? "Client mis à jour." : "Client créé avec succès.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!saving) onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden />
            {editing ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Mettez à jour les informations de contact de votre client."
              : "Ajoutez un client pour créer ensuite ses projets et ses contrats."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" error={errors.firstName} htmlFor="client-firstname">
              <Input
                id="client-firstname"
                value={values.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Jean"
                autoComplete="given-name"
                className={cn("h-11", errors.firstName && "border-destructive focus-visible:ring-destructive")}
                required
              />
            </Field>
            <Field label="Nom" error={errors.lastName} htmlFor="client-lastname">
              <Input
                id="client-lastname"
                value={values.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Dupont"
                autoComplete="family-name"
                className={cn("h-11", errors.lastName && "border-destructive focus-visible:ring-destructive")}
                required
              />
            </Field>
          </div>

          <Field label="Email" error={errors.email} htmlFor="client-email">
            <Input
              id="client-email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jean.dupont@example.com"
              autoComplete="email"
              inputMode="email"
              className={cn("h-11", errors.email && "border-destructive focus-visible:ring-destructive")}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" error={errors.phone} htmlFor="client-phone" optional>
              <Input
                id="client-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+221 77 123 45 67"
                autoComplete="tel"
                inputMode="tel"
                className={cn("h-11", errors.phone && "border-destructive focus-visible:ring-destructive")}
              />
            </Field>
            <Field label="Entreprise" error={errors.company} htmlFor="client-company" optional>
              <Input
                id="client-company"
                value={values.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Kélé SARL"
                autoComplete="organization"
                className={cn("h-11", errors.company && "border-destructive focus-visible:ring-destructive")}
              />
            </Field>
          </div>

          <Field label="Notes" error={errors.notes} htmlFor="client-notes" optional>
            <Textarea
              id="client-notes"
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Contexte, préférences, historique…"
              rows={3}
              className={cn("resize-none", errors.notes && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="min-h-10">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="min-h-10">
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {editing ? "Enregistrer" : "Créer le client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optionnel)</span>}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

/** Bouton « Modifier » auto-porteur (fiche client) qui ouvre le dialog en mode édition. */
export function EditClientButton({ client }: { client: EditableClient }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="min-h-10">
        <Pencil className="h-4 w-4" aria-hidden />
        Modifier
      </Button>
      {open && (
        <ClientFormDialog key={`edit-${client.id}-${String(open)}`} open={open} onOpenChange={setOpen} client={client} />
      )}
    </>
  );
}
