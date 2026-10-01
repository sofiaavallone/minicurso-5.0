import type { CapsuleCategory } from "@repo/types";
import { CAPSULE_CATEGORY_OPTIONS } from "@/lib/capsules";

type CategoryTagProps = {
  category: CapsuleCategory;
};

export function CategoryTag({ category }: CategoryTagProps) {
  const { label, bg, fg } = CAPSULE_CATEGORY_OPTIONS[category];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
}
