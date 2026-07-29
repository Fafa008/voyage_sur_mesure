import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/app/admin/utilisateurs/actions/update-user-role.action";
import { RoleNom } from "@prisma/client";

const roleLabels: Record<RoleNom, string> = {
  [RoleNom.admin]: "Admin",
  [RoleNom.conseiller]: "Conseiller",
  [RoleNom.client]: "Client",
};

const roleBadgeClass: Record<RoleNom, string> = {
  [RoleNom.admin]: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [RoleNom.conseiller]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [RoleNom.client]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default async function AdminUtilisateursPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: {
        role: true,
        _count: {
          select: { devis: true, avis: true },
        },
      },
      orderBy: { dateInscription: "desc" },
    }),
    prisma.role.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">👥 Utilisateurs</h1>
        <p className="text-muted-foreground text-sm">
          {users.length} compte(s) inscrit(s) — gérez les rôles et accès
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead className="text-right">Modifier le rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roleNom = user.role?.nom;
                  const isCurrentUser = user.id === session?.user.id;

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.prenom ? `${user.prenom} ` : ""}
                        {user.name}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            Vous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.telephone ?? "—"}
                      </TableCell>
                      <TableCell>
                        {roleNom ? (
                          <Badge
                            variant="outline"
                            className={roleBadgeClass[roleNom]}
                          >
                            {roleLabels[roleNom]}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sans rôle</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.dateInscription).toLocaleDateString(
                          "fr-FR",
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user._count.devis} devis · {user._count.avis} avis
                      </TableCell>
                      <TableCell className="text-right">
                        {isCurrentUser ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <form
                            action={updateUserRole}
                            className="inline-flex items-center gap-2 justify-end"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <select
                              name="roleId"
                              defaultValue={user.roleId ?? undefined}
                              className="h-7 rounded-md border border-input bg-input/20 px-2 text-xs"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {roleLabels[role.nom]}
                                </option>
                              ))}
                            </select>
                            <Button type="submit" variant="outline" size="sm">
                              Appliquer
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
