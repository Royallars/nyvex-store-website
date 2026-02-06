import { prisma } from '@/lib/prisma';

export default async function AdminCommandsPage() {
  const commands = await prisma.commandTemplate.findMany({ include: { product: true } });
  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Command Templates</h1>
        {commands.map((c) => (
          <form key={c.id} action="/api/admin/commands" method="post" className="mt-2 grid grid-cols-4 gap-2 rounded border border-purple-400/20 p-2">
            <input type="hidden" name="id" value={c.id} />
            <input readOnly value={c.product.name} className="rounded border border-purple-400/20 bg-transparent px-2" />
            <input name="command" defaultValue={c.command} className="col-span-2 rounded border border-purple-400/20 bg-transparent px-2" />
            <button className="rounded bg-purple-500 px-2 py-1">Save</button>
          </form>
        ))}
      </section>
    </main>
  );
}
