"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { deleteRegion } from "@/app/admin/themes/actions/delete-region.action";

interface DeleteRegionFormProps {
  regionId: number;
  circuitCount: number;
}

export default function DeleteRegionForm({
  regionId,
  circuitCount,
}: DeleteRegionFormProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (circuitCount > 0) {
        event.preventDefault();
        alert(
          `Impossible de supprimer : ${circuitCount} circuit(s) utilisent cette région.`,
        );
        return;
      }
      if (!confirm("Supprimer cette région ?")) {
        event.preventDefault();
      }
    },
    [circuitCount],
  );

  return (
    <form action={deleteRegion} className="inline" onSubmit={handleSubmit}>
      <input type="hidden" name="regionId" value={regionId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={circuitCount > 0}
      >
        Supprimer
      </Button>
    </form>
  );
}
