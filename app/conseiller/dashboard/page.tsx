import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatutDevis, Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DevisFilters } from "@/components/devis/DevisFilters";
import {
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Mail,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Inbox,
  Search,
  RotateCcw,
  MapPin,
  Wallet,
} from "lucide-react";
import { statutDevisColors, statutDevisLabels } from "@/lib/statut-config";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/currency/PriceDisplay";

const DEVIS_PER_PAGE = 10;

interface ConseillerDashboardProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    statut?: string;
  }>;
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
    "from-fuchsia-500 to-purple-600",
    "from-lime-500 to-green-600",
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

export default async function ConseillerDashboardPage({
  searchParams,
}: ConseillerDashboardProps) {
  const { page, search, statut } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isConseillerOnly = user?.role?.nom === "conseiller";
  const conseillerFilter: Prisma.DevisWhereInput = isConseillerOnly ? { conseillerId: session.user.id } : {};

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * DEVIS_PER_PAGE;

  // Global counts for KPI cards
  const [countEnCours, countEnModification, countValide, countAccepte, countReserve, countRefuse, countTotal] = await Promise.all([
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.en_cours } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.en_modification } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.valide } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.accepte } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.reserve } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter, statut: StatutDevis.refuse } }),
    prisma.devis.count({ where: { deletedAt: null, ...conseillerFilter } }),
  ]);

  // Where query for current filtered table
  const where: Prisma.DevisWhereInput = {
    deletedAt: null,
    ...conseillerFilter,
  };

  if (statut && Object.values(StatutDevis).includes(statut as StatutDevis)) {
    where.statut = statut as StatutDevis;
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { prenom: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { circuit: { titre: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [devisList, totalFiltered] = await Promise.all([
    prisma.devis.findMany({
      where,
      take: DEVIS_PER_PAGE,
      skip,
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
          select: {
            titre: true,
            region: { select: { nom: true } },
          },
        },
      },
      orderBy: {
        dateDemande: "desc",
      },
    }),
    prisma.devis.count({ where }),
  ]);

  const totalPages = Math.ceil(totalFiltered / DEVIS_PER_PAGE);

  // Status tabs for quick filtering
  const statusTabs = [
    { label: "Tous", value: "", count: countTotal },
    { label: "À traiter", value: "en_cours", count: countEnCours, dotColor: "bg-amber-500" },
    { label: "Modif. demandées", value: "en_modification", count: countEnModification, dotColor: "bg-orange-500" },
    { label: "Validés", value: "valide", count: countValide, dotColor: "bg-blue-500" },
    { label: "Acceptés", value: "accepte", count: countAccepte, dotColor: "bg-emerald-500" },
    { label: "Réservés", value: "reserve", count: countReserve, dotColor: "bg-purple-500" },
    { label: "Refusés", value: "refuse", count: countRefuse, dotColor: "bg-rose-500" },
  ];

  const activeStatut = statut || "";

  return (
    <div className="space-y-6">
      {/* ───── Hero Header ───── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/12 via-primary/5 to-transparent border border-primary/15 p-6 sm:p-8">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <Inbox className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Centre de Gestion
                </h1>
                <p className="text-xs text-muted-foreground">
                  Traitez les demandes, proposez des offres personnalisées
                </p>
              </div>
            </div>
          </div>

          {/* Summary Chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-xl px-3.5 py-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">En attente</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {countEnCours + countEnModification}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-xl px-3.5 py-2 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Total traités</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {countValide + countAccepte + countReserve}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── KPI Cards ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* À Traiter (Urgent) */}
        <Link href="/conseiller/dashboard?statut=en_cours" className="group">
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
            activeStatut === "en_cours"
              ? "ring-2 ring-amber-500/50 shadow-amber-500/10 shadow-lg"
              : "hover:shadow-amber-500/5"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                  <Clock className="h-4.5 w-4.5 text-amber-500" />
                </div>
                {countEnCours > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Urgent
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{countEnCours}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">À traiter absolument</p>
            </CardContent>
          </Card>
        </Link>

        {/* Modifications Client */}
        <Link href="/conseiller/dashboard?statut=en_modification" className="group">
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
            activeStatut === "en_modification"
              ? "ring-2 ring-orange-500/50 shadow-orange-500/10 shadow-lg"
              : "hover:shadow-orange-500/5"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/15 transition-colors">
                  <FileText className="h-4.5 w-4.5 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{countEnModification}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Modifications demandées</p>
            </CardContent>
          </Card>
        </Link>

        {/* Validés & Acceptés */}
        <Link href="/conseiller/dashboard?statut=valide" className="group">
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
            activeStatut === "valide"
              ? "ring-2 ring-emerald-500/50 shadow-emerald-500/10 shadow-lg"
              : "hover:shadow-emerald-500/5"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{countValide + countAccepte}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Devis validés / acceptés</p>
            </CardContent>
          </Card>
        </Link>

        {/* Total dossiers */}
        <Link href="/conseiller/dashboard" className="group">
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
            !activeStatut
              ? "ring-2 ring-primary/40 shadow-primary/10 shadow-lg"
              : "hover:shadow-primary/5"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 to-primary" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Users className="h-4.5 w-4.5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{countTotal}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total des dossiers</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ───── Table des demandes ───── */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Inbox className="w-4 h-4 text-primary" />
                Inbox des Demandes
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {totalFiltered} dossier{totalFiltered > 1 ? "s" : ""} trouvé{totalFiltered > 1 ? "s" : ""}
                {(search || statut) && (
                  <Link
                    href="/conseiller/dashboard"
                    className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Réinitialiser
                  </Link>
                )}
              </CardDescription>
            </div>
          </div>

          {/* Status Pill Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {statusTabs.map((tab) => (
              <Link
                key={tab.value}
                href={
                  tab.value
                    ? `/conseiller/dashboard?statut=${tab.value}${search ? `&search=${encodeURIComponent(search)}` : ""}`
                    : `/conseiller/dashboard${search ? `?search=${encodeURIComponent(search)}` : ""}`
                }
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  activeStatut === tab.value
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-background text-muted-foreground border-border/60 hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {tab.dotColor && (
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tab.dotColor)} />
                )}
                {tab.label}
                <span className={cn(
                  "text-[10px] tabular-nums ml-0.5",
                  activeStatut === tab.value ? "text-background/70" : "text-muted-foreground/60"
                )}>
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>

          {/* Search Filters */}
          <DevisFilters currentSearch={search} currentStatut={statut} showStatusFilter={false} />
        </CardHeader>

        <CardContent className="p-0">
          {devisList.length === 0 ? (
            /* ───── Empty State ───── */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Aucun dossier trouvé
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                Aucune demande ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
              </p>
              <Link
                href="/conseiller/dashboard"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser les filtres
              </Link>
            </div>
          ) : (
            <>
              {/* ───── Desktop Table ───── */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-4">Client</TableHead>
                      <TableHead>Circuit / Destination</TableHead>
                      <TableHead>Voyageurs</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devisList.map((devis) => {
                      const clientName = `${devis.user.prenom || ""} ${devis.user.name}`.trim();
                      const initials = getInitials(devis.user.prenom, devis.user.name);
                      const avatarColor = getAvatarColor(clientName);

                      return (
                        <TableRow
                          key={devis.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          {/* Client Column */}
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm",
                                  avatarColor
                                )}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground text-[13px] truncate">
                                  {clientName}
                                </p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  {devis.user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Circuit Column */}
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-[13px] text-foreground truncate max-w-[200px]">
                                {devis.circuit?.titre || "Sur mesure"}
                              </p>
                              {devis.circuit?.region?.nom && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {devis.circuit.region.nom}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Voyageurs Column */}
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {devis.nombrePersonnes} pers.
                                <span className="hidden lg:inline text-[10px] ml-0.5 text-muted-foreground/70">
                                  ({devis.adultes}A
                                  {devis.enfants > 0 ? `+${devis.enfants}E` : ""}
                                  {devis.ados > 0 ? `+${devis.ados}Ad` : ""})
                                </span>
                              </span>
                            </div>
                          </TableCell>

                          {/* Budget Column */}
                          <TableCell>
                            {devis.budgetMin || devis.budgetMax ? (
                              <div className="flex items-center gap-1.5 text-[12px]">
                                <Wallet className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="font-medium text-foreground tabular-nums">
                                  {devis.budgetMin ? <PriceDisplay amount={devis.budgetMin} size="xs" /> : "—"}
                                  {" – "}
                                  {devis.budgetMax ? <PriceDisplay amount={devis.budgetMax} size="xs" /> : "∞"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">Non renseigné</span>
                            )}
                          </TableCell>

                          {/* Date Column */}
                          <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                            {new Date(devis.dateDemande).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>

                          {/* Status Column */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-2 py-0.5 font-semibold gap-1.5",
                                statutDevisColors[devis.statut] || ""
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  devis.statut === StatutDevis.en_cours && "bg-amber-500",
                                  devis.statut === StatutDevis.en_modification && "bg-orange-500",
                                  devis.statut === StatutDevis.valide && "bg-blue-500",
                                  devis.statut === StatutDevis.accepte && "bg-emerald-500",
                                  devis.statut === StatutDevis.reserve && "bg-purple-500",
                                  devis.statut === StatutDevis.refuse && "bg-rose-500"
                                )}
                              />
                              {statutDevisLabels[devis.statut] || devis.statut}
                            </Badge>
                          </TableCell>

                          {/* Action Column */}
                          <TableCell className="text-right pr-4">
                            <Link
                              href={`/conseiller/devis/${devis.id}`}
                              className={cn(
                                buttonVariants({ variant: "default", size: "sm" }),
                                "gap-1.5 text-xs group-hover:shadow-md transition-shadow"
                              )}
                            >
                              Traiter
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* ───── Mobile Card List ───── */}
              <div className="md:hidden divide-y divide-border/40">
                {devisList.map((devis) => {
                  const clientName = `${devis.user.prenom || ""} ${devis.user.name}`.trim();
                  const initials = getInitials(devis.user.prenom, devis.user.name);
                  const avatarColor = getAvatarColor(clientName);

                  return (
                    <Link
                      key={devis.id}
                      href={`/conseiller/devis/${devis.id}`}
                      className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm",
                          avatarColor
                        )}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-[13px] text-foreground truncate">
                              {clientName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {devis.circuit?.titre || "Sur mesure"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] px-1.5 py-0 font-semibold shrink-0",
                              statutDevisColors[devis.statut] || ""
                            )}
                          >
                            {statutDevisLabels[devis.statut] || devis.statut}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {devis.nombrePersonnes}
                          </span>
                          {(devis.budgetMin || devis.budgetMax) && (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              {devis.budgetMin ? <PriceDisplay amount={devis.budgetMin} size="xs" /> : "—"} – {devis.budgetMax ? <PriceDisplay amount={devis.budgetMax} size="xs" /> : "∞"}
                            </span>
                          )}
                          <span className="ml-auto tabular-nums">
                            {new Date(devis.dateDemande).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 mt-3 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* ───── Pagination ───── */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-between border-t border-border/40 px-4 sm:px-6 py-4"
              aria-label="Pagination des devis conseiller"
            >
              <span className="text-xs text-muted-foreground tabular-nums">
                Page <span className="font-semibold text-foreground">{currentPage}</span> sur{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
                <span className="hidden sm:inline"> · {totalFiltered} résultat{totalFiltered > 1 ? "s" : ""}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/conseiller/dashboard?page=${currentPage - 1}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }${statut ? `&statut=${statut}` : ""}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 px-3 gap-1",
                    currentPage <= 1 && "pointer-events-none opacity-40"
                  )}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Précédent</span>
                </Link>

                <Link
                  href={`/conseiller/dashboard?page=${currentPage + 1}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }${statut ? `&statut=${statut}` : ""}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 px-3 gap-1",
                    currentPage >= totalPages && "pointer-events-none opacity-40"
                  )}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </nav>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
