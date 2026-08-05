import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentStatus, PaymentMethod } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, QrCode, Building2, Wallet, ArrowUpRight } from "lucide-react";
import { AdminBankTransferAction } from "./AdminBankTransferAction";
import Link from "next/link";

const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  [PaymentMethod.BINANCE_PAY]: QrCode,
  [PaymentMethod.BANK_TRANSFER]: Building2,
  [PaymentMethod.STRIPE]: CreditCard,
  [PaymentMethod.PAYPAL]: Wallet,
  [PaymentMethod.MOBILE_MONEY]: CreditCard,
};

const statusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [PaymentStatus.PROCESSING]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [PaymentStatus.PAID]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [PaymentStatus.FAILED]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  [PaymentStatus.EXPIRED]: "bg-muted text-muted-foreground border-border",
  [PaymentStatus.REFUNDED]: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [PaymentStatus.CANCELLED]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "En attente",
  [PaymentStatus.PROCESSING]: "Traitement",
  [PaymentStatus.PAID]: "Payé",
  [PaymentStatus.FAILED]: "Échoué",
  [PaymentStatus.EXPIRED]: "Expiré",
  [PaymentStatus.REFUNDED]: "Remboursé",
  [PaymentStatus.CANCELLED]: "Annulé",
};

export default async function AdminPaiementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const transactions = await prisma.paymentTransaction.findMany({
    include: {
      user: { select: { name: true, email: true, prenom: true } },
      reservation: { select: { id: true, devisId: true } },
      provider: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVolume = transactions
    .filter((t) => t.status === PaymentStatus.PAID)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPending = transactions.filter((t) => t.status === PaymentStatus.PENDING).length;
  const totalPaid = transactions.filter((t) => t.status === PaymentStatus.PAID).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestion des Transactions & Paiements
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez les règlements Binance Pay, Virements bancaires et mettez à jour les statuts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Volume Encaissé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">{totalVolume.toFixed(2)} €</div>
            <p className="text-[11px] text-muted-foreground mt-1">{totalPaid} transactions validées</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paiements En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600">{totalPending}</div>
            <p className="text-[11px] text-muted-foreground mt-1">À valider ou en cours de traitement</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{transactions.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Historique complet</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-bold">Historique des Transactions</CardTitle>
          <CardDescription className="text-xs">
            Toutes les tentatives de règlement des clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
              <p>Aucune transaction enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Réservation</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const MethodIcon = methodIcons[tx.method] || CreditCard;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-bold text-foreground">
                              {tx.user.prenom || tx.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MethodIcon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold">
                              {tx.method === "BINANCE_PAY" ? "Binance Pay" : "Virement"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-primary">
                          {tx.amount.toString()} {tx.currency}
                        </TableCell>

                        <TableCell>
                          <Badge className={`border text-xs ${statusColors[tx.status]}`}>
                            {statusLabels[tx.status]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Link
                            href={`/reservations/${tx.reservationId}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            #{tx.reservationId}
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {tx.providerRef || "-"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        <TableCell className="text-right">
                          {tx.status === PaymentStatus.PENDING && tx.method === PaymentMethod.BANK_TRANSFER && (
                            <AdminBankTransferAction transactionId={tx.id} />
                          )}
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
