export const mockProducts = [
  {
    id: 'm1',
    slug: 'tee-oversized-preta',
    title: 'Oversized Tee Preta',
    description: 'Corte amplo premium.',
    status: 'active',
    images: [{ url: '/products/placeholder/front.webp', alt: 'Oversized Tee Preta' }],
    category: null,
    variants: [
      {
        status: 'active',
        sku: 'TEE-OV-BLK-M1',
        title: 'Padrão',
        price: { cents: 12990, currency: 'BRL' },
        inventory: { quantity: 25, reserved: 0 },
        options: [], // importante existir (mesmo vazio)
      },
    ],
    isFeatured: true,
    updatedAt: new Date()
  },
  {
    id: 'm2',
    slug: 'regata-essential-preta',
    title: 'Regata Essential Preta',
    description: 'Leve e respirável.',
    status: 'active',
    images: [{ url: '/products/placeholder/front.webp', alt: 'Regata Essential Preta' }],
    category: null,
    variants: [
      {
        status: 'active',
        sku: 'REG-ESS-BLK-M2',
        title: 'Padrão',
        price: { cents: 9990, currency: 'BRL' },
        inventory: { quantity: 18, reserved: 0 },
        options: [],
      },
    ],
    isFeatured: false,
    updatedAt: new Date()
  },
] as const;

export function findBySlug(slug: string) {
  return (mockProducts as readonly any[]).find(p => p.slug === slug);
}

export const mockCategories = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas' },
  { id: 'c2', name: 'Regatas', slug: 'regatas' }
] as const;