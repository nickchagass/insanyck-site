// src/lib/coupon.ts
export type CouponResult = {
    valid: boolean;
    discountCents: number;
    message?: string; // i18n key
  };
  
  export function applyCoupon(code: string, subtotalCents: number): CouponResult {
    const c = (code || "").trim().toUpperCase();
    if (!c) return { valid: false, discountCents: 0, message: "checkout:errors.couponEmpty" };
  
    if (c === "INSANY10") {
      const discount = Math.round(subtotalCents * 0.1);
      return { valid: true, discountCents: discount, message: "checkout:coupon.applied10" };
    }
  
    if (c === "FRETEGRATIS") {
      // cupom de frete é tratado na tela, aqui sinalizamos "válido sem desconto direto"
      return { valid: true, discountCents: 0, message: "checkout:coupon.freeShipping" };
    }
  
    return { valid: false, discountCents: 0, message: "checkout:errors.couponInvalid" };
  }
  