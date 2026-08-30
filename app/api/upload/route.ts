import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";
import { put } from '@vercel/blob';

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

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
  const extension = file.name.split('.').pop() || "jpg";
  const safeName = `${Date.now()}-${randomUUID()}.${extension.toLowerCase()}`;

  try {
    // 6. Upload vers Vercel Blob (store privé)
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(safeName, buffer, {
      access: 'private',
      contentType: file.type,
    });

    // 7. Renvoyer l'URL du proxy pour accéder à l'image privée
    // Les URLs downloadUrl sont temporaires, donc on utilise un proxy local
    const proxyUrl = `/api/images/${safeName}`;
    return NextResponse.json({ url: proxyUrl, downloadUrl: blob.downloadUrl });
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du fichier" },
      { status: 500 }
    );
  }
}
