"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function StartTripForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      className="w-full"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onSubmit();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Starting" : "Start trip"}
    </Button>
  );
}

export function EndTripForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="danger"
      className="w-full"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onSubmit();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Ending" : "End trip"}
    </Button>
  );
}
