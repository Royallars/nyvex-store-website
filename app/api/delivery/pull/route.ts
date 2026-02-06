import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deliveryPullSchema } from '@/lib/validation';
import { verifyHmacWithReplay } from '@/lib/security';
import { limit } from '@/lib/rate-limit';

function compile(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-nyvex-signature');
  const secret = process.env.DELIVERY_HMAC_SECRET;
  if (!secret) return NextResponse.json({ error: 'Missing secret' }, { status: 500 });

  if (!limit('delivery:pull', 40, 60_000)) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  let parsed;
  try {
    parsed = deliveryPullSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const checked = await verifyHmacWithReplay(raw, signature, secret, parsed.timestamp, parsed.nonce);
  if (!checked.ok) return NextResponse.json({ error: checked.reason }, { status: 401 });

  const jobs = await prisma.deliveryJob.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
    include: { order: { include: { items: { include: { product: { include: { commandTemplates: true, bundleItems: { include: { childProduct: { include: { commandTemplates: true } } } } } } } } } } },
    take: parsed.limit
  });

  if (!jobs.length) return NextResponse.json({ jobs: [] });

  for (const j of jobs) {
    await prisma.deliveryJob.update({ where: { id: j.id }, data: { status: 'PROCESSING', startedAt: new Date() } });
  }

  return NextResponse.json({
    jobs: jobs.map((job) => {
      const commands = job.order.items.flatMap((item) => {
        const direct = item.product.commandTemplates;
        const bundleChildren = item.product.bundleItems.flatMap((bi) =>
          bi.childProduct.commandTemplates.map((t) => ({ command: t.command, amount: bi.amount * item.quantity }))
        );

        const fromDirect = direct.map((tpl) =>
          compile(tpl.command, {
            player: job.order.giftedTo || job.order.minecraftName,
            uuid: job.order.minecraftUuid ?? '',
            amount: (item.product.metadata as any)?.amount ?? item.quantity
          })
        );
        const fromBundle = bundleChildren.map((tpl) =>
          compile(tpl.command, {
            player: job.order.giftedTo || job.order.minecraftName,
            uuid: job.order.minecraftUuid ?? '',
            amount: tpl.amount
          })
        );

        return [...fromDirect, ...fromBundle];
      });


      const finalCommands = job.type === 'REVOKE'
        ? commands.map((cmd) => {
            if (cmd.includes(' parent set ')) return `lp user ${job.order.giftedTo || job.order.minecraftName} parent set default`;
            if (cmd.includes('essentials.fly')) return `lp user ${job.order.giftedTo || job.order.minecraftName} permission unset essentials.fly`;
            if (cmd.includes('essentials.repair')) return `lp user ${job.order.giftedTo || job.order.minecraftName} permission unset essentials.repair`;
            return '';
          }).filter(Boolean)
        : commands;

      return {
        id: job.id,
        orderId: job.orderId,
        minecraftName: job.order.giftedTo || job.order.minecraftName,
        commands: finalCommands
      };
    })
  });
}
