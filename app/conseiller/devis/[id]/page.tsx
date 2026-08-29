import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StatutDevis, RoleNom } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DevisCalculator } from "@/components/devis/DevisCalculator";
import { PriceDisplay } from "@/components/currency/PriceDisplay";
import { parseDetailsCalcul } from "@/lib/services/devis-calculator.service";
import {
  ArrowLeft,
  CalendarCheck,
  User,
  MapPin,
  Clock,
  Compass,
  Utensils,
  Car,
  Activity,
  Mail,
  Phone,
  Users,
  Calendar,
  Wallet,
  Hotel,
  Sparkles,
  ChevronRight,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { statutDevisColors, statutDevisLabels } from "@/lib/statut-config";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate a consistent color from a string (for avatar backgrounds)
function getAvatarColor(name: string): string {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(prenom?: string | null, nom?: string | null): string {
  const p = prenom?.trim()?.[0]?.toUpperCase() || "";
  const n = nom?.trim()?.[0]?.toUpperCase() || "";
  return p + n || "?";
}

// Status dot color mapping
function getStatutDotColor(statut: StatutDevis): string {
  const map: Record<StatutDevis, string> = {
    [StatutDevis.en_cours]: "bg-amber-500",
    [StatutDevis.en_modification]: "bg-orange-500",
    [StatutDevis.valide]: "bg-blue-500",
    [StatutDevis.accepte]: "bg-emerald-500",
    [StatutDevis.reserve]: "bg-purple-500",
    [StatutDevis.refuse]: "bg-rose-500",
  };
  return map[statut] || "bg-gray-400";
}

export default async function ConseillerDevisDetailPage({ params }: Props) {
  const { id } = await params;
  const devisId = parseInt(id);
  if (isNaN(devisId)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isAdmin = currentUser?.role?.nom === RoleNom.admin;

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      user: {
        select: {
          name: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
      circuit: {
        include: {
          region: true,
          theme: true,
          etapes: {
            orderBy: { ordre: "asc" },
            include: {
              hebergement: true,
              activites: true,
            },
          },
        },
      },
      reservation: {
        include: {
          paiement: { include: { mode: true } },
        },
      },
    },
  });

  if (!devis) notFound();

  if (!isAdmin && devis.conseillerId !== session.user.id) {
    redirect("/conseiller/dashboard");
  }

  const detailsCalcul = parseDetailsCalcul(devis.detailsCalcul);

  const clientName = `${devis.prenom || devis.user.prenom || ""} ${devis.nom || devis.user.name}`.trim();
  const initials = getInitials(devis.prenom || devis.user.prenom, devis.nom || devis.user.name);
  const avatarColor = getAvatarColor(clientName);

  return (
    <div className="space-y-6">
      {/* ───── Hero Header with Breadcrumb & Status ───── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-5 sm:p-6">
        {/* Decorative */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/conseiller/dashboard"
              className="hover:text-foreground transition-colors font-medium"
            >
              Demandes
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">Dossier #{devis.id}</span>
          </div>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0",
                  avatarColor
                )}
              >
                {initials}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                  {clientName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Demande reçue le{" "}
                  {new Date(devis.dateDemande).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-3 py-1 font-semibold gap-1.5",
                  statutDevisColors[devis.statut] || ""
                )}
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", getStatutDotColor(devis.statut))} />
                {statutDevisLabels[devis.statut] || devis.statut}
              </Badge>
              <Link
                href="/conseiller/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs"
                )}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Reservation Banner (if booked) ───── */}
      {devis.reservation && (
        <Card className="relative overflow-hidden border-purple-200/60 dark:border-purple-900/60">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Réservation #{devis.reservation.id} associée
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Statut : <span className="font-medium capitalize text-foreground">{devis.reservation.status}</span>
                    {" · "}
                    Montant : <PriceDisplay amount={devis.reservation.montantFinal?.toString()} size="xs" priceClassName="font-bold text-primary" />
                  </p>
                </div>
              </div>
              {devis.reservation.paiement && (
                <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/15 rounded-lg px-3 py-2 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="text-muted-foreground">
                    {devis.reservation.paiement.mode.nom}
                    {" — "}
                    <span className="font-mono text-[11px] text-foreground">
                      {devis.reservation.paiement.referenceTransaction}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ───── Bandeau : modification demandée au client ───── */}
      {devis.statut === StatutDevis.en_modification && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300">
          <MessageSquare className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">
              Modification demandée — en attente du client
            </p>
            <p className="text-xs leading-relaxed italic">
              &ldquo;{devis.commentaireConseiller}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              Le client est seul habilité à corriger son devis. Vous recevrez une notification dès qu&apos;il l&apos;aura renvoyé pour nouvelle analyse.
            </p>
          </div>
        </div>
      )}

      {/* ───── Main Grid View ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ Left Column (3/5) - Client & Circuit Details ═══ */}
        <div className="lg:col-span-6 space-y-6">

          {/* ── Card: Client Profile ── */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                Fiche Voyageur
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Client</p>
                    <p className="text-[13px] font-semibold text-foreground">{clientName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</p>
                    <p className="text-[13px] font-medium text-foreground truncate">{devis.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Téléphone</p>
                    <p className="text-[13px] font-medium text-foreground">
                      {devis.telephone || devis.user.telephone || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Voyageurs</p>
                    <p className="text-[13px] font-semibold text-foreground">
                      {devis.nombrePersonnes} personne{devis.nombrePersonnes > 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {devis.adultes} adulte{devis.adultes > 1 ? "s" : ""}
                      {devis.enfants > 0 && ` · ${devis.enfants} enfant${devis.enfants > 1 ? "s" : ""}`}
                      {devis.ados > 0 && ` · ${devis.ados} ado${devis.ados > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Dates souhaitées</p>
                    <p className="text-[13px] font-semibold text-foreground">
                      {devis.dateDebutSouhaitee
                        ? new Date(devis.dateDebutSouhaitee).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                        : "Flexible"}
                      {" → "}
                      {devis.dateFinSouhaitee
                        ? new Date(devis.dateFinSouhaitee).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                        : "Flexible"}
                    </p>
                    {devis.dureeFlexible && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Dates flexibles
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Budget client</p>
                    <p className="text-[13px] font-bold text-primary">
                      {devis.budgetMin ? <PriceDisplay amount={devis.budgetMin} size="xs" /> : "—"}
                      {" – "}
                      {devis.budgetMax ? <PriceDisplay amount={devis.budgetMax} size="xs" /> : "Illimité"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences Tags */}
              {(devis.typeHebergement || devis.regime || (devis.typeVoyage && devis.typeVoyage.length > 0) || (devis.transport && devis.transport.length > 0) || (devis.activites && devis.activites.length > 0)) && (
                <div className="pt-4 border-t border-border/30 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Préférences du voyageur
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {devis.typeHebergement && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-muted/60 border border-border/40 rounded-lg px-2.5 py-1.5">
                        <Hotel className="w-3 h-3 text-muted-foreground" />
                        <span className="capitalize">{devis.typeHebergement}</span>
                      </span>
                    )}
                    {devis.regime && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-muted/60 border border-border/40 rounded-lg px-2.5 py-1.5">
                        <Utensils className="w-3 h-3 text-muted-foreground" />
                        {devis.regime}
                        {devis.regimePrecision && ` (${devis.regimePrecision})`}
                      </span>
                    )}
                    {devis.typeVoyage && devis.typeVoyage.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-violet-500/5 border border-violet-500/15 rounded-lg px-2.5 py-1.5 text-violet-600 dark:text-violet-400">
                        <Compass className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                    {devis.transport && devis.transport.length > 0 && devis.transport.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-muted/60 border border-border/40 rounded-lg px-2.5 py-1.5">
                        <Car className="w-3 h-3 text-muted-foreground" />
                        {t}
                      </span>
                    ))}
                    {devis.activites && devis.activites.length > 0 && devis.activites.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-primary/5 border border-primary/15 rounded-lg px-2.5 py-1.5 text-primary">
                        <Activity className="w-3 h-3" />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Comment */}
              {devis.commentaireClient && (
                <div className="pt-4 border-t border-border/30">
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Message du client
                      </span>
                    </div>
                    <p className="text-xs italic text-foreground/85 leading-relaxed">
                      &ldquo;{devis.commentaireClient}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Card: Circuit & Itinerary ── */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Circuit Associé
                </CardTitle>
                {devis.circuit.region?.nom && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted/60 border border-border/40 rounded-full px-2.5 py-1">
                    <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                    {devis.circuit.region.nom}
                  </span>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                {devis.circuit.titre}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Circuit Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                  <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Durée</p>
                  <p className="text-sm font-bold text-foreground">
                    {devis.circuit.dureeJours ? `${devis.circuit.dureeJours} jours` : "Flexible"}
                  </p>
                  {(devis.circuit.dateDebut || devis.circuit.dateFin) && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {devis.circuit.dateDebut
                        ? new Date(devis.circuit.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}{" "}
                      →{" "}
                      {devis.circuit.dateFin
                        ? new Date(devis.circuit.dateFin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  )}
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                  <MapPin className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Région</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {devis.circuit.region?.nom || "—"}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                  <Sparkles className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Thème</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {devis.circuit.theme?.nom || "—"}
                  </p>
                </div>
              </div>

              {/* Lieux de départ / arrivée */}
              {(devis.circuit.lieuDepartNom || devis.circuit.lieuArriveeNom) && (
                <div className="flex flex-wrap gap-3">
                  {devis.circuit.lieuDepartNom && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-xs">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Départ :</span>
                      <span className="font-medium text-foreground">{devis.circuit.lieuDepartNom}</span>
                    </div>
                  )}
                  {devis.circuit.lieuArriveeNom && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-xs">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">Arrivée :</span>
                      <span className="font-medium text-foreground">{devis.circuit.lieuArriveeNom}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {devis.circuit.description && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Description
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {devis.circuit.description}
                  </p>
                </div>
              )}

              {/* ── Itinerary Timeline ── */}
              <div className="space-y-4 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                  <span className="w-5 h-[2px] bg-primary/40 rounded-full" />
                  Itinéraire ({devis.circuit.etapes.length} étape{devis.circuit.etapes.length > 1 ? "s" : ""})
                </p>

                {devis.circuit.etapes.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">
                    Aucune étape renseignée sur ce circuit.
                  </p>
                ) : (
                  <div className="relative space-y-0">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border/50 rounded-full" />

                    {devis.circuit.etapes.map((etape, index) => (
                      <div key={etape.id} className="relative flex gap-4 pb-4 last:pb-0">
                        {/* Timeline node */}
                        <div className="relative z-10 shrink-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold",
                            index === 0
                              ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "bg-background border-border text-muted-foreground"
                          )}>
                            {etape.ordre}
                          </div>
                        </div>

                        {/* Etape Content */}
                        <div className="flex-1 min-w-0 pb-3 border-b border-border/20 last:border-b-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">
                                {etape.ville || "Ville flexible"}
                              </p>
                              {etape.description && (
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {etape.description}
                                </p>
                              )}
                              {/* Activities */}
                              {etape.activites.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                  {etape.activites.map((act) => (
                                    <Badge
                                      key={act.id}
                                      variant="outline"
                                      className="text-[10px] bg-background/60 border-border/50 text-foreground font-medium h-5"
                                    >
                                      <Activity className="w-2.5 h-2.5 mr-0.5 text-muted-foreground" />
                                      {act.nom}
                                      {act.prix && (
                                        <span className="text-muted-foreground ml-0.5">
                                          (<PriceDisplay amount={Number(act.prix)} size="xs" />)
                                        </span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Accommodation chip */}
                            {etape.hebergement && (
                              <div className="shrink-0 bg-muted/40 border border-border/30 p-2.5 rounded-lg space-y-0.5 sm:text-right min-w-[140px]">
                                <div className="flex items-center gap-1 sm:justify-end">
                                  <Hotel className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Hébergement
                                  </span>
                                </div>
                                <p className="font-semibold text-[11px] text-foreground">
                                  {etape.hebergement.nom}
                                </p>
                                {etape.hebergement.type && (
                                  <p className="text-[10px] text-muted-foreground capitalize">
                                    {etape.hebergement.type}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ Right Column (2/5) - Calculator & Validation ═══ */}
        <div className="lg:col-span-6 space-y-6">
          <div className="lg:sticky lg:top-20">
            <DevisCalculator
              devisId={devis.id}
              statut={devis.statut}
              initialTypeHebergement={
                detailsCalcul?.options.typeHebergement ?? devis.typeHebergement
              }
              initialTransportType={
                detailsCalcul?.options.transportType ?? devis.transport?.[0]
              }
              initialRemise={detailsCalcul?.remise ?? 0}
              initialCommentaire={devis.commentaireConseiller}
              initialSnapshot={detailsCalcul}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
