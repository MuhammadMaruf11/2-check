import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AuthorDashboardPage() {
  const session = await getServerSession(authOptions);
  const authorId = session!.user.id;

  const [total, drafts, pending, published, rejected] = await Promise.all([
    prisma.blog.count({ where: { authorId } }),
    prisma.blog.count({ where: { authorId, status: "DRAFT" } }),
    prisma.blog.count({ where: { authorId, status: "PENDING_REVIEW" } }),
    prisma.blog.count({ where: { authorId, status: "PUBLISHED" } }),
    prisma.blog.count({ where: { authorId, status: "REJECTED" } }),
  ]);

  const stats = [
    { label: "Total Posts", value: total },
    { label: "Drafts", value: drafts },
    { label: "Pending Review", value: pending },
    { label: "Published", value: published },
    { label: "Rejected", value: rejected },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {session?.user.name}</h1>
          <p className="text-gray-500 text-sm">Here&apos;s an overview of your writing.</p>
        </div>
        <Link href="/author/posts/create" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
          New Post
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
