"use client";

import { useEffect } from "react";
import type { Letter } from "@repo/types";
import { formatLongDate } from "@/lib/capsules";
import { CategoryTag } from "./CategoryTag";
import { CloseIcon } from "./icons";

type LetterModalProps = {
  letter: Letter;
  onClose: () => void;
};

// Altura de cada linha do papel pautado; o texto usa o mesmo line-height para ficar alinhado.
const RULE = 32;

export function LetterModal({ letter, onClose }: LetterModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#8a1047]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-xl rounded-lg bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar carta"
          className="absolute -right-4 -top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#ff72ad] text-white shadow-md transition-transform hover:scale-105"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div
          className="relative max-h-[85vh] overflow-y-auto rounded-lg py-8 pl-12 pr-8"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${RULE - 1}px, #f9d2e3 ${RULE - 1}px ${RULE}px)`,
            backgroundAttachment: "local",
          }}
        >
          {/* Margem vertical do caderno */}
          <span aria-hidden="true" className="absolute bottom-0 left-8 top-0 border-l border-dotted border-[#ff72ad]" />

          <CategoryTag category={letter.category} />

          <h2 id="letter-modal-title" className="mt-2 font-display text-4xl leading-[1.05] text-[#7a0a4e] sm:text-5xl">
            {letter.title}
          </h2>

          <div className="mt-6 space-y-4 text-base text-neutral-900" style={{ lineHeight: `${RULE}px` }}>
            {letter.content.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-dotted border-[#ff72ad] pt-4">
            <div>
              <dt className="font-mono text-[11px] text-[#b0145f]">escrita em</dt>
              <dd className="text-sm text-neutral-900">{formatLongDate(letter.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] text-[#b0145f]">aberta a partir de</dt>
              <dd className="text-sm text-neutral-900">{formatLongDate(letter.deliverAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
