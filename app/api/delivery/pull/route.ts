import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHmac } from '@/lib/security';

function compile(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-nyvex-signature');
  const secret = process.env.DELIVERY_HMAC_SECRET;
  if (!secret || !verifyHmac(raw, signature, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pending = await prisma.deliveryJob.findFirst({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
    include: { order: { include: { items: { include: { product: { include: { commandTemplates: true } } } } } } }
  });

  if (!pending) return NextResponse.json({ jobs: [] });

  await prisma.deliveryJob.update({ where: { id: pending.id }, data: { status: 'PROCESSING' } });

  const commands = pending.order.items.flatMap((item) =>
    item.product.commandTemplates.map((tpl) =>
      compile(tpl.command, {
        player: pending.order.minecraftName,
        uuid: pending.order.minecraftUuid ?? '',
        amount: item.quantity
      })
    )
  );

  return NextResponse.json({
    jobs: [
      {
        id: pending.id,
        orderId: pending.orderId,
        minecraftName: pending.order.minecraftName,
        commands
      }
    ]
  });
}

export async function PATCH(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-nyvex-signature');
  const secret = process.env.DELIVERY_HMAC_SECRET;
  if (!secret || !verifyHmac(raw, signature, secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = JSON.parse(raw) as { jobId: string; success: boolean; log?: string };
  const job = await prisma.deliveryJob.findUnique({ where: { id: body.jobId } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.success) {
    await prisma.deliveryJob.update({ where: { id: body.jobId }, data: { status: 'DELIVERED' } });
  } else {
    const retries = job.retries + 1;
    await prisma.deliveryJob.update({
      where: { id: body.jobId },
      data: {
        status: retries >= 5 ? 'FAILED' : 'PENDING',
        retries,
        lastError: body.log,
        nextAttemptAt: new Date(Date.now() + retries * 60_000)
      }
    });
  }

  await prisma.deliveryLog.create({ data: { deliveryJobId: body.jobId, message: body.log || (body.success ? 'Delivered' : 'Failed') } });
  return NextResponse.json({ ok: true });
}
