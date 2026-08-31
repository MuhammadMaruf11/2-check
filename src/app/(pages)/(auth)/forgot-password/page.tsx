import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>
        <p className="mt-3 text-sm text-gray-500">
          Automated password reset isn&apos;t set up yet. In the meantime, please{" "}
          <Link href="/contact" className="text-primary! underline">
            contact us
          </Link>{" "}
          and we&apos;ll help you regain access to your account.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-primary! underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
