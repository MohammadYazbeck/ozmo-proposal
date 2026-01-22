import { LoginForm } from "@/components/LoginForm";

export default function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-up space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Proposal Builder</h1>
          <p className="text-sm text-slate-500">Sign in to manage proposals.</p>
        </div>
        <LoginForm nextPath={searchParams?.next} />
      </div>
    </div>
  );
}
