import type { LetterCategory } from "@repo/types";
import { CATEGORY_STYLES } from "@/lib/capsules";

type CategoryTagProps = {
  category: LetterCategory;
};

export function CategoryTag({ category }: CategoryTagProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#fbd3e6] px-2.5 py-0.5 text-xs font-semibold text-[#8a1047]">
      {CATEGORY_STYLES[category].label}
    </span>
  );
}
