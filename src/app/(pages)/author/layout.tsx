import AuthorSidebar from "@/components/common/AuthorSidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Only AUTHOR and ADMIN may access the author studio. Plain USER accounts
  // and unauthenticated visitors are sent to login.
  if (!session || (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <AuthorSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
