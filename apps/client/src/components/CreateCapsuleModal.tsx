"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Capsule, CapsuleCategory, CapsuleColor, CapsuleFieldErrors, CreateCapsuleInput } from "@repo/types";
import { API_URL, createCapsule } from "@/lib/api";
import { CAPSULE_CATEGORY_OPTIONS, CAPSULE_COLOR_OPTIONS, EMAIL_RE, isValidDateStr, todayStr } from "@/lib/capsules";

type FormState = CreateCapsuleInput;
type TextField = "title" | "message" | "openDate" | "email";

const FIELD_IDS: Record<TextField, string> = {
  title: "f-title",
  message: "f-message",
  openDate: "f-date",
  email: "f-email",
};

const emptyForm = (email = ""): FormState => ({
  title: "",
  message: "",
  openDate: "",
  category: "memoria",
  color: "rosa",
  email,
});

function validate(form: FormState): CapsuleFieldErrors {
  const errors: CapsuleFieldErrors = {};
  if (!form.title.trim()) errors.title = "Dê um título para sua cápsula.";
  if (!form.message.trim()) errors.message = "Escreva uma mensagem para o futuro.";
  if (!form.openDate) errors.openDate = "Escolha quando a carta poderá ser aberta.";
  else if (!isValidDateStr(form.openDate)) errors.openDate = "Use uma data válida.";
  else if (form.openDate < todayStr()) errors.openDate = "Escolha hoje ou uma data futura.";
  if (!form.email.trim()) errors.email = "Informe o e-mail que vai receber a carta.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Confira o e-mail — parece faltar algo.";
  return errors;
}

const inputBase = "w-full rounded-[12px] border-[1.5px] px-4 text-[16px] text-[#131313] placeholder:text-[#8a8385]";
const borderFor = (hasError: boolean, fallback = "border-[#d9d9d9]") => (hasError ? "border-[#c41a52]" : fallback);

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-[13px] font-medium text-[#c41a52]">
      {message}
    </span>
  );
}

interface CreateCapsuleModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (capsule: Capsule) => void;
}

export function CreateCapsuleModal({ open, onClose, onSaved }: CreateCapsuleModalProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [errors, setErrors] = useState<CapsuleFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    setErrors({});
    setSaveError("");
    document.getElementById(FIELD_IDS.title)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("button, input, textarea, a[href]"),
      ).filter((el) => !el.hasAttribute("disabled"));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  const onField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = event.target.name as TextField;
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const focusFirstError = (fieldErrors: CapsuleFieldErrors) => {
    const first = (Object.keys(FIELD_IDS) as TextField[]).find((field) => fieldErrors[field]);
    if (first) setTimeout(() => document.getElementById(FIELD_IDS[first])?.focus(), 0);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    setSaveError("");
    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors);
      return;
    }

    setSaving(true);
    const result = await createCapsule({ ...form, title: form.title.trim(), email: form.email.trim() });
    setSaving(false);

    if (result.ok) {
      setForm(emptyForm(result.capsule.email));
      onSaved(result.capsule);
      return;
    }
    if (result.fieldErrors) {
      setErrors(result.fieldErrors);
      focusFirstError(result.fieldErrors);
    } else {
      setSaveError("Não foi possível guardar sua cápsula agora. Confira sua conexão e tente de novo.");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(19,19,19,.55)] px-4 py-8"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        onClick={(event) => event.stopPropagation()}
        className="relative m-auto w-full max-w-[580px] rounded-[24px] bg-[#fff5fa] px-7 pb-7 pt-8 font-sans text-[#131313] shadow-[0_30px_80px_-20px_rgba(116,2,85,.5)]"
      >
        <div aria-hidden className="absolute left-7 right-7 top-[14px] border-t-2 border-dotted border-[#ff6ba8]" />

        <div className="mb-6 flex items-start justify-between gap-4 pt-1.5">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[12px] text-[#740255]">nova cápsula</span>
            <h2 id="create-title" className="m-0 font-serif text-[36px] font-normal leading-none">
              Escreva para o futuro
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="h-11 w-11 flex-none rounded-full border-[1.5px] border-[#d9d9d9] bg-white text-[18px] text-[#131313] transition hover:border-[#131313]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="f-title" className="text-[14px] font-bold">
              Título
            </label>
            <input
              id="f-title"
              name="title"
              value={form.title}
              onChange={onField}
              placeholder="Para a mulher que estou me tornando"
              maxLength={90}
              aria-invalid={Boolean(errors.title)}
              aria-describedby="e-title"
              className={`${inputBase} ${borderFor(Boolean(errors.title))} bg-white py-[14px]`}
            />
            <FieldError id="e-title" message={errors.title} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="f-message" className="text-[14px] font-bold">
              Mensagem
            </label>
            <textarea
              id="f-message"
              name="message"
              value={form.message}
              onChange={onField}
              rows={6}
              placeholder="O que você está construindo hoje e quer lembrar quando abrir esta carta?"
              aria-invalid={Boolean(errors.message)}
              aria-describedby="e-message"
              className={`${inputBase} ${borderFor(Boolean(errors.message))} resize-y bg-white py-[14px] leading-[28px]`}
              style={{
                backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, #f8e1ec 27px 28px)",
                backgroundPosition: "0 13px",
                backgroundAttachment: "local",
              }}
            />
            <FieldError id="e-message" message={errors.message} />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-[1_1_200px] flex-col gap-2">
              <label htmlFor="f-date" className="text-[14px] font-bold">
                Data de abertura
              </label>
              <input
                id="f-date"
                name="openDate"
                type="date"
                min={todayStr()}
                value={form.openDate}
                onChange={onField}
                aria-invalid={Boolean(errors.openDate)}
                aria-describedby="e-date"
                className={`${inputBase} ${borderFor(Boolean(errors.openDate))} bg-white py-[13px] font-mono`}
              />
              <FieldError id="e-date" message={errors.openDate} />
            </div>

            <fieldset className="m-0 flex flex-[1_1_220px] flex-col gap-2 border-none p-0">
              <legend className="mb-2 p-0 text-[14px] font-bold">Categoria</legend>
              <div role="radiogroup" aria-label="Categoria" className="flex flex-wrap gap-1.5">
                {(Object.entries(CAPSULE_CATEGORY_OPTIONS) as [CapsuleCategory, (typeof CAPSULE_CATEGORY_OPTIONS)[CapsuleCategory]][]).map(
                  ([id, option]) => {
                    const checked = form.category === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => setForm((current) => ({ ...current, category: id }))}
                        className="flex-none whitespace-nowrap rounded-full border-[1.5px] px-[14px] py-[11px] text-[14px] font-medium"
                        style={{
                          borderColor: checked ? option.fg : "#d9d9d9",
                          background: checked ? option.bg : "#fff",
                          color: checked ? option.fg : "#423a39",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  },
                )}
              </div>
            </fieldset>
          </div>

          <div className="flex flex-col gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#ff6ba8] bg-white p-4">
            <label htmlFor="f-email" className="flex items-center gap-2 text-[14px] font-bold">
              <span aria-hidden className="text-[#e12562]">
                ✉
              </span>
              Receber a carta por e-mail
            </label>
            <input
              id="f-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onField}
              placeholder="voce@email.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby="h-email e-email"
              className={`${inputBase} ${borderFor(Boolean(errors.email), "border-[#f2c4d8]")} bg-[#fff5fa] py-[13px]`}
            />
            <span id="h-email" className="text-[13px] leading-[1.45] text-[#423a39]">
              No dia da abertura, enviamos a carta completa para este endereço.{" "}
              <a
                href={`${API_URL}/capsules/email-preview`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#c41a52] underline hover:text-[#740255]"
              >
                Ver modelo do e-mail
              </a>
            </span>
            <FieldError id="e-email" message={errors.email} />
          </div>

          <fieldset className="m-0 border-none p-0">
            <legend className="mb-[10px] p-0 text-[14px] font-bold">Cor do envelope</legend>
            <div role="radiogroup" aria-label="Cor do envelope" className="flex flex-wrap gap-[14px]">
              {(Object.entries(CAPSULE_COLOR_OPTIONS) as [CapsuleColor, (typeof CAPSULE_COLOR_OPTIONS)[CapsuleColor]][]).map(
                ([id, option]) => {
                  const checked = form.color === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      aria-label={option.name}
                      onClick={() => setForm((current) => ({ ...current, color: id }))}
                      className={`flex flex-none flex-col items-center gap-1.5 whitespace-nowrap rounded-[12px] bg-transparent p-1 ${
                        checked ? "shadow-[0_0_0_2px_#131313]" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className="relative block h-11 w-16 overflow-hidden rounded-lg"
                        style={{ background: option.bg }}
                      >
                        <span
                          className="absolute inset-x-0 top-0 h-[55%]"
                          style={{ background: option.flap, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                        />
                      </span>
                      <span className="text-[12px] text-[#423a39]">{option.name}</span>
                    </button>
                  );
                },
              )}
            </div>
          </fieldset>

          {saveError && (
            <p role="alert" className="m-0 text-[14px] font-medium text-[#c41a52]">
              {saveError}
            </p>
          )}

          <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t-2 border-dotted border-[#f2c4d8] pt-2">
            <button
              type="button"
              onClick={onClose}
              className="mt-4 flex-none whitespace-nowrap rounded-full border-[1.5px] border-[#131313] bg-transparent px-[22px] py-[14px] text-[15px] font-medium text-[#131313] transition hover:bg-[#ffe3ef]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 flex flex-none items-center gap-2 whitespace-nowrap rounded-full bg-[#131313] px-6 py-[14px] text-[15px] font-medium text-[#fff5fa] transition hover:bg-[#e12562] disabled:cursor-wait disabled:opacity-70"
            >
              <span aria-hidden className="text-[#ff6419]">
                ✦
              </span>
              {saving ? "Guardando…" : "Guardar para o futuro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
