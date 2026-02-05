import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: 'ranks', name: 'Ränge' },
    { slug: 'coins', name: 'Coins' },
    { slug: 'tokens', name: 'Tokens' },
    { slug: 'permissions', name: 'Rechte' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category
    });
  }

  const c = Object.fromEntries((await prisma.category.findMany()).map((x) => [x.slug, x.id]));

  const products = [
    { categoryId: c.ranks, name: 'Knight', slug: 'knight', description: 'Starter Rang mit Basisrechten.', perks: ['/kit knight', '2 Homes'], priceCents: 499, currency: 'EUR', iconPath: '/icons/products/knight.svg' },
    { categoryId: c.ranks, name: 'Lord', slug: 'lord', description: 'Mittlerer Rang mit Utility.', perks: ['/hat', '4 Homes'], priceCents: 999, currency: 'EUR', iconPath: '/icons/products/lord.svg' },
    { categoryId: c.ranks, name: 'Paladin', slug: 'paladin', description: 'Starker Rang für aktive Spieler.', perks: ['/fly am Spawn', '6 Homes'], priceCents: 1499, currency: 'EUR', iconPath: '/icons/products/paladin.svg' },
    { categoryId: c.ranks, name: 'Duke', slug: 'duke', description: 'High Tier Rang.', perks: ['/ec', '/workbench'], priceCents: 2499, currency: 'EUR', iconPath: '/icons/products/duke.svg' },
    { categoryId: c.ranks, name: 'King', slug: 'king', description: 'Bester Rang im Netzwerk.', perks: ['/nick', '15 Homes'], priceCents: 3999, currency: 'EUR', iconPath: '/icons/products/king.svg' },
    { categoryId: c.coins, name: '100.000 Coins', slug: 'coins-100k', description: 'Economy Boost.', perks: ['coins +100000'], priceCents: 399, currency: 'EUR', iconPath: '/icons/products/coins-100k.svg' },
    { categoryId: c.coins, name: '500.000 Coins', slug: 'coins-500k', description: 'Großes Coin Paket.', perks: ['coins +500000'], priceCents: 1299, currency: 'EUR', iconPath: '/icons/products/coins-500k.svg' },
    { categoryId: c.tokens, name: '100 Tokens', slug: 'tokens-100', description: 'Tokens für Upgrades.', perks: ['tokens +100'], priceCents: 499, currency: 'EUR', iconPath: '/icons/products/tokens-100.svg' },
    { categoryId: c.tokens, name: '500 Tokens', slug: 'tokens-500', description: 'Großes Token Paket.', perks: ['tokens +500'], priceCents: 1799, currency: 'EUR', iconPath: '/icons/products/tokens-500.svg' },
    { categoryId: c.permissions, name: 'Fly Permission', slug: 'perm-fly', description: 'Permanent /fly Recht.', perks: ['essentials.fly'], priceCents: 899, currency: 'EUR', iconPath: '/icons/products/perm-fly.svg' },
    { categoryId: c.permissions, name: 'Repair Permission', slug: 'perm-repair', description: 'Permanent /repair Recht.', perks: ['essentials.repair'], priceCents: 699, currency: 'EUR', iconPath: '/icons/products/perm-repair.svg' }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }

  const commandMap: Record<string, string[]> = {
    knight: ['lp user {player} parent set knight'],
    lord: ['lp user {player} parent set lord'],
    paladin: ['lp user {player} parent set paladin'],
    duke: ['lp user {player} parent set duke'],
    king: ['lp user {player} parent set king'],
    'coins-100k': ['coins give {player} 100000'],
    'coins-500k': ['coins give {player} 500000'],
    'tokens-100': ['tokens give {player} 100'],
    'tokens-500': ['tokens give {player} 500'],
    'perm-fly': ['lp user {player} permission set essentials.fly true'],
    'perm-repair': ['lp user {player} permission set essentials.repair true']
  };

  for (const [slug, commands] of Object.entries(commandMap)) {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug } });
    await prisma.commandTemplate.deleteMany({ where: { productId: product.id } });
    await prisma.commandTemplate.createMany({
      data: commands.map((command) => ({ productId: product.id, command }))
    });
  }
}

main().finally(() => prisma.$disconnect());
