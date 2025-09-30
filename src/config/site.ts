// INSANYCK — Site Configuration
// Benefícios premium configuráveis para PDP

export const pdpBenefits = {
  pt: [
    {
      icon: "🚀",
      text: "Envio prioritário com rastreio"
    },
    {
      icon: "↩️",
      text: "Troca fácil em até 30 dias"
    },
    {
      icon: "💳",
      text: "Parcele em até 12x sem juros"
    },
    {
      icon: "📦",
      text: "Embalagem premium INSANYCK"
    }
  ],
  en: [
    {
      icon: "🚀",
      text: "Priority shipping with tracking"
    },
    {
      icon: "↩️",
      text: "Easy returns within 30 days"
    },
    {
      icon: "💳",
      text: "Split into 12 interest-free payments"
    },
    {
      icon: "📦",
      text: "Premium INSANYCK packaging"
    }
  ]
} as const;

export const siteConfig = {
  name: "INSANYCK",
  description: "Premium streetwear brand",
  url: "https://insanyck.com",
  pdpBenefits
} as const;