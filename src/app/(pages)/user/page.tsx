import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserDashboardClient from "./UserDashboardClient";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [totalReviews, approvedReviews, pendingReviews, totalComments] =
    await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.review.count({ where: { userId, status: "APPROVED" } }),
      prisma.review.count({ where: { userId, status: "PENDING" } }),
      prisma.comment.count({ where: { userId } }),
    ]);

  const userName = session?.user.name || session?.user.email || "User";
  const stats = {
    totalReviews,
    approvedReviews,
    pendingReviews,
    totalComments,
  };

  return <UserDashboardClient userName={userName} stats={stats} />;
}
