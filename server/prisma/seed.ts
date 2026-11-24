import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Books', slug: 'books' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  categorySlug: CategorySlug;
}

// Prices are stored in minor units (paise: 100 = ₹1) to avoid floating-point rounding errors.
const PRODUCTS: SeedProduct[] = [
  // Electronics (6)
  {
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description:
      'Over-ear Bluetooth 5.3 headphones with active noise cancellation, 35-hour battery life, and USB-C fast charging.',
    priceCents: 499900,
    stock: 25,
    categorySlug: 'electronics',
  },
  {
    name: 'Mechanical Keyboard 75%',
    slug: 'mechanical-keyboard-75',
    description:
      'Compact 84-key mechanical keyboard with hot-swappable tactile switches, PBT keycaps, and white LED backlight.',
    priceCents: 349900,
    stock: 18,
    categorySlug: 'electronics',
  },
  {
    name: 'USB-C 7-in-1 Hub',
    slug: 'usb-c-7-in-1-hub',
    description:
      'Aluminum multiport adapter featuring 4K HDMI, 100W Power Delivery pass-through, SD/TF card readers, and two USB 3.0 ports.',
    priceCents: 189900,
    stock: 40,
    categorySlug: 'electronics',
  },
  {
    name: 'Ergonomic Vertical Mouse',
    slug: 'ergonomic-vertical-mouse',
    description:
      'Wireless 2.4GHz and Bluetooth ergonomic mouse designed to reduce wrist strain, with 4 adjustable DPI levels.',
    priceCents: 149900,
    stock: 32,
    categorySlug: 'electronics',
  },
  {
    name: 'Portable SSD 1TB',
    slug: 'portable-ssd-1tb',
    description:
      'Pocket-sized NVMe external solid state drive with read speeds up to 1050 MB/s and shock-resistant aluminum shell.',
    priceCents: 749900,
    stock: 14,
    categorySlug: 'electronics',
  },
  {
    name: '20W GaN Fast Wall Charger',
    slug: '20w-gan-fast-wall-charger',
    description:
      'Ultra-compact gallium nitride USB-C power adapter with surge protection for phones, tablets, and earbuds.',
    priceCents: 89900,
    stock: 60,
    categorySlug: 'electronics',
  },

  // Clothing (6)
  {
    name: 'Classic Organic Cotton T-Shirt',
    slug: 'classic-organic-cotton-tshirt',
    description:
      'Breathable 180 GSM combed organic cotton crew-neck tee pre-shrunk for a consistent everyday fit.',
    priceCents: 69900,
    stock: 50,
    categorySlug: 'clothing',
  },
  {
    name: 'Relaxed Linen Button-Down Shirt',
    slug: 'relaxed-linen-button-down-shirt',
    description:
      'Lightweight European flax linen shirt with a relaxed collar and mother-of-pearl buttons, ideal for warm weather.',
    priceCents: 199900,
    stock: 22,
    categorySlug: 'clothing',
  },
  {
    name: 'Slim Chino Trousers',
    slug: 'slim-chino-trousers',
    description: 'Stretch cotton-twill chinos tailored for all-day comfort from desk to dinner.',
    priceCents: 229900,
    stock: 30,
    categorySlug: 'clothing',
  },
  {
    name: 'Heavyweight Fleece Hoodie',
    slug: 'heavyweight-fleece-hoodie',
    description:
      'Cozy 400 GSM brushed-back cotton fleece pullover with a double-lined hood and kangaroo pocket.',
    priceCents: 249900,
    stock: 20,
    categorySlug: 'clothing',
  },
  {
    name: 'Merino Crew Socks (3-Pack)',
    slug: 'merino-crew-socks-3-pack',
    description:
      'Moisture-wicking merino wool blend crew socks with cushioned heels and seamless toes.',
    priceCents: 79900,
    stock: 45,
    categorySlug: 'clothing',
  },
  {
    name: 'Water-Resistant Windbreaker',
    slug: 'water-resistant-windbreaker',
    description:
      'Packable ripstop nylon shell with DWR coating, zippered pockets, and adjustable drawcord hem.',
    priceCents: 329900,
    stock: 15,
    categorySlug: 'clothing',
  },

  // Home & Kitchen (6)
  {
    name: 'Pour-Over Glass Coffee Carafe',
    slug: 'pour-over-glass-coffee-carafe',
    description:
      '600 ml borosilicate glass dripper and carafe with a reusable stainless-steel micro-mesh filter.',
    priceCents: 129900,
    stock: 28,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Cast Iron Skillet 10-Inch',
    slug: 'cast-iron-skillet-10-inch',
    description:
      'Pre-seasoned heavy-duty cast iron pan suitable for stovetop, oven, and induction cooking.',
    priceCents: 179900,
    stock: 19,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Double-Wall Insulated Bottle 750ml',
    slug: 'double-wall-insulated-bottle-750ml',
    description:
      'Food-grade 18/8 stainless steel flask that keeps drinks cold for 24 hours or hot for 12 hours.',
    priceCents: 84900,
    stock: 55,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Bamboo Cutting Board Set',
    slug: 'bamboo-cutting-board-set',
    description:
      'Set of 3 sustainably harvested bamboo prep boards with juice grooves and built-in side handles.',
    priceCents: 119900,
    stock: 34,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Ceramic Stoneware Mug Set (4-Pack)',
    slug: 'ceramic-stoneware-mug-set',
    description:
      'Matte-glazed 350 ml stoneware mugs, dishwasher and microwave safe for daily coffee or tea.',
    priceCents: 149900,
    stock: 26,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Minimalist LED Desk Lamp',
    slug: 'minimalist-led-desk-lamp',
    description:
      'Stepless dimming aluminum desk lamp with 3 color temperature modes and a flicker-free diffuser.',
    priceCents: 219900,
    stock: 21,
    categorySlug: 'home-kitchen',
  },

  // Books (6)
  {
    name: 'Designing Data-Intensive Applications',
    slug: 'designing-data-intensive-applications',
    description:
      'The big ideas behind reliable, scalable, and maintainable systems—a deep dive into modern data architecture.',
    priceCents: 189900,
    stock: 20,
    categorySlug: 'books',
  },
  {
    name: 'The Pragmatic Programmer',
    slug: 'the-pragmatic-programmer',
    description:
      '20th Anniversary Edition covering timeless software craftsmanship, debugging, and career habits.',
    priceCents: 159900,
    stock: 30,
    categorySlug: 'books',
  },
  {
    name: 'Clean Architecture',
    slug: 'clean-architecture',
    description:
      'A practical guide to software structure, component boundaries, and keeping business rules independent of frameworks.',
    priceCents: 139900,
    stock: 24,
    categorySlug: 'books',
  },
  {
    name: 'Refactoring: Improving Existing Code',
    slug: 'refactoring-improving-existing-code',
    description:
      'Comprehensive catalog of safe, incremental code transformations with JavaScript examples.',
    priceCents: 169900,
    stock: 16,
    categorySlug: 'books',
  },
  {
    name: 'Web Scalability for Startup Engineers',
    slug: 'web-scalability-for-startup-engineers',
    description:
      'Hands-on patterns for caching, queues, database sharding, and growing a web backend.',
    priceCents: 129900,
    stock: 22,
    categorySlug: 'books',
  },
  {
    name: 'The Design of Everyday Things',
    slug: 'the-design-of-everyday-things',
    description:
      'Classic exploration of human-centered design, affordances, signifiers, and why good interfaces feel effortless.',
    priceCents: 79900,
    stock: 35,
    categorySlug: 'books',
  },
];

async function main() {
  // 1. Upsert categories and keep a slug -> id map
  const categoryIdBySlug = new Map<CategorySlug, string>();

  for (const cat of CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryIdBySlug.set(cat.slug, upserted.id);
  }

  // 2. Upsert products
  for (const product of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug: ${product.categorySlug}`);
    }

    const imageUrl = `https://picsum.photos/seed/${product.slug}/600/600`;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        imageUrl,
        isActive: true,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        imageUrl,
        isActive: true,
        categoryId,
      },
    });
  }

  // 3. Upsert demo user
  const demoPasswordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@shoplearn.dev' },
    update: {
      name: 'Demo Shopper',
      passwordHash: demoPasswordHash,
    },
    create: {
      email: 'demo@shoplearn.dev',
      name: 'Demo Shopper',
      passwordHash: demoPasswordHash,
    },
  });

  const [categoryCount, productCount, userCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  console.log(
    `Seeded successfully: ${categoryCount} categories, ${productCount} products, ${userCount} users.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
