import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData();
  const id = String(form.get('id'));
  await prisma.product.update({
    where: { id },
    data: {
      name: String(form.get('name')),
      priceCents: Number(form.get('priceCents')),
      iconPath: String(form.get('iconPath')),
      active: Boolean(form.get('active'))
    }
  });
  return NextResponse.redirect(new URL('/admin/products', req.url));
}
