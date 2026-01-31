"use client";

import { useFormState, useFormStatus } from "react-dom";
import { unlockProgress } from "@/lib/progress-actions";

type ActionState = { error?: string };
const initialState: ActionState = { error: "" };

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
    >
      {pending ? "Checking..." : "Unlock"}
    </button>
  );
};

export const ProgressUnlockForm = ({ slug }: { slug: string }) => {
  const [state, formAction] = useFormState<ActionState, FormData>(unlockProgress, initialState);

  return (
    <form action={formAction} className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-black/60 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-md">
      <input type="hidden" name="slug" value={slug} />
      <div>
        <h1 className="text-2xl font-semibold text-white">Enter access password</h1>
        <p className="mt-2 text-sm text-slate-400">This progress page is protected.</p>
      </div>
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-orange focus:outline-none"
      />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
};
