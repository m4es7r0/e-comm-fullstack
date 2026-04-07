import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const hash = (password: string, rounds: number) => bcrypt.hash(password, rounds)

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ─────────────────────────────────────────────────────────

  const adminPassword = await hash('admin123', 12)
  const userPassword = await hash('user1234', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecomm.local' },
    update: {},
    create: {
      email: 'admin@ecomm.local',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  const customer1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      passwordHash: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER',
    },
  })

  console.log(`  ✓ Users: admin, ${customer1.email}, ${customer2.email}`)

  // ── Categories ────────────────────────────────────────────────────

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices' },
  })

  const phones = await prisma.category.upsert({
    where: { slug: 'phones' },
    update: {},
    create: {
      name: 'Phones',
      slug: 'phones',
      description: 'Smartphones and accessories',
      parentId: electronics.id,
    },
  })

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Notebooks and ultrabooks',
      parentId: electronics.id,
    },
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion' },
  })

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', description: 'Bags, watches, jewelry' },
  })

  console.log('  ✓ Categories: electronics, phones, laptops, clothing, accessories')

  // ── Products ──────────────────────────────────────────────────────

  const products = [
    {
      title: 'iPhone 16 Pro',
      slug: 'iphone-16-pro',
      description: 'The latest iPhone with A18 Pro chip and 48MP camera system.',
      price: 999.99,
      compareAtPrice: 1099.99,
      images: ['https://placehold.co/600x600/333/fff?text=iPhone+16+Pro'],
      categoryId: phones.id,
      status: 'ACTIVE' as const,
      stock: 50,
      attributes: { color: 'Natural Titanium', storage: '256GB' },
    },
    {
      title: 'Samsung Galaxy S25 Ultra',
      slug: 'samsung-galaxy-s25-ultra',
      description: 'Premium Android flagship with S Pen and AI features.',
      price: 1199.99,
      images: ['https://placehold.co/600x600/1a237e/fff?text=Galaxy+S25'],
      categoryId: phones.id,
      status: 'ACTIVE' as const,
      stock: 35,
      attributes: { color: 'Titanium Black', storage: '512GB' },
    },
    {
      title: 'Google Pixel 9 Pro',
      slug: 'google-pixel-9-pro',
      description: 'Pure Android experience with the best camera AI.',
      price: 799.99,
      images: ['https://placehold.co/600x600/4caf50/fff?text=Pixel+9+Pro'],
      categoryId: phones.id,
      status: 'ACTIVE' as const,
      stock: 20,
      attributes: { color: 'Obsidian', storage: '128GB' },
    },
    {
      title: 'MacBook Pro 16"',
      slug: 'macbook-pro-16',
      description: 'M4 Pro chip, 18-hour battery, Liquid Retina XDR display.',
      price: 2499.99,
      compareAtPrice: 2799.99,
      images: ['https://placehold.co/600x600/616161/fff?text=MacBook+Pro'],
      categoryId: laptops.id,
      status: 'ACTIVE' as const,
      stock: 15,
      attributes: { color: 'Space Black', ram: '36GB', storage: '512GB' },
    },
    {
      title: 'ThinkPad X1 Carbon Gen 12',
      slug: 'thinkpad-x1-carbon-gen-12',
      description: 'Ultra-light business laptop with Intel Core Ultra.',
      price: 1649.99,
      images: ['https://placehold.co/600x600/212121/fff?text=ThinkPad+X1'],
      categoryId: laptops.id,
      status: 'ACTIVE' as const,
      stock: 25,
      attributes: { color: 'Black', ram: '32GB', storage: '1TB' },
    },
    {
      title: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'InfinityEdge display, 13th gen Intel, creator-focused.',
      price: 1899.99,
      images: ['https://placehold.co/600x600/0d47a1/fff?text=Dell+XPS+15'],
      categoryId: laptops.id,
      status: 'DRAFT' as const,
      stock: 0,
      attributes: { color: 'Platinum Silver', ram: '32GB' },
    },
    {
      title: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless denim jacket, perfect for layering.',
      price: 89.99,
      compareAtPrice: 129.99,
      images: ['https://placehold.co/600x600/1565c0/fff?text=Denim+Jacket'],
      categoryId: clothing.id,
      status: 'ACTIVE' as const,
      stock: 100,
      attributes: { size: 'M', material: 'Denim' },
    },
    {
      title: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Soft premium cotton, everyday essential.',
      price: 29.99,
      images: ['https://placehold.co/600x600/e0e0e0/333?text=Cotton+Tee'],
      categoryId: clothing.id,
      status: 'ACTIVE' as const,
      stock: 200,
      attributes: { size: 'L', color: 'White' },
    },
    {
      title: 'Wool Blend Overcoat',
      slug: 'wool-blend-overcoat',
      description: 'Elegant overcoat for cold weather, tailored fit.',
      price: 249.99,
      images: ['https://placehold.co/600x600/3e2723/fff?text=Overcoat'],
      categoryId: clothing.id,
      status: 'ACTIVE' as const,
      stock: 30,
      attributes: { size: 'L', material: 'Wool blend' },
    },
    {
      title: 'Leather Crossbody Bag',
      slug: 'leather-crossbody-bag',
      description: 'Genuine leather crossbody with adjustable strap.',
      price: 159.99,
      images: ['https://placehold.co/600x600/4e342e/fff?text=Crossbody+Bag'],
      categoryId: accessories.id,
      status: 'ACTIVE' as const,
      stock: 45,
      attributes: { color: 'Brown', material: 'Leather' },
    },
    {
      title: 'Minimalist Watch',
      slug: 'minimalist-watch',
      description: 'Clean dial, sapphire crystal, Japanese movement.',
      price: 199.99,
      compareAtPrice: 249.99,
      images: ['https://placehold.co/600x600/263238/fff?text=Watch'],
      categoryId: accessories.id,
      status: 'ACTIVE' as const,
      stock: 60,
      attributes: { color: 'Silver', band: 'Mesh' },
    },
    {
      title: 'Wireless Earbuds Pro',
      slug: 'wireless-earbuds-pro',
      description: 'Active noise cancellation, 30h battery, spatial audio.',
      price: 179.99,
      images: ['https://placehold.co/600x600/37474f/fff?text=Earbuds+Pro'],
      categoryId: electronics.id,
      status: 'ACTIVE' as const,
      stock: 80,
      attributes: { color: 'Black' },
    },
    {
      title: 'USB-C Hub 10-in-1',
      slug: 'usb-c-hub-10-in-1',
      description: 'HDMI, USB-A, SD card, Ethernet, PD charging.',
      price: 49.99,
      images: ['https://placehold.co/600x600/546e7a/fff?text=USB-C+Hub'],
      categoryId: electronics.id,
      status: 'ACTIVE' as const,
      stock: 150,
      attributes: { ports: '10' },
    },
    {
      title: 'Retro Sneakers',
      slug: 'retro-sneakers',
      description: 'Vintage-inspired sneakers with modern comfort.',
      price: 119.99,
      images: ['https://placehold.co/600x600/ff8f00/fff?text=Retro+Sneakers'],
      categoryId: clothing.id,
      status: 'ARCHIVED' as const,
      stock: 0,
      attributes: { size: '42', color: 'White/Green' },
    },
    {
      title: 'Titanium Sunglasses',
      slug: 'titanium-sunglasses',
      description: 'Ultralight titanium frame, polarized lenses.',
      price: 299.99,
      images: ['https://placehold.co/600x600/455a64/fff?text=Sunglasses'],
      categoryId: accessories.id,
      status: 'ACTIVE' as const,
      stock: 25,
      attributes: { lens: 'Polarized', material: 'Titanium' },
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log(`  ✓ Products: ${products.length} items`)

  // ── Sample Order ──────────────────────────────────────────────────

  const existingOrder = await prisma.order.findFirst({ where: { userId: customer1.id } })

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userId: customer1.id,
        status: 'DELIVERED',
        totalAmount: 1179.98,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          phone: '+1-555-0123',
        },
        items: {
          create: [
            { productId: (await prisma.product.findUnique({ where: { slug: 'iphone-16-pro' } }))!.id, quantity: 1, price: 999.99 },
            { productId: (await prisma.product.findUnique({ where: { slug: 'wireless-earbuds-pro' } }))!.id, quantity: 1, price: 179.99 },
          ],
        },
      },
    })
    console.log('  ✓ Sample order for john@example.com')
  }

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
