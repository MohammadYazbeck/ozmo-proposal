"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createMeta, deleteMeta, updateMeta } from "@/lib/meta-actions";
import type {
  MetaAd,
  MetaAdMetrics,
  MetaAdSet,
  MetaCampaign,
  MetaData,
  MetaResults
} from "@/lib/meta-data";
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

const emptyAdMetrics = (): MetaAdMetrics => ({
  reach: "",
  messages: "",
  followers: "",
  amountSpent: "",
  timeDays: ""
});

const emptyAd = (): MetaAd => ({ name: "", metrics: emptyAdMetrics() });
const emptyAdSet = (): MetaAdSet => ({ name: "", ads: [emptyAd()] });
const emptyCampaign = (): MetaCampaign => ({ name: "", adSets: [emptyAdSet()] });

const seedCampaignItems = (data: MetaData): MetaData => {
  if (data.results.campaignItems?.length) {
    return data;
  }
  const hasLegacy = [
    data.results.reach,
    data.results.messages,
    data.results.followers,
    data.results.amountSpent,
    data.results.timeDays
  ].some((value) => value?.trim());
  if (!hasLegacy) {
    return data;
  }
  return {
    ...data,
    results: {
      ...data.results,
      campaignItems: [
        {
          name: "",
          adSets: [
            {
              name: "",
              ads: [
                {
                  name: "",
                  metrics: {
                    reach: data.results.reach,
                    messages: data.results.messages,
                    followers: data.results.followers,
                    amountSpent: data.results.amountSpent,
                    timeDays: data.results.timeDays
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  };
};

export const MetaEditor = ({ mode, meta, initialDataEn, initialDataAr }: MetaEditorProps) => {
  const seededEn = useMemo(() => seedCampaignItems(initialDataEn), [initialDataEn]);
  const seededAr = useMemo(() => seedCampaignItems(initialDataAr), [initialDataAr]);
  const [dataEn, setDataEn] = useState<MetaData>(seededEn);
  const [dataAr, setDataAr] = useState<MetaData>(seededAr);
  const [slug, setSlug] = useState(meta?.slug ?? "");
  const [visibility, setVisibility] = useState({
    showClient: meta?.showClient ?? true,
    showWallet: meta?.showWallet ?? true,
    showResults: meta?.showResults ?? true,
    showPlan: meta?.showPlan ?? true
  });
  const [openCampaigns, setOpenCampaigns] = useState<Record<number, boolean>>({});
  const [openAdSets, setOpenAdSets] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
  const rowBetweenClass = isRtl ? "flex-row-reverse" : "flex-row";

  const updateClient = (field: "name" | "description", value: string) => {
    setData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const updateWallet = (value: string) => {
    setData((prev) => ({
      ...prev,
      walletBalance: value,
      walletUpdatedAt: new Date().toISOString()
    }));
  };

  const updateResults = (field: keyof MetaResults, value: string) => {
    setData((prev) => {
      const next = { ...prev.results, [field]: value };
      if (field === "amountSpent") {
        next.amountSpentUpdatedAt = new Date().toISOString();
      }
      return { ...prev, results: next };
    });
  };

  const setResults = (values: Partial<MetaResults>) => {
    setData((prev) => ({ ...prev, results: { ...prev.results, ...values } }));
  };

  const updateCampaignItems = (
    updater: (items: MetaCampaign[]) => MetaCampaign[],
    updateAmountSpent?: boolean
  ) => {
    setData((prev) => {
      const nextItems = updater(prev.results.campaignItems ?? []);
      return {
        ...prev,
        results: {
          ...prev.results,
          campaignItems: nextItems,
          amountSpentUpdatedAt: updateAmountSpent
            ? new Date().toISOString()
            : prev.results.amountSpentUpdatedAt
        }
      };
    });
  };

  const addCampaign = () => {
    updateCampaignItems((items) => [...items, emptyCampaign()]);
  };

  const removeCampaign = (campaignIndex: number) => {
    updateCampaignItems((items) => items.filter((_, idx) => idx !== campaignIndex));
  };

  const updateCampaignName = (campaignIndex: number, value: string) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) =>
        idx === campaignIndex ? { ...campaign, name: value } : campaign
      )
    );
  };

  const addAdSet = (campaignIndex: number) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) =>
        idx === campaignIndex
          ? { ...campaign, adSets: [...campaign.adSets, emptyAdSet()] }
          : campaign
      )
    );
  };

  const removeAdSet = (campaignIndex: number, adSetIndex: number) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) =>
        idx === campaignIndex
          ? {
              ...campaign,
              adSets: campaign.adSets.filter((_, setIdx) => setIdx !== adSetIndex)
            }
          : campaign
      )
    );
  };

  const updateAdSetName = (campaignIndex: number, adSetIndex: number, value: string) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) => {
        if (idx !== campaignIndex) {
          return campaign;
        }
        const adSets = campaign.adSets.map((adSet, setIdx) =>
          setIdx === adSetIndex ? { ...adSet, name: value } : adSet
        );
        return { ...campaign, adSets };
      })
    );
  };

  const addAd = (campaignIndex: number, adSetIndex: number) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) => {
        if (idx !== campaignIndex) {
          return campaign;
        }
        const adSets = campaign.adSets.map((adSet, setIdx) =>
          setIdx === adSetIndex ? { ...adSet, ads: [...adSet.ads, emptyAd()] } : adSet
        );
        return { ...campaign, adSets };
      })
    );
  };

  const removeAd = (campaignIndex: number, adSetIndex: number, adIndex: number) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) => {
        if (idx !== campaignIndex) {
          return campaign;
        }
        const adSets = campaign.adSets.map((adSet, setIdx) => {
          if (setIdx !== adSetIndex) {
            return adSet;
          }
          return { ...adSet, ads: adSet.ads.filter((_, aIdx) => aIdx !== adIndex) };
        });
        return { ...campaign, adSets };
      })
    );
  };

  const updateAdName = (
    campaignIndex: number,
    adSetIndex: number,
    adIndex: number,
    value: string
  ) => {
    updateCampaignItems((items) =>
      items.map((campaign, idx) => {
        if (idx !== campaignIndex) {
          return campaign;
        }
        const adSets = campaign.adSets.map((adSet, setIdx) => {
          if (setIdx !== adSetIndex) {
            return adSet;
          }
          const ads = adSet.ads.map((ad, aIdx) =>
            aIdx === adIndex ? { ...ad, name: value } : ad
          );
          return { ...adSet, ads };
        });
        return { ...campaign, adSets };
      })
    );
  };

  const updateAdMetric = (
    campaignIndex: number,
    adSetIndex: number,
    adIndex: number,
    field: keyof MetaAdMetrics,
    value: string
  ) => {
    updateCampaignItems(
      (items) =>
        items.map((campaign, idx) => {
          if (idx !== campaignIndex) {
            return campaign;
          }
          const adSets = campaign.adSets.map((adSet, setIdx) => {
            if (setIdx !== adSetIndex) {
              return adSet;
            }
            const ads = adSet.ads.map((ad, aIdx) => {
              if (aIdx !== adIndex) {
                return ad;
              }
              return { ...ad, metrics: { ...ad.metrics, [field]: value } };
            });
            return { ...adSet, ads };
          });
          return { ...campaign, adSets };
        }),
      field === "amountSpent"
    );
  };

  const parseMetric = (value: string) => {
    const cleaned = value.replace(/[, ]/g, "");
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : 0;
  };

  const sumMetrics = (metricsList: MetaAdMetrics[]) =>
    metricsList.reduce(
      (acc, metrics) => ({
        reach: acc.reach + parseMetric(metrics.reach),
        messages: acc.messages + parseMetric(metrics.messages),
        followers: acc.followers + parseMetric(metrics.followers),
        amountSpent: acc.amountSpent + parseMetric(metrics.amountSpent),
        timeDays: acc.timeDays + parseMetric(metrics.timeDays)
      }),
      { reach: 0, messages: 0, followers: 0, amountSpent: 0, timeDays: 0 }
    );

  const sumAdSetMetrics = (adSet: MetaAdSet) =>
    sumMetrics(adSet.ads.map((ad) => ad.metrics));

  const sumCampaignMetrics = (campaign: MetaCampaign) =>
    sumMetrics(campaign.adSets.flatMap((adSet) => adSet.ads.map((ad) => ad.metrics)));

  const campaignItems = data.results.campaignItems ?? [];
  const totalCampaigns = campaignItems.length;
  const totalAdSets = campaignItems.reduce((acc, campaign) => acc + campaign.adSets.length, 0);
  const totalAds = campaignItems.reduce(
    (acc, campaign) =>
      acc + campaign.adSets.reduce((inner, adSet) => inner + adSet.ads.length, 0),
    0
  );
  const totalMetrics = sumMetrics(
    campaignItems
      .flatMap((campaign) => campaign.adSets)
      .flatMap((adSet) => adSet.ads)
      .map((ad) => ad.metrics)
  );

  const formatNumber = (value: number) =>
    value.toLocaleString(activeLang === "ar" ? "ar" : "en");

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

  const removeUploadedFile = async (url: string) => {
    try {
      await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
    } catch {
      // ignore cleanup errors
    }
  };

  const uploadResultImage = async (file: File) => {
    setUploadError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to upload image.");
      }
      const url = payload?.url;
      if (!url || typeof url !== "string") {
        throw new Error("Upload failed.");
      }
      const previous = data.results.mediaUrl;
      setResults({ mediaUrl: url });
      if (previous && previous !== url) {
        void removeUploadedFile(previous);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeResultImage = async () => {
    const existing = data.results.mediaUrl;
    if (!existing) {
      return;
    }
    setResults({ mediaUrl: "" });
    await removeUploadedFile(existing);
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
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Total results
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-orange-200/70 bg-orange-50 px-2 py-1 text-orange-700">
                        {formatNumber(totalCampaigns)} campaigns
                      </span>
                      <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2 py-1 text-amber-700">
                        {formatNumber(totalAdSets)} ad sets
                      </span>
                      <span className="rounded-full border border-sky-200/70 bg-sky-50 px-2 py-1 text-sky-700">
                        {formatNumber(totalAds)} ads
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: "Reach", value: formatNumber(totalMetrics.reach) },
                      { label: "Messages", value: formatNumber(totalMetrics.messages) },
                      { label: "Campaigns", value: formatNumber(totalCampaigns) },
                      { label: "Followers earned", value: formatNumber(totalMetrics.followers) },
                      {
                        label: "Amount spent (USD)",
                        value: formatNumber(totalMetrics.amountSpent)
                      },
                      { label: "Time (days)", value: formatNumber(totalMetrics.timeDays) }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="text-xs text-slate-500">{item.label}</div>
                        <div className="text-base font-semibold text-slate-900">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {campaignItems.map((campaign, campaignIndex) => {
                    const campaignTotals = sumCampaignMetrics(campaign);
                    return (
                      <div
                        key={`campaign-${campaignIndex}`}
                        className="rounded-xl border border-orange-200/70 bg-orange-50/70 p-4 shadow-sm"
                      >
                        <div
                          className={`flex flex-wrap items-start justify-between gap-3 ${rowBetweenClass}`}
                        >
                          <div className="min-w-[220px] flex-1">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Campaign name
                            </label>
                            <input
                              value={campaign.name}
                              onChange={(event) => updateCampaignName(campaignIndex, event.target.value)}
                              placeholder={`Campaign ${campaignIndex + 1}`}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>Reach: {formatNumber(campaignTotals.reach)}</span>
                            <span>Messages: {formatNumber(campaignTotals.messages)}</span>
                            <span>Followers: {formatNumber(campaignTotals.followers)}</span>
                            <span>Spent: {formatNumber(campaignTotals.amountSpent)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCampaigns((prev) => ({
                                  ...prev,
                                  [campaignIndex]: !(prev[campaignIndex] ?? true)
                                }))
                              }
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-orange hover:text-brand-orange"
                            >
                              {openCampaigns[campaignIndex] ?? true ? "Collapse" : "Expand"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCampaign(campaignIndex)}
                              className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                            >
                              Remove campaign
                            </button>
                          </div>
                        </div>

                        <div
                          className={`mt-4 space-y-4 overflow-hidden border-t border-orange-200/70 pt-4 ${
                            openCampaigns[campaignIndex] ?? true
                              ? "max-h-[5000px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          {campaign.adSets.map((adSet, adSetIndex) => {
                            const adSetTotals = sumAdSetMetrics(adSet);
                            const adSetKey = `${campaignIndex}-${adSetIndex}`;
                            return (
                              <div
                                key={`campaign-${campaignIndex}-adset-${adSetIndex}`}
                                className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4"
                              >
                                <div className={`flex flex-wrap items-start justify-between gap-3 ${rowBetweenClass}`}>
                                  <div className="min-w-[200px] flex-1">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                      Ad set name
                                    </label>
                                    <input
                                      value={adSet.name}
                                      onChange={(event) =>
                                        updateAdSetName(
                                          campaignIndex,
                                          adSetIndex,
                                          event.target.value
                                        )
                                      }
                                      placeholder={`Ad set ${adSetIndex + 1}`}
                                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                    <span>Reach: {formatNumber(adSetTotals.reach)}</span>
                                    <span>Messages: {formatNumber(adSetTotals.messages)}</span>
                                    <span>Followers: {formatNumber(adSetTotals.followers)}</span>
                                    <span>Spent: {formatNumber(adSetTotals.amountSpent)}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenAdSets((prev) => ({
                                          ...prev,
                                          [adSetKey]: !(prev[adSetKey] ?? true)
                                        }))
                                      }
                                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-orange hover:text-brand-orange"
                                    >
                                      {openAdSets[adSetKey] ?? true ? "Collapse" : "Expand"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeAdSet(campaignIndex, adSetIndex)}
                                      className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                                    >
                                      Remove ad set
                                    </button>
                                  </div>
                                </div>

                                <div
                                  className={`mt-4 space-y-3 overflow-hidden border-t border-amber-200/70 pt-4 ${
                                    openAdSets[adSetKey] ?? true
                                      ? "max-h-[4000px] opacity-100"
                                      : "max-h-0 opacity-0"
                                  }`}
                                >
                                  {adSet.ads.map((ad, adIndex) => (
                                    <div
                                      key={`campaign-${campaignIndex}-adset-${adSetIndex}-ad-${adIndex}`}
                                      className="rounded-lg border border-sky-200/70 bg-sky-50/70 p-3"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-[200px] flex-1">
                                          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Ad name
                                          </label>
                                          <input
                                            value={ad.name}
                                            onChange={(event) =>
                                              updateAdName(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                event.target.value
                                              )
                                            }
                                            placeholder={`Ad ${adIndex + 1}`}
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeAd(campaignIndex, adSetIndex, adIndex)
                                          }
                                          className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                                        >
                                          Remove ad
                                        </button>
                                      </div>
                                      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                          <label className="text-sm font-medium text-slate-700">
                                            Reach
                                          </label>
                                          <input
                                            value={ad.metrics.reach}
                                            onChange={(event) =>
                                              updateAdMetric(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                "reach",
                                                event.target.value
                                              )
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-slate-700">
                                            Messages
                                          </label>
                                          <input
                                            value={ad.metrics.messages}
                                            onChange={(event) =>
                                              updateAdMetric(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                "messages",
                                                event.target.value
                                              )
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-slate-700">
                                            Followers earned
                                          </label>
                                          <input
                                            value={ad.metrics.followers}
                                            onChange={(event) =>
                                              updateAdMetric(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                "followers",
                                                event.target.value
                                              )
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-slate-700">
                                            Amount spent (USD)
                                          </label>
                                          <input
                                            value={ad.metrics.amountSpent}
                                            onChange={(event) =>
                                              updateAdMetric(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                "amountSpent",
                                                event.target.value
                                              )
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-slate-700">
                                            Time (days)
                                          </label>
                                          <input
                                            value={ad.metrics.timeDays}
                                            onChange={(event) =>
                                              updateAdMetric(
                                                campaignIndex,
                                                adSetIndex,
                                                adIndex,
                                                "timeDays",
                                                event.target.value
                                              )
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => addAd(campaignIndex, adSetIndex)}
                                    className="rounded-full border border-brand-orange/40 bg-white px-3 py-1 text-xs font-semibold text-brand-orange transition hover:border-brand-orange hover:bg-orange-50"
                                  >
                                    + Add ad
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => addAdSet(campaignIndex)}
                            className="rounded-full border border-brand-orange/40 bg-white px-3 py-1 text-xs font-semibold text-brand-orange transition hover:border-brand-orange hover:bg-orange-50"
                          >
                            + Add ad set
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addCampaign}
                    className="rounded-full border border-brand-orange/40 bg-white px-3 py-1 text-xs font-semibold text-brand-orange transition hover:border-brand-orange hover:bg-orange-50"
                  >
                    + Add campaign
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Image button label</label>
                    <input
                      value={data.results.mediaLabel}
                      onChange={(event) => updateResults("mediaLabel", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Link button label</label>
                    <input
                      value={data.results.linkLabel}
                      onChange={(event) => updateResults("linkLabel", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Image file</label>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) {
                            return;
                          }
                          await uploadResultImage(file);
                          event.target.value = "";
                        }}
                        className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                      />
                      {data.results.mediaUrl ? (
                        <>
                          <a
                            href={data.results.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={removeResultImage}
                            className="text-xs font-semibold text-slate-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </>
                      ) : null}
                      {isUploading ? <span className="text-xs text-slate-500">Uploading...</span> : null}
                    </div>
                    {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Link URL</label>
                    <input
                      value={data.results.linkUrl}
                      onChange={(event) => updateResults("linkUrl", event.target.value)}
                      placeholder="https://"
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
