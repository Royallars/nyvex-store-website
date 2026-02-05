import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    ['ranks', 'Ränge'],
    ['coins', 'Coins'],
    ['tokens', 'Tokens'],
    ['permissions', 'Rechte'],
    ['bundles', 'Bundles'],
    ['subscriptions', 'Subscriptions'],
    ['season-pass', 'Season Pass'],
    ['cosmetics', 'Cosmetics']
  ] as const;

  for (const [slug, name] of categories) {
    await prisma.category.upsert({ where: { slug }, create: { slug, name }, update: { name } });
  }

  const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));

  const products = [
    ['ranks', 'Knight', 'knight', 499, '/icons/products/knight.svg', ['Starter-Rang', '2 Homes'], { rank: 'knight' }],
    ['ranks', 'Lord', 'lord', 999, '/icons/products/lord.svg', ['4 Homes', '/hat'], { rank: 'lord' }],
    ['ranks', 'Paladin', 'paladin', 1499, '/icons/products/paladin.svg', ['/fly spawn', '6 Homes'], { rank: 'paladin' }],
    ['ranks', 'Duke', 'duke', 2499, '/icons/products/duke.svg', ['/ec', '/workbench'], { rank: 'duke' }],
    ['ranks', 'King', 'king', 3999, '/icons/products/king.svg', ['/nick', '15 Homes'], { rank: 'king' }],
    ['coins', '100.000 Coins', 'coins-100k', 399, '/icons/products/coins-100k.svg', ['+100000 Coins'], { amount: 100000 }],
    ['coins', '500.000 Coins', 'coins-500k', 1299, '/icons/products/coins-500k.svg', ['+500000 Coins'], { amount: 500000 }],
    ['tokens', '100 Tokens', 'tokens-100', 499, '/icons/products/tokens-100.svg', ['+100 Tokens'], { amount: 100 }],
    ['tokens', '500 Tokens', 'tokens-500', 1799, '/icons/products/tokens-500.svg', ['+500 Tokens'], { amount: 500 }],
    ['permissions', 'Fly Permission', 'perm-fly', 899, '/icons/products/perm-fly.svg', ['essentials.fly'], {}],
    ['permissions', 'Repair Permission', 'perm-repair', 699, '/icons/products/perm-repair.svg', ['essentials.repair'], {}],
    ['bundles', 'Starter Pack', 'bundle-starter', 1999, '/icons/products/bundle-starter.svg', ['Knight + 100k Coins + 100 Tokens'], {}],
    ['bundles', 'Pro Pack', 'bundle-pro', 3999, '/icons/products/bundle-pro.svg', ['Paladin + 500k Coins + 500 Tokens'], {}],
    ['bundles', 'King Pack', 'bundle-king', 6999, '/icons/products/bundle-king.svg', ['King + 500k Coins + 500 Tokens + Rechte'], {}],
    ['subscriptions', 'VIP Pass Monthly', 'vip-pass-monthly', 999, '/icons/products/vip-pass-monthly.svg', ['monatlich Coins/Tokens'], {}],
    ['season-pass', 'Season Pass', 'season-pass', 1499, '/icons/products/season-pass.svg', ['Season Rewards'], {}]
  ] as const;

  for (const p of products) {
    const [categorySlug, name, slug, priceCents, iconPath, perks, metadata] = p;
    await prisma.product.upsert({
      where: { slug },
      create: {
        categoryId: cat[categorySlug],
        name,
        slug,
        description: `${name} für Nyvex Network`,
        perks,
        metadata,
        priceCents,
        iconPath,
        isPopular: ['coins-500k', 'paladin', 'bundle-pro'].includes(slug),
        isBestValue: ['king', 'bundle-king'].includes(slug)
      },
      update: {
        categoryId: cat[categorySlug],
        name,
        description: `${name} für Nyvex Network`,
        perks,
        metadata,
        priceCents,
        iconPath
      }
    });
  }

  const bySlug = Object.fromEntries((await prisma.product.findMany()).map((p) => [p.slug, p.id]));

  const bundleLinks: Array<[string, string, number]> = [
    ['bundle-starter', 'knight', 1],
    ['bundle-starter', 'coins-100k', 1],
    ['bundle-starter', 'tokens-100', 1],
    ['bundle-pro', 'paladin', 1],
    ['bundle-pro', 'coins-500k', 1],
    ['bundle-pro', 'tokens-500', 1],
    ['bundle-king', 'king', 1],
    ['bundle-king', 'coins-500k', 1],
    ['bundle-king', 'tokens-500', 1],
    ['bundle-king', 'perm-fly', 1],
    ['bundle-king', 'perm-repair', 1]
  ];

  await prisma.bundleItem.deleteMany();
  await prisma.bundleItem.createMany({
    data: bundleLinks.map(([bundle, child, amount]) => ({ bundleProductId: bySlug[bundle], childProductId: bySlug[child], amount }))
  });

  await prisma.subscriptionPlan.upsert({
    where: { productId: bySlug['vip-pass-monthly'] },
    create: { productId: bySlug['vip-pass-monthly'], monthlyCoinsAmount: 100000, monthlyTokensAmount: 150 },
    update: { monthlyCoinsAmount: 100000, monthlyTokensAmount: 150 }
  });

  await prisma.seasonPass.upsert({
    where: { productId: bySlug['season-pass'] },
    create: {
      productId: bySlug['season-pass'],
      seasonName: 'Nyvex Season 1',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000)
    },
    update: {}
  });

  const season = await prisma.seasonPass.findUniqueOrThrow({ where: { productId: bySlug['season-pass'] } });
  await prisma.seasonLevel.deleteMany({ where: { seasonPassId: season.id } });
  await prisma.seasonMission.deleteMany({ where: { seasonPassId: season.id } });
  await prisma.seasonReward.deleteMany({ where: { seasonPassId: season.id } });
  await prisma.seasonLevel.createMany({ data: [1, 2, 3, 4, 5].map((level) => ({ seasonPassId: season.id, level, xpRequired: level * 100 })) });
  await prisma.seasonMission.createMany({
    data: [
      { seasonPassId: season.id, name: 'Login Today', missionType: 'login', frequency: 'daily', target: 1, rewardXp: 20 },
      { seasonPassId: season.id, name: 'Buy Once', missionType: 'purchase', frequency: 'weekly', target: 1, rewardXp: 70 }
    ]
  });
  await prisma.seasonReward.createMany({
    data: [
      { seasonPassId: season.id, level: 1, rewardType: 'tokens', rewardValue: '25' },
      { seasonPassId: season.id, level: 5, rewardType: 'permission', rewardValue: 'season.cosmetic.glow' }
    ]
  });

  await prisma.deal.upsert({
    where: { slug: 'weekend-sale' },
    create: {
      name: 'Weekend Sale',
      slug: 'weekend-sale',
      startsAt: new Date(Date.now() - 3600_000),
      endsAt: new Date(Date.now() + 48 * 3600_000),
      discountPct: 20,
      items: { create: [{ productId: bySlug['bundle-pro'] }, { productId: bySlug['coins-500k'] }] }
    },
    update: { discountPct: 20, startsAt: new Date(Date.now() - 3600_000), endsAt: new Date(Date.now() + 48 * 3600_000) }
  });

  await prisma.affiliateCreator.upsert({
    where: { code: 'NYVEXCREATOR' },
    create: { code: 'NYVEXCREATOR', displayName: 'NyvexCreator', commissionPct: 12 },
    update: { displayName: 'NyvexCreator', commissionPct: 12 }
  });

  await prisma.review.deleteMany({ where: { isFeatured: true } });
  await prisma.review.createMany({
    data: [
      { authorName: 'Kryon', rating: 5, quote: 'Top schneller Shop, Lieferung in unter 2 Minuten.', isFeatured: true },
      { authorName: 'MineLena', rating: 5, quote: 'King Rank kam direkt an, sehr smooth!', isFeatured: true },
      { authorName: 'PvP_Jonas', rating: 4, quote: 'Design ist mega, Checkout easy.', isFeatured: true },
      { authorName: 'SkyNico', rating: 5, quote: 'Support musste ich gar nicht kontaktieren.', isFeatured: true },
      { authorName: 'BastiBuilds', rating: 5, quote: 'Best Value Bundles lohnen sich richtig.', isFeatured: true }
    ]
  });

  const commandMap: Record<string, string[]> = {
    knight: ['lp user {player} parent set knight'],
    lord: ['lp user {player} parent set lord'],
    paladin: ['lp user {player} parent set paladin'],
    duke: ['lp user {player} parent set duke'],
    king: ['lp user {player} parent set king'],
    'coins-100k': ['coins add {player} 100000'],
    'coins-500k': ['coins add {player} 500000'],
    'tokens-100': ['prison tokens add {player} 100'],
    'tokens-500': ['prison tokens add {player} 500'],
    'perm-fly': ['lp user {player} permission set essentials.fly true'],
    'perm-repair': ['lp user {player} permission set essentials.repair true']
  };

  for (const [slug, commands] of Object.entries(commandMap)) {
    const pid = bySlug[slug];
    if (!pid) continue;
    await prisma.commandTemplate.deleteMany({ where: { productId: pid } });
    await prisma.commandTemplate.createMany({ data: commands.map((command) => ({ productId: pid, command })) });
  }
}

main().finally(() => prisma.$disconnect());
