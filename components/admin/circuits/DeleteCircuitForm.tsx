"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { deleteCircuit } from "@/app/admin/circuits/actions/delete-circuit.action";

interface DeleteCircuitFormProps {
  circuitId: number;
}

export default function DeleteCircuitForm({
  circuitId,
}: DeleteCircuitFormProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!confirm("Supprimer ce circuit ?")) {
        event.preventDefault();
      }
    },
    [],
  );

  return (
    <form action={deleteCircuit} className="inline" onSubmit={handleSubmit}>
      <input type="hidden" name="circuitId" value={circuitId} />
      <Button type="submit" variant="destructive" size="sm">
        Supprimer
      </Button>
    </form>
  );
}
