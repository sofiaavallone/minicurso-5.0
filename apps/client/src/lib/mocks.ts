import type { Capsule, User } from "@repo/types";

const now = new Date().toISOString();

export const mockUsers: User[] = [
  { id: "1", email: "maria@example.com", name: "Maria Silva", createdAt: now, updatedAt: now },
  { id: "2", email: "joao@example.com", name: "João Souza", createdAt: now, updatedAt: now },
];

export const mockCapsules: Capsule[] = [
  {
    id: "1",
    title: "Uma conquista que merece ser lembrada",
    message:
      "Hoje meu primeiro pull request foi aceito.\n\nLembre de como você teve medo de enviar — e enviou mesmo assim.",
    openDate: "2026-09-20",
    category: "memoria",
    color: "rosa",
    email: "maria@example.com",
    createdAt: "2026-06-27T12:00:00.000Z",
    sentAt: "2026-09-20T12:00:00.000Z",
  },
  {
    id: "2",
    title: "Uma ideia que quero tirar do papel",
    message: "",
    openDate: "2027-01-23",
    category: "sonho",
    color: "lima",
    email: "maria@example.com",
    createdAt: "2026-07-10T12:00:00.000Z",
    sentAt: null,
  },
];
