import type { ApiResponse, Letter, LetterCategory } from "@repo/types";
import { api } from "./api";

export type LetterPayload = {
  title: string;
  category: LetterCategory;
  content: string;
  deliverAt: string;
  authorName?: string | null;
};

export async function createLetter(payload: LetterPayload): Promise<Letter> {
  const { data } = await api.post<ApiResponse<Letter>>("/letters", payload);
  return data.data;
}

export async function deleteLetter(id: string): Promise<void> {
  await api.delete(`/letters/${id}`);
}
