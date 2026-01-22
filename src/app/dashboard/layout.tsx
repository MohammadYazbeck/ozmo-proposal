import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard/proposals" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-6 w-6  object-contain"
            />
            <span className="font-sans text-2xl font-bold text-brand-orange">
              OZMO
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              href="/dashboard/proposals"
              className="rounded-lg px-3 py-2 text-slate-600 transition hover:text-brand-orange"
            >
              Proposals
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-brand-orange hover:text-brand-orange"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl animate-fade-up px-6 py-8">
        {children}
      </main>
    </div>
  );
}
