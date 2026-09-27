import { redirect } from "next/navigation";

export default function AbonnementRedirectPage() {
  redirect("/settings/billing");
}