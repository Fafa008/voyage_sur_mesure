import { NextRequest, NextResponse } from "next/server";

/**
 * Route proxy pour servir les images depuis Vercel Blob privé
 * 
 * GET /api/images/[filename]
 * 
 * Cette route permet d'accéder aux images stockées dans un store Blob privé
 * en les servant via le serveur Next.js.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  try {
    // Pour un store privé, nous utilisons le token pour accéder aux blobs
    const { list, get } = await import('@vercel/blob');
    
    // Chercher le blob correspondant au filename
    const { blobs } = await list({ prefix: filename });
    const blob = blobs.find(b => b.url.includes(filename));
    
    if (!blob) {
      return NextResponse.json(
        { error: "Image non trouvée" },
        { status: 404 }
      );
    }

    // Pour un store privé, utiliser l'URL de téléchargement avec authentification
    const response = await fetch(blob.downloadUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      console.error('Blob download failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Erreur lors du téléchargement de l'image" },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    // Servir l'image avec les headers appropriés
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'image" },
      { status: 500 }
    );
  }
}