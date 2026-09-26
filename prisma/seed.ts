/**
 * DevSign — Données de démonstration (développement uniquement).
 * Exécution : bun prisma/seed.ts   (ou bun run db:seed)
 * Ne JAMAIS exécuter en production.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const DAY = 24 * 3600 * 1000;
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * DAY);
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000);

function ref(n: number) {
  return `DS-2026-${String(n).padStart(6, "0")}`;
}

async function main() {
  console.log("🌱 Seed DevSign — démarrage");

  // ─── Nettoyage (ordre respectant les FK) ───
  await prisma.activity.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.signature.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.contractItem.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.contractTemplate.deleteMany({});
  await prisma.companyProfile.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});

  // ─── Utilisateurs ───
  const demoPass = await hashPassword("Demo1234!");
  const adminPass = await hashPassword("Admin1234!");

  const demoId = randomUUID();
  const demo = await prisma.user.create({
    data: {
      id: demoId,
      name: "Alex Martin",
      email: "demo@devsign.app",
      emailVerified: true,
      role: "USER",
      profession: "DEVELOPER",
      onboardingCompleted: true,
      plan: "PRO",
      createdAt: daysAgo(120),
      accounts: { create: { id: randomUUID(), accountId: demoId, providerId: "credential", password: demoPass } },
    },
  });

  const adminId = randomUUID();
  await prisma.user.create({
    data: {
      id: adminId,
      name: "Admin DevSign",
      email: "admin@devsign.app",
      emailVerified: true,
      role: "ADMIN",
      onboardingCompleted: true,
      plan: "AGENCY",
      createdAt: daysAgo(150),
      accounts: { create: { id: randomUUID(), accountId: adminId, providerId: "credential", password: adminPass } },
    },
  });

  await prisma.companyProfile.create({
    data: {
      userId: demo.id,
      businessName: "Studio Martin",
      description: "Studio de développement web & mobile. Sites rapides, applications robustes, design soigné.",
      email: "contact@studiomartin.dev",
      phone: "+221 77 123 45 67",
      address: "12 Rue de la Paix, Dakar",
      country: "Sénégal",
      currency: "XOF",
      brandColor: "#059669",
      footerText: "Studio Martin — Développement web & mobile",
      welcomeMessage: "Ravis de travailler avec vous ! Consultez votre offre, signez et lancez votre projet en quelques minutes.",
    },
  });

  // ─── Clients ───
  const [jean, marie, paul, fatou] = await Promise.all([
    prisma.client.create({ data: { userId: demo.id, firstName: "Jean", lastName: "Dupont", email: "jean.dupont@example.com", phone: "+221 78 555 12 34", company: "Kélé SARL", createdAt: daysAgo(90) } }),
    prisma.client.create({ data: { userId: demo.id, firstName: "Marie", lastName: "Sow", email: "marie.sow@example.com", phone: "+221 76 222 88 90", company: "Atelier Sow", createdAt: daysAgo(60) } }),
    prisma.client.create({ data: { userId: demo.id, firstName: "Paul", lastName: "Ndiaye", email: "paul.ndiaye@example.com", phone: "+221 70 999 45 12", company: "Ndiaye Immobilier", createdAt: daysAgo(45) } }),
    prisma.client.create({ data: { userId: demo.id, firstName: "Fatou", lastName: "Ba", email: "fatou.ba@example.com", phone: "+221 77 333 21 09", company: "Ba Cosmetics", createdAt: daysAgo(30) } }),
  ]);

  // ─── Helper contrat ───
  type SeedContract = {
    n: number;
    client: { id: string; firstName: string; lastName: string };
    title: string;
    type: string;
    status: string;
    projectStatus: string;
    items: [string, number, number][]; // [nom, quantité, prix unitaire]
    depositPercent: number;
    createdDaysAgo: number;
    sentDaysAgo?: number;
    viewedDaysAgo?: number;
    signedHoursAgo?: number;
    paidHoursAgo?: number;
    deliverables?: string[];
  };

  const seedContract = async (s: SeedContract) => {
    const subtotal = s.items.reduce((acc, [, q, p]) => acc + q * p, 0);
    const total = subtotal;
    const depositAmount = Math.round((total * s.depositPercent) / 100);
    const balanceAmount = total - depositAmount;

    const project = await prisma.project.create({
      data: {
        userId: demo.id,
        clientId: s.client.id,
        name: s.title,
        description: `Projet « ${s.title} » créé via DevSign.`,
        type: s.type,
        startDate: s.paidHoursAgo ? daysAgo(s.createdDaysAgo) : null,
        deliveryDate: new Date(now + 45 * DAY),
        totalPrice: total,
        currency: "XOF",
        depositPercent: s.depositPercent,
        depositAmount,
        balanceAmount,
        status: s.projectStatus,
        createdAt: daysAgo(s.createdDaysAgo),
      },
    });

    const publicId = Math.random().toString(36).slice(2, 9);
    const contract = await prisma.contract.create({
      data: {
        userId: demo.id,
        clientId: s.client.id,
        projectId: project.id,
        reference: ref(s.n),
        publicId,
        title: s.title,
        status: s.status,
        objectText: `Le prestataire réalisera ${s.title.toLowerCase()} pour le client, conformément aux spécifications validées ensemble : design moderne, performance optimisée et compatibilité mobile complète.`,
        deliverables: JSON.stringify(s.deliverables ?? ["Design responsive", "Développement complet", "Mise en production", "SEO de base", "Formation à la prise en main"]),
        revisions: 2,
        paymentTermsText: `${s.depositPercent} % à la signature${s.depositPercent < 100 ? `, ${100 - s.depositPercent} % à la livraison` : ""}`,
        ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT",
        maintenanceType: "NONE",
        maintenanceText: null,
        cancellationText: "En cas d'annulation en cours de projet, les travaux réalisés jusqu'à la date d'annulation restent dus au prorata de l'avancement.",
        signatureNote: "Le projet comprend 2 séries de modifications.",
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        discount: 0,
        totalAmount: total,
        currency: "XOF",
        depositPercent: s.depositPercent,
        depositAmount,
        balanceAmount,
        sentAt: s.sentDaysAgo != null ? daysAgo(s.sentDaysAgo) : null,
        viewedAt: s.viewedDaysAgo != null ? daysAgo(s.viewedDaysAgo) : null,
        signedAt: s.signedHoursAgo != null ? hoursAgo(s.signedHoursAgo) : null,
        paidAt: s.paidHoursAgo != null ? hoursAgo(s.paidHoursAgo) : null,
        createdAt: daysAgo(s.createdDaysAgo),
        items: { create: s.items.map(([name, quantity, unitPrice], i) => ({ name, quantity, unitPrice, position: i })) },
      },
    });

    // Signature
    if (s.signedHoursAgo != null) {
      await prisma.signature.create({
        data: {
          contractId: contract.id,
          signerName: `${s.client.firstName} ${s.client.lastName}`,
          signatureType: "TYPED",
          signatureData: `${s.client.firstName} ${s.client.lastName}`,
          signatureId: `SIG-2026-${String(10000 + s.n)}`,
          ipAddress: "41.82.14.203",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)",
          signedAt: hoursAgo(s.signedHoursAgo),
        },
      });
    }

    // Paiements
    if (s.paidHoursAgo != null) {
      await prisma.payment.create({
        data: {
          userId: demo.id,
          contractId: contract.id,
          projectId: project.id,
          reference: `PAY-${(100000 + s.n * 137).toString(16).toUpperCase()}`,
          provider: "SAASPAY",
          providerTxId: `SP-${100000 + s.n * 371}`,
          amount: depositAmount,
          currency: "XOF",
          type: "DEPOSIT",
          status: "SUCCESS",
          paidAt: hoursAgo(s.paidHoursAgo),
          createdAt: hoursAgo(s.paidHoursAgo - 1),
        },
      });
      if (s.projectStatus === "COMPLETED") {
        await prisma.payment.create({
          data: {
            userId: demo.id,
            contractId: contract.id,
            projectId: project.id,
            reference: `PAY-${(200000 + s.n * 91).toString(16).toUpperCase()}`,
            provider: "SAASPAY",
            providerTxId: `SP-${200000 + s.n * 173}`,
            amount: balanceAmount,
            currency: "XOF",
            type: "BALANCE",
            status: "SUCCESS",
            paidAt: hoursAgo(48),
            createdAt: hoursAgo(49),
          },
        });
      }
    }
    if (s.status === "CANCELLED") {
      await prisma.payment.create({
        data: {
          userId: demo.id,
          contractId: contract.id,
          projectId: project.id,
          reference: `PAY-${(300000 + s.n * 57).toString(16).toUpperCase()}`,
          provider: "SAASPAY",
          providerTxId: `SP-${300000 + s.n * 29}`,
          amount: depositAmount,
          currency: "XOF",
          type: "DEPOSIT",
          status: "FAILED",
          createdAt: hoursAgo(20),
        },
      });
    }

    // Relances
    if (s.status === "SENT" && s.sentDaysAgo != null) {
      await prisma.reminder.createMany({
        data: [
          { contractId: contract.id, type: "AFTER_24H", scheduledAt: daysAgo(s.sentDaysAgo - 1), sentAt: daysAgo(s.sentDaysAgo - 1), status: "SENT" },
          { contractId: contract.id, type: "AFTER_3D", scheduledAt: new Date(now + DAY), status: "PENDING" },
          { contractId: contract.id, type: "AFTER_7D", scheduledAt: new Date(now + 5 * DAY), status: "PENDING" },
        ],
      });
    }
    if (s.status === "VIEWED" && s.sentDaysAgo != null) {
      await prisma.reminder.create({ data: { contractId: contract.id, type: "AFTER_24H", scheduledAt: new Date(now + 6 * 3600 * 1000), status: "PENDING" } });
    }

    // Activités (timeline)
    const acts: { type: string; message: string; actor: string; at: Date }[] = [
      { type: "CREATED", message: `Contrat ${ref(s.n)} créé pour le projet « ${s.title} »`, actor: demo.id, at: daysAgo(s.createdDaysAgo) },
    ];
    if (s.sentDaysAgo != null) acts.push({ type: "SENT", message: `Contrat envoyé à ${s.client.firstName} ${s.client.lastName}`, actor: demo.id, at: daysAgo(s.sentDaysAgo) });
    if (s.viewedDaysAgo != null) acts.push({ type: "VIEWED", message: `${s.client.firstName} a ouvert le contrat`, actor: "CLIENT", at: daysAgo(s.viewedDaysAgo) });
    if (s.signedHoursAgo != null) acts.push({ type: "SIGNED", message: `${s.client.firstName} ${s.client.lastName} a signé le contrat`, actor: "CLIENT", at: hoursAgo(s.signedHoursAgo) });
    if (s.paidHoursAgo != null) {
      acts.push({ type: "PAID", message: `Acompte reçu : ${depositAmount.toLocaleString("fr-FR")} FCFA (transaction SP-${100000 + s.n * 371})`, actor: "SYSTEM", at: hoursAgo(s.paidHoursAgo) });
      acts.push({ type: "PROJECT_STARTED", message: `Projet « ${s.title} » officiellement lancé`, actor: "SYSTEM", at: hoursAgo(s.paidHoursAgo - 1) });
    }
    if (s.status === "CANCELLED") acts.push({ type: "CANCELLED", message: `Contrat annulé d'un commun accord`, actor: demo.id, at: hoursAgo(19) });
    await prisma.activity.createMany({ data: acts.map((a) => ({ userId: demo.id, contractId: contract.id, type: a.type, message: a.message, actor: a.actor, createdAt: a.at })) });

    return contract;
  };

  // ─── 8 contrats couvrant tout le cycle de vie ───
  const c241 = await seedContract({
    n: 241,
    client: jean,
    title: "Site web professionnel",
    type: "SITE_VITRINE",
    status: "SIGNED",
    projectStatus: "IN_PROGRESS",
    items: [["Création UI/UX", 1, 100000], ["Développement", 1, 350000], ["Hébergement (1 an)", 1, 50000], ["SEO de base", 1, 100000]],
    depositPercent: 50,
    createdDaysAgo: 5,
    sentDaysAgo: 4,
    viewedDaysAgo: 4,
    signedHoursAgo: 72,
    paidHoursAgo: 70,
  });

  await seedContract({ n: 240, client: marie, title: "Refonte identité visuelle", type: "DESIGN", status: "SENT", projectStatus: "WAITING_SIGNATURE", items: [["Logo & charte graphique", 1, 250000], ["Déclinaisons supports", 1, 200000]], depositPercent: 50, createdDaysAgo: 3, sentDaysAgo: 2, deliverables: ["Logo (3 propositions)", "Charte graphique complète", "Cartes de visite & papeterie", "Templates réseaux sociaux"] });
  await seedContract({ n: 239, client: paul, title: "Application de gestion immobilière", type: "WEB_APP", status: "VIEWED", projectStatus: "WAITING_SIGNATURE", items: [["Conception UI/UX", 1, 300000], ["Développement application web", 1, 1000000], ["Déploiement & formation", 1, 200000]], depositPercent: 50, createdDaysAgo: 4, sentDaysAgo: 3, viewedDaysAgo: 1 });
  await seedContract({ n: 238, client: fatou, title: "Boutique e-commerce Ba Cosmetics", type: "ECOMMERCE", status: "DRAFT", projectStatus: "DRAFT", items: [["Boutique en ligne", 1, 600000], ["Paiement en ligne", 1, 150000], ["Catalogue 50 produits", 1, 100000]], depositPercent: 50, createdDaysAgo: 1 });
  await seedContract({ n: 236, client: jean, title: "Site vitrine + SEO avancé", type: "SITE_VITRINE", status: "SIGNED", projectStatus: "COMPLETED", items: [["Site vitrine", 1, 250000], ["SEO avancé", 1, 150000]], depositPercent: 50, createdDaysAgo: 60, sentDaysAgo: 59, viewedDaysAgo: 58, signedHoursAgo: 24 * 55, paidHoursAgo: 24 * 55, deliverables: ["Design sur mesure", "Développement", "Audit SEO complet", "Contenu optimisé", "Rapport mensuel"] });
  await seedContract({ n: 234, client: marie, title: "Landing page SaaS", type: "WEB_APP", status: "CANCELLED", projectStatus: "CANCELLED", items: [["Landing page", 1, 300000]], depositPercent: 50, createdDaysAgo: 40, sentDaysAgo: 39, viewedDaysAgo: 38 });
  await seedContract({ n: 231, client: paul, title: "Refonte site portail immobilier", type: "SITE_VITRINE", status: "SIGNED", projectStatus: "COMPLETED", items: [["Refonte design", 1, 400000], ["Intégration annonces", 1, 250000], ["Formation", 1, 200000]], depositPercent: 50, createdDaysAgo: 75, sentDaysAgo: 74, viewedDaysAgo: 73, signedHoursAgo: 24 * 70, paidHoursAgo: 24 * 70 });
  await seedContract({ n: 229, client: fatou, title: "Catalogue digital produits", type: "DESIGN", status: "EXPIRED", projectStatus: "CANCELLED", items: [["Catalogue interactif", 1, 450000]], depositPercent: 50, createdDaysAgo: 90, sentDaysAgo: 88, viewedDaysAgo: 86 });

  // ─── Notifications ───
  await prisma.notification.createMany({
    data: [
      { userId: demo.id, title: "Projet lancé 🚀", message: "Le projet « Site web professionnel » est maintenant EN COURS.", type: "SUCCESS", link: "/projects", createdAt: hoursAgo(70), read: false },
      { userId: demo.id, title: "Acompte reçu 💰", message: "Vous avez reçu 300 000 FCFA pour le contrat DS-2026-000241.", type: "PAYMENT", link: "/payments", createdAt: hoursAgo(70), read: false },
      { userId: demo.id, title: "Contrat signé 🎉", message: "Jean Dupont vient de signer le contrat DS-2026-000241.", type: "CONTRACT", link: `/contracts/${c241.id}`, createdAt: hoursAgo(72), read: true },
      { userId: demo.id, title: "Contrat consulté", message: "Paul Ndiaye a ouvert votre contrat DS-2026-000239.", type: "CONTRACT", createdAt: daysAgo(1), read: false },
      { userId: demo.id, title: "Rappel programmé", message: "Un rappel sera envoyé à Marie Sow si le contrat reste en attente.", type: "INFO", createdAt: daysAgo(2), read: true },
      { userId: demo.id, title: "Bienvenue sur DevSign 👋", message: "Créez votre premier contrat et transformez vos prospects en clients signés.", type: "INFO", createdAt: daysAgo(120), read: true },
    ],
  });

  // ─── Modèles de contrats système ───
  const templates: {
    name: string;
    type: string;
    description: string;
    objectText: string;
    deliverables: string[];
    paymentTermsText: string;
    revisions: number;
    ipOwnership: string;
    maintenanceType: string;
    cancellationText: string;
  }[] = [
    { name: "Site vitrine", type: "SITE_VITRINE", description: "Contrat type pour un site vitrine professionnel (5-10 pages, responsive, SEO de base).", objectText: "Création d'un site vitrine professionnel comprenant la conception graphique, l'intégration des contenus fournis par le client, l'optimisation pour les moteurs de recherche et la mise en ligne.", deliverables: ["Design sur mesure (maquettes validées)", "Site responsive (mobile, tablette, desktop)", "Formulaire de contact", "SEO technique de base", "Mise en ligne & hébergement (1 an)", "Formation à la prise en main"], paymentTermsText: "50 % à la signature, 50 % à la livraison", revisions: 2, ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT", maintenanceType: "NONE", cancellationText: "En cas d'annulation, les travaux réalisés jusqu'à la date d'annulation restent dus au prorata de l'avancement validé." },
    { name: "E-commerce", type: "ECOMMERCE", description: "Boutique en ligne complète : catalogue, panier, paiement en ligne, gestion des commandes.", objectText: "Réalisation d'une boutique en ligne complète avec catalogue produits, tunnel de commande, paiement en ligne sécurisé et interface d'administration des commandes.", deliverables: ["Boutique en ligne complète", "Paiement en ligne sécurisé", "Gestion catalogue (50 produits inclus)", "Tunnel de commande optimisé", "Interface administrateur", "Formation à la gestion de la boutique"], paymentTermsText: "50 % à la signature, 50 % à la mise en ligne", revisions: 2, ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT", maintenanceType: "MONTHLY", cancellationText: "Toute annulation après le début du développement entraîne la facturation des travaux réalisés." },
    { name: "Application mobile", type: "MOBILE_APP", description: "Application mobile iOS & Android (React Native/Flutter) avec publication sur les stores.", objectText: "Conception et développement d'une application mobile native (iOS et Android), incluant la publication sur l'App Store et Google Play.", deliverables: ["Maquettes UX/UI validées", "Application iOS & Android", "Publication sur les stores", "Tests sur appareils réels", "Documentation technique", "1 mois de support post-lancement"], paymentTermsText: "40 % à la signature, 30 % à la bêta, 30 % à la publication", revisions: 3, ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT", maintenanceType: "MONTHLY", cancellationText: "En cas d'abandon du projet par le client, les échéances passées restent acquises au prestataire." },
    { name: "SaaS", type: "SAAS", description: "Développement d'un produit SaaS : MVP, authentification, abonnements, tableau de bord.", objectText: "Développement d'un produit SaaS incluant l'architecture technique, l'authentification, les abonnements payants et le tableau de bord administrateur.", deliverables: ["MVP fonctionnel", "Authentification & gestion des rôles", "Système d'abonnement", "Tableau de bord admin", "Documentation API", "Déploiement cloud"], paymentTermsText: "30 % à la signature, 40 % à la bêta, 30 % au lancement", revisions: 2, ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT", maintenanceType: "MONTHLY", cancellationText: "Les acomptes versés couvrent les phases déjà démarrées et ne sont pas remboursables." },
    { name: "Maintenance", type: "MAINTENANCE", description: "Contrat de maintenance mensuelle : mises à jour, sauvegardes, supervision, correctifs.", objectText: "Prestation de maintenance mensuelle du site/application : mises à jour de sécurité, sauvegardes régulières, supervision de disponibilité et correctifs de bugs.", deliverables: ["Mises à jour de sécurité", "Sauvegardes hebdomadaires", "Supervision 24/7", "Correctifs de bugs (48h)", "Rapport mensuel d'intervention"], paymentTermsText: "Paiement mensuel, éditable le 1er du mois", revisions: 0, ipOwnership: "PROVIDER_RETAINS", maintenanceType: "MONTHLY", cancellationText: "Préavis de 30 jours requis pour résilier le contrat de maintenance." },
    { name: "Design UI/UX", type: "DESIGN", description: "Identité visuelle et interfaces : logo, charte, maquettes Figma haute fidélité.", objectText: "Création de l'identité visuelle et des interfaces utilisateur : logo, charte graphique et maquettes haute fidélité livrées en fichiers sources Figma.", deliverables: ["Logo (3 propositions)", "Charte graphique complète", "Maquettes Figma haute fidélité", "Design system de base", "Fichiers sources exportables"], paymentTermsText: "50 % à la signature, 50 % à la livraison des fichiers sources", revisions: 3, ipOwnership: "USAGE_LICENSE", maintenanceType: "NONE", cancellationText: "En cas d'annulation, la phase de recherche et conception démarrée reste facturée." },
    { name: "Prestation freelance", type: "OTHER", description: "Contrat générique de prestation de services numériques, adaptable à tout projet.", objectText: "Prestation de services numériques conformément au périmètre défini entre les parties, détaillé dans l'objet du présent contrat.", deliverables: ["Périmètre défini avec le client", "Livrables validés à chaque étape", "Documentation des travaux réalisés"], paymentTermsText: "50 % à la signature, 50 % à la livraison", revisions: 2, ipOwnership: "TRANSFER_AFTER_FULL_PAYMENT", maintenanceType: "NONE", cancellationText: "Tout travail engagé avant annulation est facturé au prorata du temps passé." },
    { name: "SEO", type: "OTHER", description: "Mission SEO : audit technique, optimisation on-page, contenu et rapport mensuel.", objectText: "Mission d'optimisation du référencement naturel : audit technique complet, optimisation on-page des pages clés et suivi mensuel des performances.", deliverables: ["Audit SEO complet", "Optimisation on-page (10 pages)", "Recherche de mots-clés", "Recommandations de contenu", "Rapport mensuel de positionnement"], paymentTermsText: "100 % au lancement de la mission", revisions: 1, ipOwnership: "PROVIDER_RETAINS", maintenanceType: "MONTHLY", cancellationText: "Mission résiliable à tout moment avec préavis de 15 jours ; le mois en cours reste dû." },
  ];

  await prisma.contractTemplate.createMany({
    data: templates.map((t) => ({
      userId: null,
      name: t.name,
      type: t.type,
      description: t.description,
      objectText: t.objectText,
      deliverables: JSON.stringify(t.deliverables),
      paymentTermsText: t.paymentTermsText,
      revisions: t.revisions,
      ipOwnership: t.ipOwnership,
      maintenanceType: t.maintenanceType,
      cancellationText: t.cancellationText,
      isSystem: true,
      usageCount: Math.floor(Math.random() * 40) + 5,
    })),
  });

  console.log("✅ Seed terminé :");
  console.log("   • Compte démo  : demo@devsign.app / Demo1234!");
  console.log("   • Compte admin : admin@devsign.app / Admin1234!");
  console.log(`   • 4 clients, 8 projets/contrats, ${await prisma.payment.count()} paiements, 8 modèles`);
}

main()
  .catch((e) => {
    console.error("❌ Seed échoué :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
