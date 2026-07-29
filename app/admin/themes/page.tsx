import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTheme } from "@/app/admin/themes/actions/create-theme.action";
import { createRegion } from "@/app/admin/themes/actions/create-region.action";
import DeleteThemeForm from "@/components/admin/themes/DeleteThemeForm";
import DeleteRegionForm from "@/components/admin/themes/DeleteRegionForm";

export default async function AdminThemesPage() {
  const [themes, regions] = await Promise.all([
    prisma.theme.findMany({
      include: { _count: { select: { circuits: true } } },
      orderBy: { nom: "asc" },
    }),
    prisma.region.findMany({
      include: { _count: { select: { circuits: true } } },
      orderBy: { nom: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏷️ Thèmes & Régions</h1>
        <p className="text-muted-foreground text-sm">
          Gérez les catégories utilisées pour classer les circuits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thèmes */}
        <Card>
          <CardHeader>
            <CardTitle>Thèmes ({themes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={createTheme} className="flex gap-2">
              <Input
                name="nom"
                placeholder="Nom du thème (ex: Aventure)"
                required
                className="flex-1"
              />
              <Button type="submit">Ajouter</Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Circuits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      Aucun thème défini.
                    </TableCell>
                  </TableRow>
                ) : (
                  themes.map((theme) => (
                    <TableRow key={theme.id}>
                      <TableCell className="font-medium">{theme.nom}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {theme._count.circuits}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteThemeForm
                          themeId={theme.id}
                          circuitCount={theme._count.circuits}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Régions */}
        <Card>
          <CardHeader>
            <CardTitle>Régions ({regions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={createRegion} className="flex gap-2">
              <Input
                name="nom"
                placeholder="Nom de la région (ex: Menabe)"
                required
                className="flex-1"
              />
              <Button type="submit">Ajouter</Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Circuits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      Aucune région définie.
                    </TableCell>
                  </TableRow>
                ) : (
                  regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.nom}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {region._count.circuits}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteRegionForm
                          regionId={region.id}
                          circuitCount={region._count.circuits}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
