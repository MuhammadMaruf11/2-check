import UserSidebar from "@/components/common/UserSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <UserSidebar />
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
