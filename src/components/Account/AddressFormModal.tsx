// INSANYCK CHECKOUT-RESURRECTION — Address Form Modal (Museum Edition)
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface AddressFormData {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Partial<AddressFormData>;
  mode?: "create" | "edit";
}

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: AddressFormModalProps) {
  const { t } = useTranslation(["account", "checkout"]);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<AddressFormData>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    cep: initialData?.cep || "",
    street: initialData?.street || "",
    number: initialData?.number || "",
    complement: initialData?.complement || "",
    district: initialData?.district || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "BR",
    isDefault: initialData?.isDefault || false,
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && initialData) {
      setData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        cep: initialData.cep || "",
        street: initialData.street || "",
        number: initialData.number || "",
        complement: initialData.complement || "",
        district: initialData.district || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "BR",
        isDefault: initialData.isDefault || false,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("[AddressFormModal] Submit failed:", error);
    } finally {
      setBusy(false);
    }
  };

  const handleCepBlur = async () => {
    // INSANYCK CHECKOUT-RESURRECTION — CEP auto-fill via ViaCEP
    const cep = data.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (res.ok) {
          const cepData = await res.json();
          if (!cepData.erro) {
            // Only fill empty fields, don't override user input
            setData((prev) => ({
              ...prev,
              street: prev.street || cepData.logradouro || "",
              district: prev.district || cepData.bairro || "",
              city: prev.city || cepData.localidade || "",
              state: prev.state || cepData.uf || "",
            }));
          }
        }
      } catch (error) {
        console.error("[AddressFormModal] CEP lookup failed:", error);
      }
    }
  };

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-white placeholder-white/40
    bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)]
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-[color:var(--cold-ray-ring)] focus:border-[rgba(255,255,255,0.25)]
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl z-[201] p-6"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {mode === "create"
                  ? t("account:addresses.addTitle", "Novo Endereço")
                  : t("account:addresses.editTitle", "Editar Endereço")}
              </h2>
              <button
                onClick={onClose}
                disabled={busy}
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                aria-label={t("common:close", "Fechar")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="addr-name" className="block text-sm text-white/70 mb-2">
                  {t("checkout:address.nameLabel", "Nome completo")} *
                </label>
                <input
                  id="addr-name"
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={t("checkout:address.namePlaceholder", "Seu nome completo")}
                  className={inputClass}
                  required
                  disabled={busy}
                />
              </div>

              {/* Phone + CEP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addr-phone" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.phoneLabel", "Telefone")} *
                  </label>
                  <input
                    id="addr-phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder={t("checkout:address.phonePlaceholder", "(11) 99999-9999")}
                    className={inputClass}
                    required
                    disabled={busy}
                  />
                </div>

                <div>
                  <label htmlFor="addr-cep" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.cepLabel", "CEP")} *
                  </label>
                  <input
                    id="addr-cep"
                    type="text"
                    value={data.cep}
                    onChange={(e) => handleChange("cep", e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onBlur={handleCepBlur}
                    placeholder={t("checkout:address.cepPlaceholder", "00000-000")}
                    className={inputClass}
                    maxLength={8}
                    required
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Street + Number */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
                <div>
                  <label htmlFor="addr-street" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.streetLabel", "Rua")} *
                  </label>
                  <input
                    id="addr-street"
                    type="text"
                    value={data.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    placeholder={t("checkout:address.streetPlaceholder", "Nome da rua")}
                    className={inputClass}
                    required
                    disabled={busy}
                  />
                </div>

                <div>
                  <label htmlFor="addr-number" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.numberLabel", "Número")} *
                  </label>
                  <input
                    id="addr-number"
                    type="text"
                    value={data.number}
                    onChange={(e) => handleChange("number", e.target.value)}
                    placeholder={t("checkout:address.numberPlaceholder", "123")}
                    className={inputClass}
                    required
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Complement */}
              <div>
                <label htmlFor="addr-complement" className="block text-sm text-white/70 mb-2">
                  {t("checkout:address.complementLabel", "Complemento (opcional)")}
                </label>
                <input
                  id="addr-complement"
                  type="text"
                  value={data.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                  placeholder={t("checkout:address.complementPlaceholder", "Apto, Bloco, etc.")}
                  className={inputClass}
                  disabled={busy}
                />
              </div>

              {/* District */}
              <div>
                <label htmlFor="addr-district" className="block text-sm text-white/70 mb-2">
                  {t("checkout:fields.district", "Bairro")} *
                </label>
                <input
                  id="addr-district"
                  type="text"
                  value={data.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  placeholder={t("checkout:fields.district", "Bairro")}
                  className={inputClass}
                  required
                  disabled={busy}
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
                <div>
                  <label htmlFor="addr-city" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.cityLabel", "Cidade")} *
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    value={data.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder={t("checkout:address.cityPlaceholder", "São Paulo")}
                    className={inputClass}
                    required
                    disabled={busy}
                  />
                </div>

                <div>
                  <label htmlFor="addr-state" className="block text-sm text-white/70 mb-2">
                    {t("checkout:address.stateLabel", "UF")} *
                  </label>
                  <input
                    id="addr-state"
                    type="text"
                    value={data.state}
                    onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
                    placeholder={t("checkout:address.statePlaceholder", "SP")}
                    className={inputClass}
                    maxLength={2}
                    required
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="px-6 py-3 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-60"
                >
                  {t("common:cancel", "Cancelar")}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {busy && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {mode === "create"
                    ? t("account:addresses.add", "Adicionar")
                    : t("account:addresses.save", "Salvar")}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
