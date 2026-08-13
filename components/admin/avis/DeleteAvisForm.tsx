"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { deleteAvis } from "@/app/admin/avis/actions/delete-avis.action";

interface DeleteAvisFormProps {
  avisId: number;
}

export default function DeleteAvisForm({ avisId }: DeleteAvisFormProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!confirm("Supprimer cet avis ?")) {
        event.preventDefault();
      }
    },
    [],
  );

  return (
    <form action={deleteAvis} className="inline" onSubmit={handleSubmit}>
      <input type="hidden" name="avisId" value={avisId} />
      <Button type="submit" variant="destructive" size="sm">
        Rejeter
      </Button>
    </form>
  );
}
