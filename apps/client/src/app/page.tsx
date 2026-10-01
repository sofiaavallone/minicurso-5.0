import type { Capsule } from "@repo/types";
import { HomeView } from "@/components";
import { apiGet } from "@/lib/api";
import { mockCapsules } from "@/lib/mocks";

// O estado de cada cápsula (guardada ou disponível) depende da data atual, então a página não pode ser pré-renderizada no build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: capsules, isMocked } = await apiGet<Capsule[]>("/capsules", mockCapsules);

  return (
    <main>
      <HomeView initialCapsules={capsules} offline={isMocked} />
    </main>
  );
}
