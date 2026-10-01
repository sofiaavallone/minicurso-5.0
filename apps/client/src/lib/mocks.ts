import type { Letter, User } from "@repo/types";

const now = new Date().toISOString();

export const mockUsers: User[] = [
  { id: "1", email: "maria@example.com", name: "Maria Silva", createdAt: now, updatedAt: now },
  { id: "2", email: "joao@example.com", name: "João Souza", createdAt: now, updatedAt: now },
];

export const mockLetters: Letter[] = [
  {
    id: "1",
    title: "Uma conquista que merece ser lembrada",
    category: "memoria",
    content:
      "Hoje meu primeiro pull request foi aceito.\n\nLembre de como você teve medo de enviar — e enviou mesmo assim.",
    deliverAt: "2026-09-20T12:00:00",
    createdAt: "2026-06-27T12:00:00",
    updatedAt: "2026-06-27T12:00:00",
  },
  {
    id: "2",
    title: "Uma ideia que quero tirar do papel",
    category: "sonho",
    content: "Quero ter lançado o meu próprio projeto open source até o fim do ano que vem.",
    deliverAt: "2027-01-23T12:00:00",
    createdAt: "2026-07-10T12:00:00",
    updatedAt: "2026-07-10T12:00:00",
  },
];
