import axios from "axios";
import type {
  ApiResponse,
  Capsule,
  CapsuleFieldErrors,
  CreateCapsuleInput,
  ValidationErrorResponse,
} from "@repo/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export type ApiResult<T> = { data: T; isMocked: boolean };

export async function apiGet<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const { data } = await api.get<ApiResponse<T>>(path, {
      headers: { "Cache-Control": "no-store" },
    });
    return { data: data.data, isMocked: false };
  } catch {
    return { data: fallback, isMocked: true };
  }
}

export type CreateCapsuleResult =
  | { ok: true; capsule: Capsule }
  | { ok: false; fieldErrors: CapsuleFieldErrors | null };

export async function createCapsule(input: CreateCapsuleInput): Promise<CreateCapsuleResult> {
  try {
    const { data } = await api.post<ApiResponse<Capsule>>("/capsules", input);
    return { ok: true, capsule: data.data };
  } catch (error) {
    if (axios.isAxiosError<ValidationErrorResponse>(error) && error.response?.status === 400) {
      return { ok: false, fieldErrors: error.response.data.fieldErrors };
    }
    return { ok: false, fieldErrors: null };
  }
}

export async function deleteCapsule(id: string): Promise<void> {
  await api.delete(`/capsules/${id}`);
}
