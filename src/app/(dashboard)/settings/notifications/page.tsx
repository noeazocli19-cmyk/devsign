import { requireUser } from "@/lib/session";
import { NotificationSettings, type NotificationPrefs } from "@/components/dashboard/notification-settings";

export const metadata = { title: "Paramètres — Notifications" };

export default async function NotificationSettingsPage() {
  const user = await requireUser();
  let prefs: NotificationPrefs = { contractViewed: true, contractSigned: true, paymentReceived: true, reminders: true, weeklyReport: false };
  try {
    prefs = { ...prefs, ...(JSON.parse(user.notificationPrefs ?? "{}") as Partial<NotificationPrefs>) };
  } catch {
    /* défauts */
  }

  return <NotificationSettings initial={prefs} />;
}
