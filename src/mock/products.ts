// src/mock/products.ts
// INSANYCK MUSEUM EDITION - DATABASE MOCK (2 Produtos Premium)

// INSANYCK HOTFIX IMG-01 — Image override para assets locais (reversível)
const IMAGE_OVERRIDES: Record<string, string> = {
  'tee-oversized-preta': '/products/Oversized Tee Preta/tee-oversized-black.png.png',
  'jaqueta-bomber-tonal': '/products/jaqueta-bomber-tonal/jacket-insanyck-black.png.png',
};

export const mockProducts = [
  // --- PRODUTO 1: CAMISETA (Já existia) ---
  {
    id: 'm1',
    slug: 'tee-oversized-preta',
    title: 'Oversized Tee Preta',
    description: 'Corte amplo premium. Algodão pesado com caimento estruturado e toque macio.',
    status: 'active',
    images: [
      {
        // INSANYCK HOTFIX IMG-01 — Override para asset local
        url: IMAGE_OVERRIDES['tee-oversized-preta'] || '/products/tee-oversized-preta/front.png',
        alt: 'Oversized Tee Preta'
      }
    ],
    category: { id: 'c1', name: 'Camisetas', slug: 'camisetas' },
    variants: [
      {
        id: 'mv1',
        status: 'active',
        sku: 'TEE-OV-BLK-001',
        title: 'Padrão',
        price: { cents: 15900, currency: 'BRL' }, // R$ 159,00
        inventory: { quantity: 25, reserved: 0 },
        options: [], 
      },
    ],
    isFeatured: true,
    updatedAt: new Date()
  },

  // --- PRODUTO 2: JAQUETA (NOVO!) ---
  {
    id: 'm3', // ID novo
    slug: 'jaqueta-bomber-tonal', // URL amigável
    title: 'Jaqueta Bomber Tonal', // Nome no site
    description: 'Jaqueta estruturada com logo tonal discreto. Tecido técnico premium resistente, corte de alfaiataria moderna.',
    status: 'active',
    images: [
      {
        // INSANYCK HOTFIX IMG-01 — Override para asset local
        url: IMAGE_OVERRIDES['jaqueta-bomber-tonal'] || '/products/jaqueta-bomber-tonal/front.png',
        alt: 'Jaqueta Bomber Tonal INSANYCK'
      }
    ],
    // Nova categoria para peças pesadas
    category: { id: 'c4', name: 'Outerwear', slug: 'outerwear' }, 
    variants: [
      {
        id: 'mv3',
        status: 'active',
        sku: 'JAC-BOM-BLK-001',
        title: 'Padrão',
        // Preço mais alto para peça mais pesada (R$ 499,00)
        price: { cents: 49900, currency: 'BRL' }, 
        inventory: { quantity: 10, reserved: 0 },
        options: [],
      },
    ],
    isFeatured: true, // Vai aparecer em destaque se houver seção para isso
    updatedAt: new Date()
  },
] as const;

// --- CATEGORIAS ATUALIZADAS ---
export const mockCategories = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas' },
  { id: 'c2', name: 'Regatas', slug: 'regatas' },
  { id: 'c3', name: 'Acessórios', slug: 'acessorios' },
  { id: 'c4', name: 'Outerwear', slug: 'outerwear' } // Nova categoria adicionada
] as const;

// Helper para encontrar produto pelo slug (URL)
export function findBySlug(slug: string) {
  return (mockProducts as readonly any[]).find(p => p.slug === slug);
}