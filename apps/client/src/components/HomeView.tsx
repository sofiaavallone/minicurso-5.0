"use client";

import { useEffect, useState } from "react";
import type { Capsule } from "@repo/types";
import { formatShortDate } from "@/lib/capsules";
import { CapsuleBoard } from "./CapsuleBoard";
import { CreateCapsuleModal } from "./CreateCapsuleModal";
import { Hero } from "./Hero";
import { Toast, type ToastMessage } from "./Toast";

type HomeViewProps = {
  initialCapsules: Capsule[];
  offline: boolean;
};

export function HomeView({ initialCapsules, offline }: HomeViewProps) {
  const [capsules, setCapsules] = useState(initialCapsules);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  const onSaved = (capsule: Capsule) => {
    setCreateOpen(false);
    setCapsules((current) => [...current, capsule]);
    setToast({
      id: Date.now(),
      kind: "ok",
      text: `Guardada! A carta chega em ${capsule.email} no dia ${formatShortDate(capsule.openDate)}.`,
    });
  };

  return (
    <>
      <Hero onCreate={() => setCreateOpen(true)} />
      <CreateCapsuleModal open={isCreateOpen} onClose={() => setCreateOpen(false)} onSaved={onSaved} />
      <Toast toast={toast} />
      {offline && (
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-center text-sm text-yellow-900">
          <strong>Modo offline:</strong> sem comunicação com o servidor. Os dados abaixo são mockados.
        </div>
      )}
      <CapsuleBoard capsules={capsules} onCapsulesChange={setCapsules} offline={offline} />
    </>
  );
}
