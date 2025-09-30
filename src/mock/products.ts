export const mockProducts = [
  {
    id: 'm1',
    slug: 'tee-oversized-preta',
    title: 'Oversized Tee Preta',
    description: 'Camiseta oversized em algodão premium',
    images: [{ url: '/products/placeholder/front.webp' }],
    variants: [{
      status: 'active',
      price: { cents: 12990 },
      inventory: { quantity: 25, reserved: 0 }
    }],
    category: { id: 'c1', name: 'Camisetas', slug: 'camisetas' },
    isFeatured: true,
    status: 'active',
    updatedAt: new Date()
  },
  {
    id: 'm2', 
    slug: 'regata-essential-preta',
    title: 'Regata Essential Preta',
    description: 'Regata essencial em tecido respirável',
    images: [{ url: '/products/placeholder/front.webp' }],
    variants: [{
      status: 'active',
      price: { cents: 9990 },
      inventory: { quantity: 18, reserved: 0 }
    }],
    category: { id: 'c2', name: 'Regatas', slug: 'regatas' },
    isFeatured: false,
    status: 'active',
    updatedAt: new Date()
  }
] as const;

export const findBySlug = (slug: string) => mockProducts.find(p => p.slug === slug);

export const mockCategories = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas' },
  { id: 'c2', name: 'Regatas', slug: 'regatas' }
] as const;