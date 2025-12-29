// INSANYCK STEP F-MP.POLISH — Address Panel (Museum Edition)
// INSANYCK CHECKOUT-FIX-NOW-01 — Verified i18n compliance
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import GlassCard from '@/components/ui/GlassCard';

export interface AddressData {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

interface AddressPanelProps {
  /** Callback with validation state + address data */
  onValidation: (valid: boolean, data: AddressData) => void;
}

export default function AddressPanel({ onValidation }: AddressPanelProps) {
  const { t } = useTranslation('checkout');

  const [data, setData] = useState<AddressData>({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });

  const [touched, setTouched] = useState<Record<keyof AddressData, boolean>>({
    name: false,
    phone: false,
    cep: false,
    street: false,
    number: false,
    complement: false,
    city: false,
    state: false,
  });

  // Validation rules (complement is optional)
  const validate = (): boolean => {
    return !!(
      data.name.trim() &&
      data.phone.trim() &&
      data.cep.trim().length >= 5 &&
      data.street.trim() &&
      data.number.trim() &&
      data.city.trim() &&
      data.state.trim()
    );
  };

  const isValid = validate();

  // Emit validation to parent
  useEffect(() => {
    onValidation(isValid, data);
  }, [isValid, data, onValidation]);

  const handleChange = (field: keyof AddressData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof AddressData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // CEP mask (00000-000)
  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.replace(/^(\d{5})(\d)/, '$1-$2');
    handleChange('cep', formatted);
  };

  // Phone mask (basic)
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    handleChange('phone', digits);
  };

  const inputClass = (field: keyof AddressData, optional = false) => {
    const hasError = !optional && touched[field] && !data[field].trim();
    return `
      w-full px-4 py-3 rounded-xl text-white placeholder-white/40
      bg-[rgba(255,255,255,0.03)] border transition-colors
      focus:outline-none focus:ring-2 focus:ring-[color:var(--cold-ray-ring)]
      ${
        hasError
          ? 'border-red-400/50 focus:border-red-400/70'
          : 'border-[rgba(255,255,255,0.10)] focus:border-[rgba(255,255,255,0.25)]'
      }
    `;
  };

  return (
    <GlassCard className="mb-6">
      <h2 className="text-lg font-semibold text-white/90 mb-2">
        {t('address.title', 'Endereço de entrega')}
      </h2>
      <p className="text-white/60 text-sm mb-6">
        {t('address.helper', 'Preencha os dados para calcular o frete e entregar seu pedido')}
      </p>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="addr-name" className="block text-sm text-white/70 mb-2">
            {t('address.nameLabel', 'Nome completo')}
          </label>
          <input
            id="addr-name"
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder={t('address.namePlaceholder', 'Seu nome completo')}
            className={inputClass('name')}
            required
          />
          {touched.name && !data.name.trim() && (
            <p className="mt-1 text-sm text-red-400">
              {t('address.validation.nameRequired', 'Nome é obrigatório')}
            </p>
          )}
        </div>

        {/* Phone + CEP (grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="addr-phone" className="block text-sm text-white/70 mb-2">
              {t('address.phoneLabel', 'Telefone')}
            </label>
            <input
              id="addr-phone"
              type="tel"
              value={data.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder={t('address.phonePlaceholder', '(11) 99999-9999')}
              className={inputClass('phone')}
              required
            />
            {touched.phone && !data.phone.trim() && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.phoneRequired', 'Telefone é obrigatório')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="addr-cep" className="block text-sm text-white/70 mb-2">
              {t('address.cepLabel', 'CEP')}
            </label>
            <input
              id="addr-cep"
              type="text"
              value={data.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              onBlur={() => handleBlur('cep')}
              placeholder={t('address.cepPlaceholder', '00000-000')}
              className={inputClass('cep')}
              maxLength={9}
              required
            />
            {touched.cep && data.cep.trim().length < 5 && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.cepRequired', 'CEP é obrigatório')}
              </p>
            )}
          </div>
        </div>

        {/* Street + Number (grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
          <div>
            <label htmlFor="addr-street" className="block text-sm text-white/70 mb-2">
              {t('address.streetLabel', 'Rua')}
            </label>
            <input
              id="addr-street"
              type="text"
              value={data.street}
              onChange={(e) => handleChange('street', e.target.value)}
              onBlur={() => handleBlur('street')}
              placeholder={t('address.streetPlaceholder', 'Nome da rua')}
              className={inputClass('street')}
              required
            />
            {touched.street && !data.street.trim() && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.streetRequired', 'Rua é obrigatória')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="addr-number" className="block text-sm text-white/70 mb-2">
              {t('address.numberLabel', 'Número')}
            </label>
            <input
              id="addr-number"
              type="text"
              value={data.number}
              onChange={(e) => handleChange('number', e.target.value)}
              onBlur={() => handleBlur('number')}
              placeholder={t('address.numberPlaceholder', '123')}
              className={inputClass('number')}
              required
            />
            {touched.number && !data.number.trim() && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.numberRequired', 'Número é obrigatório')}
              </p>
            )}
          </div>
        </div>

        {/* Complement (optional) */}
        <div>
          <label htmlFor="addr-complement" className="block text-sm text-white/70 mb-2">
            {t('address.complementLabel', 'Complemento (opcional)')}
          </label>
          <input
            id="addr-complement"
            type="text"
            value={data.complement}
            onChange={(e) => handleChange('complement', e.target.value)}
            onBlur={() => handleBlur('complement')}
            placeholder={t('address.complementPlaceholder', 'Apto, Bloco, etc.')}
            className={inputClass('complement', true)}
          />
        </div>

        {/* City + State (grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
          <div>
            <label htmlFor="addr-city" className="block text-sm text-white/70 mb-2">
              {t('address.cityLabel', 'Cidade')}
            </label>
            <input
              id="addr-city"
              type="text"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder={t('address.cityPlaceholder', 'São Paulo')}
              className={inputClass('city')}
              required
            />
            {touched.city && !data.city.trim() && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.cityRequired', 'Cidade é obrigatória')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="addr-state" className="block text-sm text-white/70 mb-2">
              {t('address.stateLabel', 'UF')}
            </label>
            <input
              id="addr-state"
              type="text"
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('state')}
              placeholder={t('address.statePlaceholder', 'SP')}
              className={inputClass('state')}
              maxLength={2}
              required
            />
            {touched.state && !data.state.trim() && (
              <p className="mt-1 text-sm text-red-400">
                {t('address.validation.stateRequired', 'UF é obrigatória')}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
