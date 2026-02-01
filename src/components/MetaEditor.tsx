"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createMeta, deleteMeta, updateMeta } from "@/lib/meta-actions";
import type { MetaData, MetaResults } from "@/lib/meta-data";
import { isMetaAvailable } from "@/lib/meta-data";
import type { ProposalStatus } from "@/lib/validation";

type EditorMeta = {
  id?: string;
  slug?: string;
  status?: ProposalStatus;
  showClient?: boolean;
  showWallet?: boolean;
  showResults?: boolean;
  showPlan?: boolean;
  hasPassword?: boolean;
};

type MetaEditorProps = {
  mode: "create" | "edit";
  meta?: EditorMeta | null;
  initialDataEn: MetaData;
  initialDataAr: MetaData;
};

type ActionState = { error?: string; message?: string };
const initialState: ActionState = { error: "", message: "" };

const SaveButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
};

export const MetaEditor = ({ mode, meta, initialDataEn, initialDataAr }: MetaEditorProps) => {
  const [dataEn, setDataEn] = useState<MetaData>(initialDataEn);
  const [dataAr, setDataAr] = useState<MetaData>(initialDataAr);
  const [slug, setSlug] = useState(meta?.slug ?? "");
  const [visibility, setVisibility] = useState({
    showClient: meta?.showClient ?? true,
    showWallet: meta?.showWallet ?? true,
    showResults: meta?.showResults ?? true,
    showPlan: meta?.showPlan ?? true
  });

  const defaultLang = useMemo(() => {
    if (isMetaAvailable(initialDataEn)) {
      return "en";
    }
    if (isMetaAvailable(initialDataAr)) {
      return "ar";
    }
    return "en";
  }, [initialDataEn, initialDataAr]);

  const [activeLang, setActiveLang] = useState<"en" | "ar">(defaultLang);

  const action = async (prevState: ActionState, formData: FormData) => {
    const handler = mode === "create" ? createMeta : updateMeta;
    const result = await handler(prevState, formData);
    return result ?? prevState;
  };

  const [state, formAction] = useFormState<ActionState, FormData>(action, initialState);

  const data = activeLang === "en" ? dataEn : dataAr;
  const setData = activeLang === "en" ? setDataEn : setDataAr;
  const isRtl = activeLang === "ar";
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const publicUrl = slug ? (baseUrl ? `${baseUrl}/meta/${slug}` : `/meta/${slug}`) : "";

  const updateClient = (field: "name" | "description", value: string) => {
    setData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const updateWallet = (value: string) => {
    setData((prev) => ({ ...prev, walletBalance: value }));
  };

  const updateResults = (field: keyof MetaResults, value: string) => {
    setData((prev) => ({ ...prev, results: { ...prev.results, [field]: value } }));
  };

  const updatePlanTitle = (value: string) => {
    setData((prev) => ({ ...prev, plan: { ...prev.plan, title: value } }));
  };

  const updatePlanPoint = (index: number, value: string) => {
    setData((prev) => {
      const points = [...prev.plan.points];
      points[index] = value;
      return { ...prev, plan: { ...prev.plan, points } };
    });
  };

  const addPlanPoint = () => {
    setData((prev) => ({
      ...prev,
      plan: { ...prev.plan, points: [...prev.plan.points, ""] }
    }));
  };

  const removePlanPoint = (index: number) => {
    setData((prev) => ({
      ...prev,
      plan: { ...prev.plan, points: prev.plan.points.filter((_, idx) => idx !== index) }
    }));
  };

  return (
    <form id="meta-form" action={formAction} className="space-y-8">
      {meta?.id ? <input type="hidden" name="id" value={meta.id} /> : null}
      <input type="hidden" name="dataEn" value={JSON.stringify(dataEn)} />
      <input type="hidden" name="dataAr" value={JSON.stringify(dataAr)} />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "create" ? "New meta page" : "Edit meta page"}
          </h1>
          <p className="text-sm text-slate-500">Meta Ads overview pages for clients.</p>
          {meta?.id && publicUrl ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Public link:</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 transition hover:border-brand-orange hover:text-brand-orange"
              >
                View
              </a>
              <span className="truncate">{publicUrl}</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {meta?.id ? (
            <button
              type="submit"
              formAction={deleteMeta}
              onClick={(event) => {
                if (!window.confirm("Delete this meta page? This cannot be undone.")) {
                  event.preventDefault();
                }
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
            >
              Delete
            </button>
          ) : null}
          <SaveButton label={mode === "create" ? "Create page" : "Save changes"} />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
      ) : null}
      {state.message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="client-meta"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              defaultValue={meta?.status ?? "DRAFT"}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">Publishing requires a client name in EN or AR.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Access password</label>
            <input
              type="password"
              name="password"
              placeholder={meta?.hasPassword ? "Leave empty to keep current password" : "Set a password"}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Section visibility</label>
            <div className="mt-2 grid gap-2 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showClient"
                  checked={visibility.showClient}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showClient: event.target.checked }))
                  }
                />
                Show client info
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showWallet"
                  checked={visibility.showWallet}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showWallet: event.target.checked }))
                  }
                />
                Show wallet balance
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showResults"
                  checked={visibility.showResults}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showResults: event.target.checked }))
                  }
                />
                Show campaign results
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showPlan"
                  checked={visibility.showPlan}
                  onChange={(event) => setVisibility((prev) => ({ ...prev, showPlan: event.target.checked }))}
                />
                Show suggested plan
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLang("en")}
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              activeLang === "en"
                ? "bg-brand-orange text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLang("ar")}
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              activeLang === "ar"
                ? "bg-brand-orange text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            AR
          </button>
          <span className="text-xs text-slate-500">
            {activeLang === "en" ? "Editing English content" : "Editing Arabic content"}
          </span>
        </div>

        <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "font-arabic text-right" : ""}>
          <div className="grid gap-6">
            {visibility.showClient ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Client</h2>
                <div className="grid gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Client name</label>
                    <input
                      value={data.client.name}
                      onChange={(event) => updateClient("name", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      value={data.client.description}
                      onChange={(event) => updateClient("description", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {visibility.showWallet ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Wallet Balance (USD)</h2>
                <input
                  value={data.walletBalance}
                  onChange={(event) => updateWallet(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                />
              </div>
            ) : null}

            {visibility.showResults ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Campaign Results</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Reach</label>
                    <input
                      value={data.results.reach}
                      onChange={(event) => updateResults("reach", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Messages</label>
                    <input
                      value={data.results.messages}
                      onChange={(event) => updateResults("messages", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Campaigns</label>
                    <input
                      value={data.results.campaigns}
                      onChange={(event) => updateResults("campaigns", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Followers earned</label>
                    <input
                      value={data.results.followers}
                      onChange={(event) => updateResults("followers", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Amount spent (USD)</label>
                    <input
                      value={data.results.amountSpent}
                      onChange={(event) => updateResults("amountSpent", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Time (days)</label>
                    <input
                      value={data.results.timeDays}
                      onChange={(event) => updateResults("timeDays", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {visibility.showPlan ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Suggested plan</h2>
                <div>
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={data.plan.title}
                    onChange={(event) => updatePlanTitle(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  {data.plan.points.map((point, index) => (
                    <div key={`plan-point-${index}`} className="flex items-center gap-2">
                      <input
                        value={point}
                        onChange={(event) => updatePlanPoint(index, event.target.value)}
                        className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removePlanPoint(index)}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPlanPoint}
                  className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                >
                  + Add point
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </form>
  );
};
