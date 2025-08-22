// INSANYCK STEP 10 — Seed leve para catálogo
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 INSANYCK STEP 10 — Seeding catalog...');

  // 1. Criar opções base
  const sizeOption = await prisma.option.upsert({
    where: { slug: 'size' },
    update: {},
    create: {
      name: 'Tamanho',
      slug: 'size',
      type: 'size',
      values: {
        create: [
          { name: 'P', slug: 'p', value: 'P', order: 1 },
          { name: 'M', slug: 'm', value: 'M', order: 2 },
          { name: 'G', slug: 'g', value: 'G', order: 3 },
          { name: 'EG', slug: 'eg', value: 'EG', order: 4 },
        ],
      },
    },
    include: { values: true },
  });

  const colorOption = await prisma.option.upsert({
    where: { slug: 'color' },
    update: {},
    create: {
      name: 'Cor',
      slug: 'color',
      type: 'color',
      values: {
        create: [
          { name: 'Preto', slug: 'preto', value: '#000000', order: 1 },
          { name: 'Branco', slug: 'branco', value: '#FFFFFF', order: 2 },
          { name: 'Vermelho', slug: 'vermelho', value: '#FF0000', order: 3 },
        ],
      },
    },
    include: { values: true },
  });

  // 2. Criar categoria
  const category = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: {
      name: 'Camisetas',
      slug: 'camisetas',
      description: 'Camisetas INSANYCK premium',
    },
  });

  // 3. Criar produtos com variantes
  const products = [
    {
      title: 'Oversized Classic',
      slug: 'oversized-classic',
      description: 'Camiseta oversized premium INSANYCK',
      images: [
        { url: '/products/oversized-classic/front.webp', alt: 'Frente', order: 1 },
        { url: '/products/oversized-classic/back.webp', alt: 'Costas', order: 2 },
      ],
      variants: [
        { size: 'P', color: 'Preto', price: 19900 },
        { size: 'M', color: 'Preto', price: 19900 },
        { size: 'G', color: 'Preto', price: 19900 },
      ],
    },
    {
      title: 'Essential Fit',
      slug: 'essential-fit',
      description: 'Camiseta essential com corte perfeito',
      images: [
        { url: '/products/essential-fit/front.webp', alt: 'Frente', order: 1 },
      ],
      variants: [
        { size: 'P', color: 'Branco', price: 17900 },
        { size: 'M', color: 'Branco', price: 17900 },
        { size: 'M', color: 'Preto', price: 17900 },
      ],
    },
    {
      title: 'Street Premium',
      slug: 'street-premium',
      description: 'Linha street com acabamento premium',
      images: [
        { url: '/products/street-premium/front.webp', alt: 'Frente', order: 1 },
      ],
      variants: [
        { size: 'P', color: 'Vermelho', price: 22900 },
        { size: 'M', color: 'Vermelho', price: 22900 },
        { size: 'G', color: 'Vermelho', price: 22900 },
        { size: 'EG', color: 'Vermelho', price: 22900 },
      ],
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        title: productData.title,
        slug: productData.slug,
        description: productData.description,
        status: 'active',
        isFeatured: true,
        categoryId: category.id,
        images: {
          create: productData.images,
        },
      },
    });

    // Criar variantes para cada produto
    for (const variantData of productData.variants) {
      const sizeValue = sizeOption.values.find(v => v.value === variantData.size);
      const colorValue = colorOption.values.find(v => v.name === variantData.color);
      
      if (!sizeValue || !colorValue) continue;

      const sku = `${productData.slug.toUpperCase()}-${variantData.size}-${colorValue.slug.toUpperCase()}`;
      
      const variant = await prisma.variant.upsert({
        where: { sku },
        update: {},
        create: {
          sku,
          title: `${variantData.size}/${colorValue.name}`,
          productId: product.id,
          status: 'active',
          options: {
            create: [
              { optionValueId: sizeValue.id },
              { optionValueId: colorValue.id },
            ],
          },
        },
      });

      // Criar preço
      await prisma.price.upsert({
        where: { variantId: variant.id },
        update: {},
        create: {
          variantId: variant.id,
          currency: 'BRL',
          cents: variantData.price,
        },
      });

      // Criar estoque inicial
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: {
          variantId: variant.id,
          quantity: Math.floor(Math.random() * 50) + 10, // 10-60 unidades
          reserved: 0,
          trackInventory: true,
          allowBackorder: false,
        },
      });
    }

    console.log(`✓ Produto "${productData.title}" criado com ${productData.variants.length} variantes`);
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });