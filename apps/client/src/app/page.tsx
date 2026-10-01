import type { Letter } from "@repo/types";
import { CapsuleBoard } from "@/components/CapsuleBoard";
import { apiGet } from "@/lib/api";
import { mockLetters } from "@/lib/mocks";

// A contagem de dias depende da data atual, então a página não pode ser pré-renderizada no build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: letters, isMocked } = await apiGet<Letter[]>("/letters", mockLetters);

  return (
    <main className="min-h-screen">
      {isMocked && (
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-center text-sm text-yellow-900">
          <strong>Modo offline:</strong> sem comunicação com o servidor. Os dados abaixo são mockados.
        </div>
      )}
      <CapsuleBoard letters={letters} offline={isMocked} />
    </main>
  );
}
