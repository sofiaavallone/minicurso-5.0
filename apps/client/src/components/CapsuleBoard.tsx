"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Capsule } from "@repo/types";
import { deleteCapsule } from "@/lib/api";
import { daysUntil, isCapsuleReady, matchesFilter, todayStr, type CapsuleFilterKey } from "@/lib/capsules";
import { CapsuleCard } from "./CapsuleCard";
import { CapsuleFilter } from "./CapsuleFilter";
import { LetterModal } from "./LetterModal";

type CapsuleBoardProps = {
  // A lista fica no HomeView para a cápsula recém-criada aparecer aqui na hora.
  capsules: Capsule[];
  onCapsulesChange: Dispatch<SetStateAction<Capsule[]>>;
  title?: string;
  // Com dados mockados (server fora do ar) as exclusões ficam só na tela.
  offline?: boolean;
};

export function CapsuleBoard({ capsules, onCapsulesChange, title = "Minhas cápsulas", offline = false }: CapsuleBoardProps) {
  const [filter, setFilter] = useState<CapsuleFilterKey>("all");
  const [openCapsule, setOpenCapsule] = useState<Capsule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => todayStr(), []);

  const sorted = useMemo(() => [...capsules].sort((a, b) => a.openDate.localeCompare(b.openDate)), [capsules]);

  const counts = useMemo<Record<CapsuleFilterKey, number>>(
    () => ({
      all: sorted.length,
      locked: sorted.filter((capsule) => matchesFilter(capsule, "locked", today)).length,
      ready: sorted.filter((capsule) => matchesFilter(capsule, "ready", today)).length,
    }),
    [sorted, today],
  );

  const visibleCapsules = sorted.filter((capsule) => matchesFilter(capsule, filter, today));

  const handleDelete = async (capsule: Capsule) => {
    const previous = capsules;
    setError(null);
    onCapsulesChange((current) => current.filter((item) => item.id !== capsule.id));
    if (offline) return;

    try {
      await deleteCapsule(capsule.id);
    } catch {
      onCapsulesChange(previous);
      setError(`Não foi possível excluir "${capsule.title}". Tente novamente.`);
    }
  };

  const handleClose = useCallback(() => setOpenCapsule(null), []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dotted border-[#ff72ad] pb-5">
        <h2 className="font-display text-4xl text-neutral-950 sm:text-5xl">{title}</h2>
        <CapsuleFilter value={filter} counts={counts} onChange={setFilter} />
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[#f3c3d8] bg-white px-4 py-2 text-sm text-[#8a1047]">
          {error}
        </p>
      )}

      {visibleCapsules.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-600">Nenhuma cápsula por aqui ainda.</p>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCapsules.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              ready={isCapsuleReady(capsule, today)}
              daysLeft={daysUntil(capsule.openDate, today)}
              onOpen={setOpenCapsule}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {openCapsule && <LetterModal capsule={openCapsule} onClose={handleClose} />}
    </section>
  );
}
