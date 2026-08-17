import { prisma } from "@/lib/prisma";
import { ReservationStatus, StatutReservation } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { buttonVariants } from "@/components/ui/button";
import { DeleteReservationButton } from "@/components/reservation/DeleteReservationButton";
import { CalendarCheck, Users } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const statutColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutReservation.annulee]:
    "bg-rose-500/10 text-rose-600 border-rose-500/20",
  [StatutReservation.terminee]:
    "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statusColors: Record<ReservationStatus, string> = {
  [ReservationStatus.BROUILLON]: "bg-muted text-muted-foreground border-border",
  [ReservationStatus.EN_ATTENTE]:
    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [ReservationStatus.CONFIRMEE]:
    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [ReservationStatus.PAYEE]:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [ReservationStatus.TERMINEE]:
    "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [ReservationStatus.ANNULEE]:
    "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statusLabels: Record<ReservationStatus, string> = {
  [ReservationStatus.BROUILLON]: "Brouillon",
  [ReservationStatus.EN_ATTENTE]: "En attente de paiement",
  [ReservationStatus.CONFIRMEE]: "Confirmée",
  [ReservationStatus.PAYEE]: "Payée",
  [ReservationStatus.TERMINEE]: "Terminée",
  [ReservationStatus.ANNULEE]: "Annulée",
};

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      devis: {
        include: {
          user: {
            select: { name: true, prenom: true, email: true },
          },
          circuit: { select: { titre: true, slug: true } },
        },
      },
      circuit: { select: { titre: true, slug: true } },
      user: { select: { name: true, prenom: true, email: true } },
      paiement: { include: { mode: true } },
    },
    orderBy: { dateReservation: "desc" },
  });

  const totalReservations = reservations.length;
  const payees = reservations.filter(
    (r) => r.status === ReservationStatus.PAYEE,
  ).length;
  const enAttente = reservations.filter(
    (r) => r.status === ReservationStatus.EN_ATTENTE,
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Gestion des Réservations
        </h1>
        <p className="text-sm text-muted-foreground">
          Consultez, suivez et supprimez les réservations de tous les clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Réservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReservations}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dossiers enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {payees}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Règlements confirmés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En attente de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {enAttente}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              À finaliser
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Liste des Réservations
          </CardTitle>
          <CardDescription className="text-xs">
            Toutes les réservations de tous les clients, du plus récent au plus
            ancien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
              <p>Aucune réservation enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Voyage</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Voyageurs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((res) => {
                    const client =
                      res.devis?.user ?? res.user;
                    const circuit = res.devis?.circuit ?? res.circuit;
                    const clientName = client
                      ? `${client.prenom ?? ""} ${client.name ?? ""}`.trim() ||
                        client.email
                      : "—";

                    return (
                      <TableRow key={res.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-bold text-foreground">
                              {clientName}
                            </p>
                            {client?.email && (
                              <p className="text-xs text-muted-foreground">
                                {client.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {circuit ? (
                            <Link
                              href={`/circuits/${circuit.slug}`}
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              {circuit.titre}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {res.devis
                                ? `Voyage personnalisé #${res.devis.id}`
                                : `Réservation directe #${res.id}`}
                            </span>
                          )}
                          <span className="block text-xs text-muted-foreground">
                            Réservation #{res.id}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(res.dateReservation).toLocaleDateString(
                            "fr-FR",
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            {res.devis?.nombrePersonnes ?? res.nbVoyageurs}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2.5 py-0.5 font-medium ${statusColors[res.status]}`}
                            >
                              {statusLabels[res.status]}
                            </Badge>
                            {res.statut && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0 font-medium ${statutColors[res.statut]}`}
                              >
                                {res.statut}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary text-sm">
                          {res.montantFinal
                            ? formatCurrency(res.montantFinal)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/reservations/${res.id}`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
                            >
                              Détail
                            </Link>
                            <DeleteReservationButton
                              reservationId={res.id}
                              label="Supprimer"
                              redirectTo="/admin/reservations"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
