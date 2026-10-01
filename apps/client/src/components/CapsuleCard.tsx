import type { Letter } from "@repo/types";
import { CATEGORY_STYLES, formatShortDate } from "@/lib/capsules";
import { CapsuleStamp } from "./CapsuleStamp";
import { CategoryTag } from "./CategoryTag";
import { SparkleIcon, TrashIcon } from "./icons";

type CapsuleCardProps = {
  letter: Letter;
  ready: boolean;
  daysLeft: number;
  onOpen: (letter: Letter) => void;
  onDelete: (letter: Letter) => void;
};

export function CapsuleCard({ letter, ready, daysLeft, onOpen, onDelete }: CapsuleCardProps) {
  const colors = CATEGORY_STYLES[letter.category];

  return (
    <article className="flex flex-col gap-3">
      {/* Envelope */}
      <div
        role={ready ? "button" : undefined}
        tabIndex={ready ? 0 : undefined}
        aria-label={ready ? `Abrir carta "${letter.title}"` : undefined}
        onClick={ready ? () => onOpen(letter) : undefined}
        onKeyDown={
          ready
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpen(letter);
                }
              }
            : undefined
        }
        className={`relative aspect-[1.4] overflow-hidden rounded-2xl shadow-[0_10px_24px_-12px_rgba(120,20,70,0.45)] ${
          ready
            ? "cursor-pointer ring-[3px] ring-[#c6f57f] ring-offset-[3px] ring-offset-[#fff4f9] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-[#8a1f9e]"
            : ""
        }`}
        style={{ backgroundColor: colors.envelope }}
      >
        {/* Bolso inferior (dobras laterais do envelope) */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: colors.pocket, clipPath: "polygon(0 100%, 50% 55%, 100% 100%)" }}
        />
        {/* Aba superior */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[60%]"
          style={{ backgroundColor: colors.flap, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />

        {ready && (
          <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#c6f57f] px-3 py-1.5 font-mono text-[11px] font-bold text-neutral-950">
            <SparkleIcon className="h-3 w-3" />
            Chegou a hora
          </span>
        )}

        <div className="absolute right-3 top-3 z-10">
          <CapsuleStamp />
        </div>

        {/* Papel da carta */}
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl bg-[#fff1f7] p-4 shadow-sm">
          <h3 className="font-display text-xl leading-tight text-neutral-950">{letter.title}</h3>
          <div className="mt-3 flex items-center justify-between border-t border-dotted border-[#f3c3d8] pt-3">
            <CategoryTag category={letter.category} />
            <time dateTime={letter.deliverAt} className="font-mono text-xs text-neutral-800">
              {formatShortDate(letter.deliverAt)}
            </time>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between gap-3">
        {ready ? (
          <p className="text-sm text-neutral-900">Clique na carta para abrir</p>
        ) : (
          <div>
            <p className="text-sm text-neutral-900">Ainda não chegou a hora</p>
            <p className="font-mono text-xs font-semibold text-[#8a1f9e]">
              Faltam {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onDelete(letter)}
          aria-label={`Excluir "${letter.title}"`}
          className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-[#fbd3e6] hover:text-[#8a1047]"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
