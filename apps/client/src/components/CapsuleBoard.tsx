"use client";

import { useCallback, useMemo, useState } from "react";
import type { Letter } from "@repo/types";
import { daysUntil, isLetterReady, matchesFilter, type CapsuleFilterKey } from "@/lib/capsules";
import { deleteLetter } from "@/lib/letters";
import { CapsuleCard } from "./CapsuleCard";
import { CapsuleFilter } from "./CapsuleFilter";
import { LetterModal } from "./LetterModal";

type CapsuleBoardProps = {
  letters: Letter[];
  title?: string;
  // Com dados mockados (server fora do ar) as exclusões ficam só na tela.
  offline?: boolean;
};

export function CapsuleBoard({ letters: initialLetters, title = "Minhas cápsulas", offline = false }: CapsuleBoardProps) {
  const [letters, setLetters] = useState(initialLetters);
  const [filter, setFilter] = useState<CapsuleFilterKey>("all");
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);

  const counts = useMemo<Record<CapsuleFilterKey, number>>(
    () => ({
      all: letters.length,
      locked: letters.filter((letter) => matchesFilter(letter, "locked", now)).length,
      ready: letters.filter((letter) => matchesFilter(letter, "ready", now)).length,
    }),
    [letters, now],
  );

  const visibleLetters = letters.filter((letter) => matchesFilter(letter, filter, now));

  const handleDelete = async (letter: Letter) => {
    const previous = letters;
    setError(null);
    setLetters((current) => current.filter((item) => item.id !== letter.id));
    if (offline) return;

    try {
      await deleteLetter(letter.id);
    } catch {
      setLetters(previous);
      setError(`Não foi possível excluir "${letter.title}". Tente novamente.`);
    }
  };

  const handleClose = useCallback(() => setOpenLetter(null), []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dotted border-[#ff72ad] pb-5">
        <h1 className="font-display text-4xl text-neutral-950 sm:text-5xl">{title}</h1>
        <CapsuleFilter value={filter} counts={counts} onChange={setFilter} />
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[#f3c3d8] bg-white px-4 py-2 text-sm text-[#8a1047]">
          {error}
        </p>
      )}

      {visibleLetters.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-600">Nenhuma cápsula por aqui ainda.</p>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLetters.map((letter) => {
            return (
              <CapsuleCard
                key={letter.id}
                letter={letter}
                ready={isLetterReady(letter, now)}
                daysLeft={daysUntil(letter.deliverAt, now)}
                onOpen={setOpenLetter}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      {openLetter && <LetterModal letter={openLetter} onClose={handleClose} />}
    </section>
  );
}
