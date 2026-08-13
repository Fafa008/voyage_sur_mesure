"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { deleteTheme } from "@/app/admin/themes/actions/delete-theme.action";

interface DeleteThemeFormProps {
  themeId: number;
  circuitCount: number;
}

export default function DeleteThemeForm({
  themeId,
  circuitCount,
}: DeleteThemeFormProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (circuitCount > 0) {
        event.preventDefault();
        alert(
          `Impossible de supprimer : ${circuitCount} circuit(s) utilisent ce thème.`,
        );
        return;
      }
      if (!confirm("Supprimer ce thème ?")) {
        event.preventDefault();
      }
    },
    [circuitCount],
  );

  return (
    <form action={deleteTheme} className="inline" onSubmit={handleSubmit}>
      <input type="hidden" name="themeId" value={themeId} />
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
