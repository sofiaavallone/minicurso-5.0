import { prisma } from "../src/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const existing = await prisma.letter.count();
  if (existing > 0) {
    console.log(`🌱 Seed ignorado: já existem ${existing} cartas no banco`);
    return;
  }

  const now = Date.now();
  await prisma.letter.createMany({
    data: [
      {
        title: "Uma conquista que merece ser lembrada",
        category: "memoria",
        content:
          "Hoje meu primeiro pull request foi aceito.\n\nLembre de como você teve medo de enviar — e enviou mesmo assim.",
        createdAt: new Date(now - 90 * DAY_MS),
        deliverAt: new Date(now - 60 * 1000),
      },
      {
        title: "Uma ideia que quero tirar do papel",
        category: "sonho",
        content: "Quero ter lançado o meu próprio projeto open source até o fim do ano que vem.",
        createdAt: new Date(now - 30 * DAY_MS),
        deliverAt: new Date(now + 120 * DAY_MS),
      },
    ],
  });
  console.log("🌱 Seed concluído: 2 cartas criadas");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
