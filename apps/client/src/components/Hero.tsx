import { EnvelopeIllustration } from "./EnvelopeIllustration";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-1 -1 2 2" fill="currentColor" className={className} aria-hidden>
      <path d="M0 -1 C0.12 -0.3 0.3 -0.12 1 0 C0.3 0.12 0.12 0.3 0 1 C-0.12 0.3 -0.3 0.12 -1 0 C-0.3 -0.12 -0.12 -0.3 0 -1 Z" />
    </svg>
  );
}

function DottedRule() {
  return (
    <svg width="40" height="4" viewBox="0 0 40 4" className="text-capsule-pink" aria-hidden>
      <line
        x1="2"
        y1="2"
        x2="38"
        y2="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
      />
    </svg>
  );
}

export function Hero({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="bg-capsule-bg pb-16">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <header className="flex justify-end pt-[26px]">
          <button
            type="button"
            onClick={onCreate}
            className="flex h-[39px] items-center gap-2.5 rounded-full border-[1.5px] border-capsule-ink px-[26px] font-sans text-[15px] font-medium text-capsule-ink transition hover:bg-capsule-ink hover:text-white"
          >
            Nova cápsula
            <span className="text-capsule-pink">+</span>
          </button>
        </header>

        <div className="mt-[72px] grid grid-cols-1 items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-8">
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-sm text-capsule-plum">
              <DottedRule />
              cápsula do tempo digital
            </div>

            <h1 className="font-serif text-[52px] leading-[0.98] tracking-[-0.01em] text-capsule-ink sm:text-[68px] lg:text-[84px]">
              Você ainda tem
              <br />
              muita <em className="text-capsule-rose">história</em>
              <br />
              para escrever.
            </h1>

            <p className="mt-[30px] max-w-[440px] font-sans text-[18px] leading-[30px] text-capsule-text">
              Guarde quem você é hoje. Reencontre suas ideias, sonhos e conquistas no futuro.
            </p>

            <button
              type="button"
              onClick={onCreate}
              className="mt-[42px] inline-flex h-12 items-center gap-3 rounded-full bg-capsule-ink px-[30px] font-sans text-[17px] text-white shadow-[0_14px_28px_-8px_rgba(107,22,80,0.28)] transition hover:bg-black"
            >
              <SparkleIcon className="h-4 w-4 text-capsule-orange" />
              Criar cápsula
            </button>
          </div>

          <EnvelopeIllustration />
        </div>
      </div>
    </section>
  );
}
