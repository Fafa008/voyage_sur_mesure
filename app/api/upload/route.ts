import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "circuits");

export async function POST(request: Request) {
  // 1. Vérifier l'authentification et le rôle admin
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || user.role.nom !== RoleNom.admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 2. Récupérer le fichier
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
  }

  // 3. Valider le type MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Type de fichier non autorisé : ${file.type}` },
      { status: 400 }
    );
  }

  // 4. Valider la taille
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 }
    );
  }

  // 5. Générer un nom unique et sécurisé
  const extension = path.extname(file.name) || ".jpg";
  const safeName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  try {
    // 6. S'assurer que le dossier existe puis écrire le fichier
    await mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 7. Renvoyer l'URL publique
    const url = `/uploads/circuits/${safeName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erreur lors de l'upload :", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du fichier" },
      { status: 500 }
    );
  }
}
