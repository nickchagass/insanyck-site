// scripts/seed.mjs
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const camisetasCategory = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: { 
      slug: 'camisetas', 
      name: 'Camisetas',
      description: 'Camisetas premium INSANYCK'
    },
  })

  const acessoriosCategory = await prisma.category.upsert({
    where: { slug: 'acessorios' },
    update: {},
    create: { 
      slug: 'acessorios', 
      name: 'Acessórios',
      description: 'Acessórios exclusivos INSANYCK'
    },
  })

  // Create products with variants
  await prisma.product.upsert({
    where: { slug: 'tee-oversized-preta' },
    update: {},
    create: {
      slug: 'tee-oversized-preta',
      title: 'Oversized Tee Preta',
      description: 'Camiseta oversized premium preta. Conforto e estilo únicos da INSANYCK.',
      status: 'active',
      categoryId: camisetasCategory.id,
      isFeatured: true,
      images: {
        create: [
          { url: '/products/tee-oversized-preta/front.webp', order: 1, alt: 'Oversized Tee Preta - Frente' },
          { url: '/products/tee-oversized-preta/back.webp', order: 2, alt: 'Oversized Tee Preta - Costas' },
        ],
      },
      variants: {
        create: [
          {
            status: 'active',
            sku: 'TEE-OV-PRETA-P',
            title: 'P',
            price: { create: { cents: 14900, currency: 'BRL' } },
            inventory: { create: { quantity: 10, reserved: 0 } },
          },
          {
            status: 'active',
            sku: 'TEE-OV-PRETA-M',
            title: 'M',
            price: { create: { cents: 14900, currency: 'BRL' } },
            inventory: { create: { quantity: 12, reserved: 0 } },
          },
          {
            status: 'active',
            sku: 'TEE-OV-PRETA-G',
            title: 'G',
            price: { create: { cents: 14900, currency: 'BRL' } },
            inventory: { create: { quantity: 8, reserved: 0 } },
          },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: 'tee-classic-branca' },
    update: {},
    create: {
      slug: 'tee-classic-branca',
      title: 'Classic Tee Branca',
      description: 'Camiseta clássica branca premium. O essencial da INSANYCK em sua forma mais pura.',
      status: 'active',
      categoryId: camisetasCategory.id,
      isFeatured: true,
      images: {
        create: [
          { url: '/products/tee-classic-branca/front.webp', order: 1, alt: 'Classic Tee Branca - Frente' },
          { url: '/products/tee-classic-branca/back.webp', order: 2, alt: 'Classic Tee Branca - Costas' },
        ],
      },
      variants: {
        create: [
          {
            status: 'active',
            sku: 'TEE-CL-BRANCA-P',
            title: 'P',
            price: { create: { cents: 13900, currency: 'BRL' } },
            inventory: { create: { quantity: 8, reserved: 0 } },
          },
          {
            status: 'active',
            sku: 'TEE-CL-BRANCA-M',
            title: 'M',
            price: { create: { cents: 13900, currency: 'BRL' } },
            inventory: { create: { quantity: 9, reserved: 0 } },
          },
          {
            status: 'active',
            sku: 'TEE-CL-BRANCA-G',
            title: 'G',
            price: { create: { cents: 13900, currency: 'BRL' } },
            inventory: { create: { quantity: 6, reserved: 0 } },
          },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: 'oversized-classic-off' },
    update: {},
    create: {
      slug: 'oversized-classic-off',
      title: 'Oversized Classic Off-White',
      description: 'Oversized clássica off-white. Minimalismo e conforto em perfeita harmonia.',
      status: 'active',
      categoryId: camisetasCategory.id,
      isFeatured: false,
      images: {
        create: [
          { url: '/products/oversized-classic-off/front.webp', order: 1, alt: 'Oversized Classic Off-White - Frente' },
          { url: '/products/oversized-classic-off/back.webp', order: 2, alt: 'Oversized Classic Off-White - Costas' },
        ],
      },
      variants: {
        create: [
          {
            status: 'active',
            sku: 'TEE-OV-OFF-P',
            title: 'P',
            price: { create: { cents: 15900, currency: 'BRL' } },
            inventory: { create: { quantity: 5, reserved: 0 } },
          },
          {
            status: 'active',
            sku: 'TEE-OV-OFF-M',
            title: 'M',
            price: { create: { cents: 15900, currency: 'BRL' } },
            inventory: { create: { quantity: 7, reserved: 0 } },
          },
        ],
      },
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => { 
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })
  .catch(async (e) => { 
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })