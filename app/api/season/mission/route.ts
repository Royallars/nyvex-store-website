import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await req.json()) as { missionType: string };
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const season = await prisma.seasonPass.findFirst({ where: { startsAt: { lte: new Date() }, endsAt: { gte: new Date() } } });
  if (!season) return NextResponse.json({ error: 'No active season' }, { status: 404 });

  const mission = await prisma.seasonMission.findFirst({ where: { seasonPassId: season.id, missionType: payload.missionType } });
  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 });

  const progress = await prisma.userSeasonProgress.upsert({
    where: { userId_seasonPassId: { userId: user.id, seasonPassId: season.id } },
    create: { userId: user.id, seasonPassId: season.id, completedMissions: [], xp: mission.rewardXp },
    update: { xp: { increment: mission.rewardXp } }
  });

  const level = Math.floor(progress.xp / 100) + 1;
  await prisma.userSeasonProgress.update({ where: { id: progress.id }, data: { level } });

  return NextResponse.json({ ok: true, xp: progress.xp + mission.rewardXp, level });
}
