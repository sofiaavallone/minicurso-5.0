export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AppEnvironment = "development" | "production" | "test";

export const CAPSULE_CATEGORIES = ["memoria", "sonho", "meta"] as const;
export type CapsuleCategory = (typeof CAPSULE_CATEGORIES)[number];

export const CAPSULE_COLORS = ["rosa", "laranja", "lima", "vinho"] as const;
export type CapsuleColor = (typeof CAPSULE_COLORS)[number];

export interface CreateCapsuleInput {
  title: string;
  message: string;
  /** Data local no formato AAAA-MM-DD. */
  openDate: string;
  category: CapsuleCategory;
  color: CapsuleColor;
  email: string;
}

export interface Capsule extends CreateCapsuleInput {
  id: string;
  createdAt: string;
  sentAt: string | null;
}

export type CapsuleFieldErrors = Partial<Record<keyof CreateCapsuleInput, string>>;

export interface ValidationErrorResponse {
  error: "validation";
  fieldErrors: CapsuleFieldErrors;
}
