"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProposalData } from "@/lib/proposal-data";
import Link from "next/link";

type LangKey = "en" | "ar";

type PublicProposalProps = {
  proposal: {
    slug: string;
    showVision: boolean;
    showGoals: boolean;
    showNoticed: boolean;
    showWorkPlan: boolean;
    showPricing: boolean;
    showNotes: boolean;
    expiresAt?: string | null;
  };
  dataEn: ProposalData;
  dataAr: ProposalData;
  hasEn: boolean;
  hasAr: boolean;
};

const labelsByLang: Record<
  LangKey,
  {
    vision: string;
    goals: string;
    workPlan: string;
    pricing: string;
    notes: string;
    package: string;
    offerEndsIn: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    noticedTitle: string;
    noticedSubtitle: string;
    metaLabel: string;
  }
> = {
  en: {
    vision: "Vision",
    goals: "Goals",
    workPlan: "Work Plan",
    pricing: "Pricing",
    notes: "Notes",
    package: "Package",
    offerEndsIn: "Offer ends in",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    noticedTitle: "What we have noticed",
    noticedSubtitle: "Key observations after reviewing the account.",
    metaLabel: "Proposal",
  },
  ar: {
    vision: "الرؤية",
    goals: "الأهداف",
    workPlan: "خطة العمل",
    pricing: "الباقات",
    notes: "ملاحظات",
    package: "باقة",
    offerEndsIn: "ينتهي العرض خلال",
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",
    noticedTitle: "ما لاحظناه",
    noticedSubtitle: "أهم الملاحظات بعد مراجعة الحساب.",
    metaLabel: "المقترح",
  },
};

const parseExpiresAt = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const cardClass =
  "relative isolate z-0 overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.35),transparent_60%)] before:opacity-80 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[linear-gradient(140deg,rgba(0,0,0,0.65),rgba(0,0,0,0.25))] after:content-['']";

export const PublicProposal = ({
  proposal,
  dataEn,
  dataAr,
  hasEn,
  hasAr,
}: PublicProposalProps) => {
  const singleLanguage = !hasEn || !hasAr;
  const defaultLang: LangKey = hasEn ? "en" : "ar";
  const [activeLang, setActiveLang] = useState<LangKey>(defaultLang);
  const currentLang = singleLanguage ? defaultLang : activeLang;

  const data = currentLang === "ar" ? dataAr : dataEn;
  const isRtl = currentLang === "ar";
  const labels = labelsByLang[currentLang];

  const goals = useMemo(
    () => data.goals.filter((goal) => goal.trim()),
    [data.goals]
  );
  const noticed = useMemo(
    () => data.noticed.filter((item) => item.trim()),
    [data.noticed]
  );
  const pricing = useMemo(() => data.pricing.slice(0, 3), [data.pricing]);
  const expiresAtDate = useMemo(
    () => parseExpiresAt(proposal.expiresAt),
    [proposal.expiresAt]
  );
  const notesHtml = data.notesHtml.trim();
  const visionHtml = data.visionHtml.trim();

  const textAlign = isRtl ? "text-right" : "text-left";
  const alignClass = isRtl ? "items-end text-right" : "items-start text-left";
  const rowClass = isRtl
    ? "flex-row-reverse justify-end"
    : "flex-row justify-start";
  const workPlanRowClass = isRtl ? "md:flex-row-reverse" : "md:flex-row";
  const workPlanAlignClass = isRtl ? "md:items-end" : "md:items-start";
  const listDotClass = `flex items-start gap-2 `;
  const listGoalClass = `flex items-start gap-3 `;
  const sectionClass =
    "relative scroll-mt-24 pt-12 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent";
  const phoneHref = "tel:+963982475910";
  const whatsappHref = "https://wa.me/+963982475910";
  const floatingButtonClass =
    "group flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-100 backdrop-blur transition hover:border-brand-orange/50 hover:bg-white/10";
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const togglePlan = () => {
    setIsPlanOpen((prev) => !prev);
  };
  const planSpacerClass = isRtl ? "mr-auto" : "ml-auto";
  const planHeaderClass = isRtl
    ? "flex-row-reverse text-right"
    : "flex-row text-left";
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(() => {
    if (!expiresAtDate) {
      return null;
    }
    return Math.max(0, expiresAtDate.getTime() - Date.now());
  });
  const countdown = useMemo(() => {
    if (!timeLeftMs || timeLeftMs <= 0) {
      return null;
    }
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad2 = (value: number) => String(value).padStart(2, "0");
    return {
      days: String(days),
      hours: pad2(hours),
      minutes: pad2(minutes),
      seconds: pad2(seconds),
    };
  }, [timeLeftMs]);

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      const stored = window.localStorage.getItem(
        `ozmo:proposal:lang:${proposal.slug}`
      );
      if (stored === "en" || stored === "ar") {
        setActiveLang(stored);
      }
    } catch {
      // ignore storage access errors
    }
  }, [proposal.slug, singleLanguage]);

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      window.localStorage.setItem(
        `ozmo:proposal:lang:${proposal.slug}`,
        currentLang
      );
    } catch {
      // ignore storage access errors
    }
  }, [currentLang, proposal.slug, singleLanguage]);

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

  useEffect(() => {
    if (!expiresAtDate) {
      setTimeLeftMs(null);
      return;
    }
    const tick = () => {
      const diff = expiresAtDate.getTime() - Date.now();
      setTimeLeftMs(diff > 0 ? diff : 0);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAtDate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)] opacity-70 animate-glow" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-orange/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/3 left-8 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl animate-float-slow" />
      <div
        dir={isRtl ? "rtl" : "ltr"}
        lang={currentLang === "ar" ? "ar" : "en"}
        className={`relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-8 ${
          isRtl ? "font-arabic text-right" : "font-sans text-left"
        }`}
      >
        <header className="flex w-full mb-14 items-center gap-4">
          <div className={`flex w-full items-center gap-2 ${rowClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-14 bg-transparent object-contain p-2 md:h-14 md:w-14"
            />
            <div className="leading-tight">
              <div className="font-sans text-4xl font-semibold text-[#f97316] md:text-4xl">
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
        <div key={currentLang} className="mt-10 space-y-20">
          <section
            className={`flex flex-col gap-4 animate-fade-up text-center`}
          >
            <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_25px_rgba(249,115,22,0.45)] md:text-5xl">
              {data.hero.title}
            </h1>
            <p className="text-lg font-medium text-brand-orange ">
              {data.hero.subtitle}
            </p>
            <p className="text-base text-slate-200 md:text-lg">
              {data.hero.introduction}
            </p>
          </section>

          <section className={`${sectionClass} space-y-6`}>
            <div className="grid gap-6 lg:grid-cols-2">
              {proposal.showVision && visionHtml ? (
                <div
                  className={`${cardClass} animate-fade-up`}
                  style={{ animationDelay: "180ms" }}
                >
                  <div className="relative z-10">
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {labels.vision}
                    </h2>
                    <div
                      className={`prose prose-invert mt-3 max-w-none ${textAlign}`}
                      dangerouslySetInnerHTML={{ __html: visionHtml }}
                    />
                  </div>
                </div>
              ) : null}

              {proposal.showGoals ? (
                <div
                  className={`${cardClass} animate-fade-up`}
                  style={{ animationDelay: "240ms" }}
                >
                  <div className="relative z-10">
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {labels.goals}
                    </h2>
                    <ul className={`mt-4 space-y-3 text-slate-200`}>
                      {goals.map((goal, goalIndex) => (
                        <li key={`goal-${goalIndex}`} className={listGoalClass}>
                          <span
                            className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-orange"
                            aria-hidden="true"
                          />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {proposal.showNoticed && noticed.length ? (
            <section className={`${sectionClass} space-y-6`}>
              <div className={cardClass}>
                <div className="relative z-10">
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    {labels.noticedTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {labels.noticedSubtitle}
                  </p>
                  <ul className={`mt-4 space-y-3 text-slate-200 ${textAlign}`}>
                    {noticed.map((item, index) => (
                      <li key={`noticed-${index}`} className={listGoalClass}>
                        <span
                          className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-orange"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {proposal.showWorkPlan ? (
            <section className={`${sectionClass} space-y-6`}>
              <button
                type="button"
                onClick={togglePlan}
                aria-expanded={isPlanOpen}
                aria-controls="work-plan-content"
                className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-brand-orange/40 `}
              >
                <span
                  className={`text-2xl font-semibold tracking-tight text-white`}
                >
                  {labels.workPlan}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition ${planSpacerClass} ${
                    isPlanOpen
                      ? "rotate-180 border-brand-orange/40 text-brand-orange"
                      : "hover:border-white/25"
                  }`}
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 8l5 5 5-5" />
                  </svg>
                </span>
              </button>
              <div
                id="work-plan-content"
                className={`grid gap-4 overflow-hidden transition-all duration-300 ${
                  isPlanOpen
                    ? "max-h-[4000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
                aria-hidden={!isPlanOpen}
              >
                {data.workPlan.map((block, blockIndex) => (
                  <div key={`work-${blockIndex}`} className={cardClass}>
                    <div className="relative z-10">
                      <div
                        dir={`${isRtl ? "rtl" : "ltr"}`}
                        className={`flex flex-col gap-3 md:gap-6 ${workPlanRowClass} ${workPlanAlignClass}`}
                      >
                        <div className="text-3xl font-semibold text-brand-orange">
                          {block.number}
                        </div>
                        <div className={`space-y-2 ${textAlign}`}>
                          {block.heading ? (
                            <h3 className="text-xl mt-1 font-semibold tracking-tight text-white">
                              {block.heading}
                            </h3>
                          ) : null}
                          {block.leadText ? (
                            <p className="text-slate-300">{block.leadText}</p>
                          ) : null}
                        </div>
                      </div>
                      <ul
                        className={`mt-4 space-y-2 text-slate-200 ${textAlign}`}
                      >
                        {block.bullets
                          .filter((bullet) => bullet.text.trim())
                          .map((bullet, bulletIndex) => (
                            <li
                              key={`bullet-${blockIndex}-${bulletIndex}`}
                              className={`${listDotClass} ${rowClass}`}
                            >
                              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />
                              <span
                                className={`rounded px-1 ${textAlign} ${
                                  bullet.highlightColor
                                    ? "text-slate-900"
                                    : "text-slate-200"
                                }`}
                                style={
                                  bullet.highlightColor
                                    ? { backgroundColor: bullet.highlightColor }
                                    : undefined
                                }
                              >
                                {bullet.text}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {proposal.showPricing ? (
            <section className={`${sectionClass} space-y-6`}>
              <h2
                className={`text-2xl font-semibold tracking-tight text-white ${textAlign}`}
              >
                {labels.pricing}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {pricing.map((pkg, pkgIndex) => (
                  <div key={`pricing-${pkgIndex}`} className={cardClass}>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {pkg.name || `${labels.package} ${pkgIndex + 1}`}
                      </h3>
                      <p className="mt-2 text-2xl font-semibold text-brand-orange">
                        {pkg.price || "--"}
                      </p>
                      <ul
                        className={`mt-4 space-y-2 text-sm text-slate-300 ${textAlign}`}
                      >
                        {pkg.points
                          .filter((point) => point.trim())
                          .map((point, pointIndex) => (
                            <li
                              key={`point-${pkgIndex}-${pointIndex}`}
                              className={listDotClass}
                            >
                              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />
                              <span>{point}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              {expiresAtDate && countdown ? (
                <div className={`mt-8 text-center`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {labels.offerEndsIn}
                  </p>
                  <div className={`mt-4 flex flex-wrap gap-3 justify-center`}>
                    {[
                      { label: labels.days, value: countdown.days },
                      { label: labels.hours, value: countdown.hours },
                      { label: labels.minutes, value: countdown.minutes },
                      { label: labels.seconds, value: countdown.seconds },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className="flex min-w-[84px] flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur"
                      >
                        <span className="text-xl font-semibold text-white">
                          {unit.value}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {proposal.showNotes && notesHtml ? (
            <section className={`${sectionClass} space-y-6`}>
              <div className={cardClass}>
                <div className="relative z-10">
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    {labels.notes}
                  </h2>
                  <div
                    className={`prose prose-invert mt-3 max-w-none ${textAlign}`}
                    dangerouslySetInnerHTML={{ __html: notesHtml }}
                  />
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
          href={whatsappHref}
          className={floatingButtonClass}
          aria-label="WhatsApp"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="text-brand-orange w-6 h-6"
            fill="currentColor"
            aria-label="WhatsApp"
          >
            <path d="M12.04 0C5.39 0 .16 5.33.16 11.9c0 2.09.55 4.13 1.59 5.94L0 24l6.31-1.65a11.86 11.86 0 0 0 5.69 1.45h.01c6.65 0 11.99-5.33 11.99-11.9A11.86 11.86 0 0 0 12.04 0zm0 21.79h-.01a9.85 9.85 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.84 9.84 0 1 1 8.38 4.63zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
          </svg>
        </a>
      </div>
    </div>
  );
};
