import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deliveryAckSchema } from '@/lib/validation';
import { verifyHmacWithReplay } from '@/lib/security';
import { limit } from '@/lib/rate-limit';

async function alertDiscord(content: string) {
  if (!process.env.DISCORD_ALERT_WEBHOOK_URL) return;
  await fetch(process.env.DISCORD_ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content })
  });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-nyvex-signature');
  const secret = process.env.DELIVERY_HMAC_SECRET;
  if (!secret) return NextResponse.json({ error: 'Missing secret' }, { status: 500 });
  if (!limit('delivery:ack', 60, 60_000)) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  const body = JSON.parse(raw);
  const parsed = deliveryAckSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const checked = await verifyHmacWithReplay(raw, signature, secret, body.timestamp, body.nonce);
  if (!checked.ok) return NextResponse.json({ error: checked.reason }, { status: 401 });

  const job = await prisma.deliveryJob.findUnique({ where: { id: parsed.data.jobId } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (parsed.data.success) {
    await prisma.deliveryJob.update({ where: { id: job.id }, data: { status: 'DELIVERED', finishedAt: new Date(), lastError: null } });
  } else {
    const retries = job.retries + 1;
    const failed = retries >= job.maxAttempts;
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        retries,
        status: failed ? 'FAILED' : 'PENDING',
        lastError: parsed.data.log || 'Delivery failed',
        nextAttemptAt: new Date(Date.now() + Math.pow(2, retries) * 60_000)
      }
    });
    if (failed) {
      await alertDiscord(`❌ Delivery failed job=${job.id} attempts=${retries} error=${parsed.data.log || 'unknown'}`);
    }
  }

  await prisma.deliveryLog.create({ data: { deliveryJobId: job.id, level: parsed.data.success ? 'info' : 'error', message: parsed.data.log || (parsed.data.success ? 'Delivered' : 'Failed') } });
  return NextResponse.json({ ok: true });
}
