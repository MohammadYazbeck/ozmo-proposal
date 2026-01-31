"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProgress, deleteProgress, updateProgress } from "@/lib/progress-actions";
import { ProgressData, ProgressCalendarItem, ProgressPaymentEntry } from "@/lib/progress-data";
import { isProgressAvailable } from "@/lib/progress-data";
import type { ProposalStatus } from "@/lib/validation";

type EditorProgress = {
  id?: string;
  slug?: string;
  status?: ProposalStatus;
  showClient?: boolean;
  showPlan?: boolean;
  showCalendar?: boolean;
  showAssets?: boolean;
  showPayments?: boolean;
  showMetaAds?: boolean;
  hasPassword?: boolean;
};

type ProgressEditorProps = {
  mode: "create" | "edit";
  progress?: EditorProgress | null;
  initialDataEn: ProgressData;
  initialDataAr: ProgressData;
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

export const ProgressEditor = ({ mode, progress, initialDataEn, initialDataAr }: ProgressEditorProps) => {
  const [dataEn, setDataEn] = useState<ProgressData>(initialDataEn);
  const [dataAr, setDataAr] = useState<ProgressData>(initialDataAr);
  const [slug, setSlug] = useState(progress?.slug ?? "");
  const [visibility, setVisibility] = useState({
    showClient: progress?.showClient ?? true,
    showPlan: progress?.showPlan ?? true,
    showCalendar: progress?.showCalendar ?? true,
    showAssets: progress?.showAssets ?? false,
    showPayments: progress?.showPayments ?? true,
    showMetaAds: progress?.showMetaAds ?? true
  });

  const defaultLang = useMemo(() => {
    if (isProgressAvailable(initialDataEn)) {
      return "en";
    }
    if (isProgressAvailable(initialDataAr)) {
      return "ar";
    }
    return "en";
  }, [initialDataEn, initialDataAr]);

  const [activeLang, setActiveLang] = useState<"en" | "ar">(defaultLang);

  const action = async (prevState: ActionState, formData: FormData) => {
    const handler = mode === "create" ? createProgress : updateProgress;
    const result = await handler(prevState, formData);
    return result ?? prevState;
  };

  const [state, formAction] = useFormState<ActionState, FormData>(action, initialState);

  const data = activeLang === "en" ? dataEn : dataAr;
  const setData = activeLang === "en" ? setDataEn : setDataAr;
  const isRtl = activeLang === "ar";
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const publicUrl = slug ? (baseUrl ? `${baseUrl}/progress/${slug}` : `/progress/${slug}`) : "";

  const updateClient = (field: "name" | "description", value: string) => {
    setData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const updateWorkPlanBrief = (value: string) => {
    setData((prev) => ({ ...prev, workPlan: { ...prev.workPlan, brief: value } }));
  };

  const updateWorkPlanPoint = (index: number, value: string) => {
    setData((prev) => {
      const points = [...prev.workPlan.points];
      points[index] = { ...points[index], text: value };
      return { ...prev, workPlan: { ...prev.workPlan, points } };
    });
  };

  const toggleWorkPlanPointDone = (index: number) => {
    setData((prev) => {
      const points = [...prev.workPlan.points];
      points[index] = { ...points[index], done: !points[index].done };
      return { ...prev, workPlan: { ...prev.workPlan, points } };
    });
  };

  const addWorkPlanPoint = () => {
    setData((prev) => ({
      ...prev,
      workPlan: { ...prev.workPlan, points: [...prev.workPlan.points, { text: "", done: false }] }
    }));
  };

  const removeWorkPlanPoint = (index: number) => {
    setData((prev) => {
      const points = prev.workPlan.points.filter((_, idx) => idx !== index);
      return { ...prev, workPlan: { ...prev.workPlan, points } };
    });
  };

  const updateCalendarItem = (index: number, changes: Partial<ProgressCalendarItem>) => {
    setData((prev) => {
      const calendar = [...prev.calendar];
      calendar[index] = { ...calendar[index], ...changes };
      return { ...prev, calendar };
    });
  };

  const addCalendarItem = () => {
    setData((prev) => ({
      ...prev,
      calendar: [...prev.calendar, { date: "", time: "", title: "", points: [""] }]
    }));
  };

  const removeCalendarItem = (index: number) => {
    setData((prev) => ({
      ...prev,
      calendar: prev.calendar.filter((_, idx) => idx !== index)
    }));
  };

  const updateCalendarPoint = (index: number, pointIndex: number, value: string) => {
    setData((prev) => {
      const calendar = [...prev.calendar];
      const points = [...calendar[index].points];
      points[pointIndex] = value;
      calendar[index] = { ...calendar[index], points };
      return { ...prev, calendar };
    });
  };

  const addCalendarPoint = (index: number) => {
    setData((prev) => {
      const calendar = [...prev.calendar];
      calendar[index] = { ...calendar[index], points: [...calendar[index].points, ""] };
      return { ...prev, calendar };
    });
  };

  const removeCalendarPoint = (index: number, pointIndex: number) => {
    setData((prev) => {
      const calendar = [...prev.calendar];
      const points = calendar[index].points.filter((_, idx) => idx !== pointIndex);
      calendar[index] = { ...calendar[index], points };
      return { ...prev, calendar };
    });
  };

  const updatePayments = (field: "agreedPrice" | "metaAdsBalance", value: string) => {
    setData((prev) => ({ ...prev, payments: { ...prev.payments, [field]: value } }));
  };

  const updatePaymentEntry = (index: number, changes: Partial<ProgressPaymentEntry>) => {
    setData((prev) => {
      const entries = [...prev.payments.entries];
      entries[index] = { ...entries[index], ...changes };
      return { ...prev, payments: { ...prev.payments, entries } };
    });
  };

  const addPaymentEntry = () => {
    setData((prev) => ({
      ...prev,
      payments: { ...prev.payments, entries: [...prev.payments.entries, { amount: "", description: "", date: "" }] }
    }));
  };

  const removePaymentEntry = (index: number) => {
    setData((prev) => ({
      ...prev,
      payments: { ...prev.payments, entries: prev.payments.entries.filter((_, idx) => idx !== index) }
    }));
  };

  return (
    <form id="progress-form" action={formAction} className="space-y-8">
      {progress?.id ? <input type="hidden" name="id" value={progress.id} /> : null}
      <input type="hidden" name="dataEn" value={JSON.stringify(dataEn)} />
      <input type="hidden" name="dataAr" value={JSON.stringify(dataAr)} />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "create" ? "New progress page" : "Edit progress page"}
          </h1>
          <p className="text-sm text-slate-500">Create client-facing progress updates.</p>
          {progress?.id && publicUrl ? (
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
          {progress?.id ? (
            <button
              type="submit"
              formAction={deleteProgress}
              onClick={(event) => {
                if (!window.confirm("Delete this progress page? This cannot be undone.")) {
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
              placeholder="client-progress"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              defaultValue={progress?.status ?? "DRAFT"}
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
              placeholder={progress?.hasPassword ? "Leave empty to keep current password" : "Set a password"}
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
                  name="showPlan"
                  checked={visibility.showPlan}
                  onChange={(event) => setVisibility((prev) => ({ ...prev, showPlan: event.target.checked }))}
                />
                Show work plan progress
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showCalendar"
                  checked={visibility.showCalendar}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showCalendar: event.target.checked }))
                  }
                />
                Show calendar
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showAssets"
                  checked={visibility.showAssets}
                  onChange={(event) => setVisibility((prev) => ({ ...prev, showAssets: event.target.checked }))}
                />
                Show assets button
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showPayments"
                  checked={visibility.showPayments}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showPayments: event.target.checked }))
                  }
                />
                Show payments
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showMetaAds"
                  checked={visibility.showMetaAds}
                  onChange={(event) =>
                    setVisibility((prev) => ({ ...prev, showMetaAds: event.target.checked }))
                  }
                />
                Show Meta ads balance
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

            {visibility.showPlan ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Work Plan Progress</h2>
                <div>
                  <label className="text-sm font-medium text-slate-700">Brief</label>
                  <input
                    value={data.workPlan.brief}
                    onChange={(event) => updateWorkPlanBrief(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  {data.workPlan.points.map((point, index) => (
                    <div key={`plan-${index}`} className="flex flex-wrap items-center gap-2">
                      <input
                        type="checkbox"
                        checked={point.done}
                        onChange={() => toggleWorkPlanPointDone(index)}
                      />
                      <input
                        value={point.text}
                        onChange={(event) => updateWorkPlanPoint(index, event.target.value)}
                        className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeWorkPlanPoint(index)}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addWorkPlanPoint}
                  className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                >
                  + Add point
                </button>
              </div>
            ) : null}

            {visibility.showCalendar ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">Calendar</h2>
                  <button
                    type="button"
                    onClick={addCalendarItem}
                    className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                  >
                    + Add card
                  </button>
                </div>
                {data.calendar.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No calendar cards yet. Add one to get started.
                  </div>
                ) : null}
                <div className="grid gap-4">
                  {data.calendar.map((item, index) => (
                    <div key={`calendar-${index}`} className="rounded-lg border border-slate-200 p-4">
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="grid gap-2">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-slate-500">Date</label>
                              <input
                                type="date"
                                value={item.date}
                                onChange={(event) => updateCalendarItem(index, { date: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500">Time (optional)</label>
                              <input
                                type="time"
                                value={item.time ?? ""}
                                onChange={(event) => updateCalendarItem(index, { time: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Title</label>
                            <input
                              value={item.title ?? ""}
                              onChange={(event) => updateCalendarItem(index, { title: event.target.value })}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCalendarItem(index)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove card
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {item.points.map((point, pointIndex) => (
                          <div key={`calendar-${index}-point-${pointIndex}`} className="flex items-center gap-2">
                            <input
                              value={point}
                              onChange={(event) => updateCalendarPoint(index, pointIndex, event.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeCalendarPoint(index, pointIndex)}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addCalendarPoint(index)}
                        className="mt-3 text-xs font-semibold text-brand-orange hover:text-orange-600"
                      >
                        + Add point
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {visibility.showAssets ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Assets</h2>
                <input
                  value={data.assetsUrl}
                  onChange={(event) => setData((prev) => ({ ...prev, assetsUrl: event.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                />
              </div>
            ) : null}

            {visibility.showPayments ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Payments (USD)</h2>
                <div className="grid gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Agreed price</label>
                    <input
                      value={data.payments.agreedPrice}
                      onChange={(event) => updatePayments("agreedPrice", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  {visibility.showMetaAds ? (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Meta ads balance</label>
                      <input
                        value={data.payments.metaAdsBalance}
                        onChange={(event) => updatePayments("metaAdsBalance", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">Payments log</h3>
                    <button
                      type="button"
                      onClick={addPaymentEntry}
                      className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                    >
                      + Add payment
                    </button>
                  </div>
                  {data.payments.entries.map((entry, index) => (
                    <div key={`payment-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center">
                      <input
                        value={entry.amount}
                        onChange={(event) => updatePaymentEntry(index, { amount: event.target.value })}
                        placeholder="Amount"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <input
                        value={entry.description}
                        onChange={(event) => updatePaymentEntry(index, { description: event.target.value })}
                        placeholder="Description"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={entry.date ?? ""}
                          onChange={(event) => updatePaymentEntry(index, { date: event.target.value })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removePaymentEntry(index)}
                          className="text-xs font-semibold text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </form>
  );
};
