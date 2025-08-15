// src/components/AddressForm.tsx
"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useTranslation } from "next-i18next";

export type AddressFields = {
  fullName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
};

type Props = {
  register: UseFormRegister<any>;
  errors: FieldErrors<AddressFields>;
};

export default function AddressForm({ register, errors }: Props) {
  const { t, i18n } = useTranslation(["checkout"]);
  const isEN = i18n.language?.startsWith("en");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field
        label={t("checkout:fields.fullName", "Nome completo")}
        placeholder={isEN ? "Your full name" : "Seu nome completo"}
        error={errors.fullName?.message as string | undefined}
        inputProps={{ ...register("fullName") }}
      />
      <Field
        label={t("checkout:fields.email", "E-mail")}
        placeholder={isEN ? "you@email.com" : "voce@email.com"}
        error={errors.email?.message as string | undefined}
        inputProps={{ ...register("email") }}
      />
      <Field
        label={t("checkout:fields.phone", "Telefone")}
        placeholder={isEN ? "(555) 123-456" : "(11) 99999-9999"}
        error={errors.phone?.message as string | undefined}
        inputProps={{ ...register("phone") }}
      />
      <Field
        label={t("checkout:fields.cep", "CEP")}
        placeholder={isEN ? "ZIP code" : "00000-000"}
        error={errors.cep?.message as string | undefined}
        inputProps={{ ...register("cep") }}
      />
      <Field
        label={t("checkout:fields.street", "Rua")}
        placeholder={isEN ? "Street" : "Rua"}
        error={errors.street?.message as string | undefined}
        inputProps={{ ...register("street") }}
      />
      <Field
        label={t("checkout:fields.number", "Número")}
        placeholder={isEN ? "Number" : "Número"}
        error={errors.number?.message as string | undefined}
        inputProps={{ ...register("number") }}
      />
      <Field
        label={t("checkout:fields.complement", "Complemento")}
        placeholder={isEN ? "Apt, floor (optional)" : "Apto, bloco (opcional)"}
        error={errors.complement?.message as string | undefined}
        inputProps={{ ...register("complement") }}
      />
      <Field
        label={t("checkout:fields.district", "Bairro")}
        placeholder={isEN ? "District" : "Bairro"}
        error={errors.district?.message as string | undefined}
        inputProps={{ ...register("district") }}
      />
      <Field
        label={t("checkout:fields.city", "Cidade")}
        placeholder={isEN ? "City" : "Cidade"}
        error={errors.city?.message as string | undefined}
        inputProps={{ ...register("city") }}
      />
      <Field
        label={t("checkout:fields.state", "UF")}
        placeholder={isEN ? "State" : "UF"}
        error={errors.state?.message as string | undefined}
        inputProps={{ ...register("state") }}
      />
      <Field
        label={t("checkout:fields.country", "País")}
        placeholder={isEN ? "Country" : "Brasil"}
        error={errors.country?.message as string | undefined}
        inputProps={{ ...register("country") }}
      />
    </div>
  );
}

function Field({
  label,
  placeholder,
  error,
  inputProps,
}: {
  label: string;
  placeholder?: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-1">{label}</span>
      <input
        {...inputProps}
        placeholder={placeholder}
        className="
          w-full rounded-xl bg-black/40 border border-white/10
          px-3 py-2 text-white placeholder-white/30
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
        "
      />
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
