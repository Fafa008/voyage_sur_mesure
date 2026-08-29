// ImageManager.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, GripVertical, Loader2, X } from "lucide-react";

export interface ImageItem {
  url: string;
  legende?: string | null;
  ordre?: number | null;
}

interface ImageManagerProps {
  name?: string;
  initialImages?: ImageItem[];
}

export function ImageManager({
  name = "images",
  initialImages = [],
}: ImageManagerProps) {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      setError(null);
      const uploaded: ImageItem[] = [];

      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Erreur upload");
          uploaded.push({ url: data.url, legende: "", ordre: 0 });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Erreur upload");
        }
      }

      if (uploaded.length) {
        setImages((prev) =>
          [...prev, ...uploaded].map((i, idx) => ({ ...i, ordre: idx })),
        );
        router.refresh();
      }

      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [router],
  );

  const remove = (i: number) =>
    setImages((p) =>
      p.filter((_, x) => x !== i).map((v, n) => ({ ...v, ordre: n })),
    );
  const move = (i: number, d: -1 | 1) =>
    setImages((p) => {
      const t = i + d;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n.map((v, k) => ({ ...v, ordre: k }));
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Images du circuit</h3>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, WebP, GIF, AVIF (5 Mo max)
          </p>
        </div>
        <Button
          className="rounded-xl gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          type="button"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {uploading ? "Importation..." : "Ajouter"}
        </Button>
      </div>

      <input
        hidden
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!images.length && !uploading ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 dark:bg-zinc-900/40">
          <ImagePlus className="mb-3 h-10 w-10 opacity-40" />
          <p className="font-medium">Aucune image</p>
          <p className="text-xs text-muted-foreground">
            Importez les photos du circuit.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={img.url}
              className="group overflow-hidden rounded-xl border bg-card transition"
            >
              <div className="relative h-44">
                <Image
                  src={img.url}
                  alt={img.legende || ""}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-destructive hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  <GripVertical className="h-3 w-3" />
                  {index + 1}
                </span>
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    type="button"
                  >
                    ←
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    type="button"
                  >
                    →
                  </Button>
                </div>
              </div>
              <div className="border-t bg-background p-3 dark:bg-zinc-900">
                <Input
                  value={img.legende ?? ""}
                  placeholder="Légende"
                  onChange={(e) =>
                    setImages((p) =>
                      p.map((v, i) =>
                        i === index ? { ...v, legende: e.target.value } : v,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <input type="hidden" name={name} value={JSON.stringify(images)} />
    </div>
  );
}
