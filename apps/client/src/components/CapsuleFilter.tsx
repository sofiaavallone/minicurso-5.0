import { CAPSULE_FILTERS, type CapsuleFilterKey } from "@/lib/capsules";

type CapsuleFilterProps = {
  value: CapsuleFilterKey;
  counts: Record<CapsuleFilterKey, number>;
  onChange: (value: CapsuleFilterKey) => void;
};

export function CapsuleFilter({ value, counts, onChange }: CapsuleFilterProps) {
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-full border border-[#f3c3d8] bg-white p-1">
      {CAPSULE_FILTERS.map(({ key, label }) => {
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
              active ? "bg-neutral-950 font-semibold text-white" : "text-neutral-800 hover:bg-[#fdeaf3]"
            }`}
          >
            {label}
            <span className={`font-mono text-xs ${active ? "text-white/80" : "text-neutral-500"}`}>
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
