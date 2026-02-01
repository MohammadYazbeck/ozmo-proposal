"use client";

import { useEffect, useMemo, useState } from "react";
import type { MetaData } from "@/lib/meta-data";

type LangKey = "en" | "ar";

type PublicMetaProps = {
  meta: {
    slug: string;
    showClient: boolean;
    showWallet: boolean;
    showResults: boolean;
    showPlan: boolean;
  };
  dataEn: MetaData;
  dataAr: MetaData;
  hasEn: boolean;
  hasAr: boolean;
};

const labelsByLang: Record<
  LangKey,
  {
    client: string;
    wallet: string;
    results: string;
    plan: string;
    orderPlan: string;
    reach: string;
    reachUnit: string;
    messages: string;
    campaigns: string;
    followers: string;
    amountSpent: string;
    timeDays: string;
  }
> = {
  en: {
    client: "Client",
    wallet: "Wallet balance",
    results: "Campaign results",
    plan: "Suggested plan",
    orderPlan: "Order this plan",
    reach: "Reach",
    reachUnit: "views",
    messages: "Messages",
    campaigns: "Campaigns",
    followers: "Followers earned",
    amountSpent: "Amount spent",
    timeDays: "Time (days)",
  },
  ar: {
    client: "العميل",
    wallet: "رصيد المحفظة",
    results: "نتائج الحملات",
    plan: "الخطة المقترحة",
    orderPlan: "اطلب هذه الخطة",
    reach: "الوصول",
    reachUnit: "مشاهدة",
    messages: "الرسائل",
    campaigns: "عدد الحملات",
    followers: "متابعون جدد",
    amountSpent: "المبلغ المصروف",
    timeDays: "المدة (أيام)",
  },
};

const cardClass =
  "relative isolate z-0 overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-md";
const sectionClass = "relative border-t border-white/10 pt-12";
const floatingButtonClass =
  "group flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-100 backdrop-blur transition hover:border-brand-orange/50 hover:bg-white/10";

export const PublicMeta = ({
  meta,
  dataEn,
  dataAr,
  hasEn,
  hasAr,
}: PublicMetaProps) => {
  const singleLanguage = !hasEn || !hasAr;
  const defaultLang: LangKey = hasEn ? "en" : "ar";
  const [activeLang, setActiveLang] = useState<LangKey>(defaultLang);
  const currentLang = singleLanguage ? defaultLang : activeLang;

  const data = currentLang === "ar" ? dataAr : dataEn;
  const isRtl = currentLang === "ar";
  const labels = labelsByLang[currentLang];
  const textAlign = isRtl ? "text-right" : "text-left";
  const rowClass = isRtl
    ? "flex-row-reverse justify-end"
    : "flex-row justify-start";
  const rowBetweenClass = isRtl ? "flex-row-reverse" : "flex-row";
  const suffixClass = isRtl ? "mr-2" : "ml-2";
  const phoneHref = "tel:+963982475910";
  const whatsappBase = "https://wa.me/+963982475910";
  const instagramHref = "https://www.instagram.com/ozmoagency/";

  const planPoints = useMemo(
    () => data.plan.points.filter((point) => point.trim()),
    [data.plan.points]
  );
  const whatsappPlanMessage = useMemo(() => {
    const title = data.plan.title || labels.plan;
    const points = planPoints.length
      ? `\n${planPoints.map((p) => `- ${p}`).join("\n")}`
      : "";
    if (currentLang === "ar") {
      return `مرحبًا، أود طلب الخطة المقترحة.\nالعميل: ${
        data.client.name || "-"
      }\nالعنوان: ${title}${points}`;
    }
    return `Hello, I'd like to order the suggested plan.\nClient: ${
      data.client.name || "-"
    }\nTitle: ${title}${points}`;
  }, [currentLang, data.client.name, data.plan.title, labels.plan, planPoints]);
  const whatsappPlanHref = `${whatsappBase}?text=${encodeURIComponent(
    whatsappPlanMessage
  )}`;

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      const stored = window.localStorage.getItem(`ozmo:meta:lang:${meta.slug}`);
      if (stored === "en" || stored === "ar") {
        setActiveLang(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, [meta.slug, singleLanguage]);

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      window.localStorage.setItem(`ozmo:meta:lang:${meta.slug}`, currentLang);
    } catch {
      // ignore storage errors
    }
  }, [currentLang, meta.slug, singleLanguage]);

  useEffect(() => {
    const html = document.documentElement;
    const prevDir = html.getAttribute("dir") ?? "ltr";
    const prevLang = html.getAttribute("lang") ?? "en";
    html.setAttribute("dir", isRtl ? "rtl" : "ltr");
    html.setAttribute("lang", currentLang === "ar" ? "ar" : "en");
    return () => {
      html.setAttribute("dir", prevDir);
      html.setAttribute("lang", prevLang);
    };
  }, [currentLang, isRtl]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)] opacity-70 animate-glow" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-orange/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/3 left-8 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl animate-float-slow" />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        lang={currentLang === "ar" ? "ar" : "en"}
        className={`relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-8 ${
          isRtl ? "font-arabic text-right" : "font-sans text-left"
        }`}
      >
        <header className="mb-12 flex w-full items-center gap-4">
          <div className={`flex w-full items-center gap-2 ${rowClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-14 object-contain p-2"
            />
            <div className="leading-tight">
              <div className="font-sans text-4xl font-semibold text-[#f97316]">
                OZMO
              </div>
            </div>
          </div>
          {hasEn && hasAr ? (
            <div
              dir="ltr"
              className="relative inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1 shadow-[0_0_30px_rgba(249,115,22,0.12)] backdrop-blur"
            >
              <span
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.4)] transition-transform duration-300 ${
                  currentLang === "ar" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`relative z-10 rounded-full px-5 py-2 text-xs font-semibold transition ${
                  currentLang === "en"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={currentLang === "en"}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("ar")}
                className={`relative z-10 rounded-full px-5 py-2 text-xs font-semibold font-arabic transition ${
                  currentLang === "ar"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={currentLang === "ar"}
              >
                العربية
              </button>
            </div>
          ) : null}
        </header>

        <div key={currentLang} className="space-y-16">
          {meta.showClient ? (
            <section className={`${textAlign}`}>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {labels.client}
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
                {data.client.name}
              </h1>
              <div
                className={`mt-2 h-1 w-20 rounded-full bg-brand-orange ${
                  isRtl ? "ml-auto" : ""
                }`}
              />
              <p className="mt-4 max-w-2xl text-base text-slate-300">
                {data.client.description}
              </p>
            </section>
          ) : null}

          {meta.showWallet ? (
            <section className={`${sectionClass} ${textAlign}`}>
              <div className={cardClass}>
                <div className="relative z-10 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {labels.wallet}
                  </p>
                  <h2 className="text-4xl font-semibold text-brand-orange">
                    {data.walletBalance ? `$${data.walletBalance}` : "--"}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    USD
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {meta.showResults ? (
            <section className={`${sectionClass} ${textAlign}`}>
              <h2 className="text-2xl font-semibold text-white">
                {labels.results}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: labels.reach,
                    value: data.results.reach,
                    suffix: labels.reachUnit,
                  },
                  { label: labels.messages, value: data.results.messages },
                  { label: labels.campaigns, value: data.results.campaigns },
                  { label: labels.followers, value: data.results.followers },
                  {
                    label: labels.amountSpent,
                    value: data.results.amountSpent,
                    suffix: "USD",
                  },
                  { label: labels.timeDays, value: data.results.timeDays },
                ].map((item) => (
                  <div key={item.label} className={cardClass}>
                    <div className="relative z-10 space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        {item.value || "--"}
                        {item.suffix ? (
                          <span
                            className={`${suffixClass} text-xs text-slate-500`}
                          >
                            {item.suffix}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {meta.showPlan ? (
            <section className={`${sectionClass} ${textAlign}`}>
              <div className={cardClass}>
                <div className="relative z-10 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">
                    {labels.plan}
                  </h2>
                  <p className="text-xl font-semibold text-brand-orange">
                    {data.plan.title || "--"}
                  </p>
                  {planPoints.length ? (
                    <ul
                      dir={isRtl ? "rtl" : "ltr"}
                      className={`space-y-2 text-slate-200 ${textAlign}`}
                    >
                      {planPoints.map((point, index) => (
                        <li
                          key={`plan-point-${index}`}
                          className={`flex items-start gap-2 `}
                        >
                          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <a
                    href={whatsappPlanHref}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-brand-orange/40 ${rowBetweenClass}`}
                  >
                    {labels.orderPlan}
                  </a>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <div
        className={`fixed bottom-6 z-20 flex flex-col gap-3 ${
          isRtl ? "left-6" : "right-6"
        }`}
      >
        <a href={phoneHref} className={floatingButtonClass} aria-label="Call">
          <svg
            aria-hidden="true"
            className="h-6 w-6 text-brand-orange"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v2a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h2a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L8.1 10.1a16 16 0 0 0 5.8 5.8l.67-.67a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6a2 2 0 0 1 1.72 2.04Z" />
          </svg>
        </a>
        <a
          href={whatsappPlanHref}
          className={floatingButtonClass}
          aria-label="WhatsApp"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-6 w-6 text-brand-orange"
            fill="currentColor"
            aria-label="WhatsApp"
          >
            <path d="M12.04 0C5.39 0 .16 5.33.16 11.9c0 2.09.55 4.13 1.59 5.94L0 24l6.31-1.65a11.86 11.86 0 0 0 5.69 1.45h.01c6.65 0 11.99-5.33 11.99-11.9A11.86 11.86 0 0 0 12.04 0zm0 21.79h-.01a9.85 9.85 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.84 9.84 0 1 1 8.38 4.63zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
          </svg>
        </a>
        <a
          href={instagramHref}
          className={floatingButtonClass}
          aria-label="Instagram"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6 text-brand-orange"
            fill="currentColor"
          >
            <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zm5.25-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
          </svg>
        </a>
      </div>
    </div>
  );
};
