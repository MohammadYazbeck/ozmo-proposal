"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProposalData } from "@/lib/proposal-data";

type LangKey = "en" | "ar";

type PublicProposalProps = {
  proposal: {
    slug: string;
    showVision: boolean;
    showGoals: boolean;
    showWorkPlan: boolean;
    showPricing: boolean;
    showNotes: boolean;
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
    metaLabel: "Proposal",
  },
  ar: {
    vision: "الرؤية",
    goals: "الأهداف",
    workPlan: "خطة العمل",
    pricing: "الباقات",
    notes: "ملاحظات",
    package: "باقة",
    metaLabel: "المقترح",
  },
};

const cardClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:bg-black/45 after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand-orange/60 after:to-transparent after:opacity-50";

export const PublicProposal = ({
  proposal,
  dataEn,
  dataAr,
  hasEn,
  hasAr,
}: PublicProposalProps) => {
  const singleLanguage = !hasEn || !hasAr;
  const defaultLang: LangKey = hasAr ? "ar" : "en";
  const [activeLang, setActiveLang] = useState<LangKey>(defaultLang);
  const currentLang = singleLanguage ? defaultLang : activeLang;

  const data = currentLang === "ar" ? dataAr : dataEn;
  const isRtl = currentLang === "ar";
  const labels = labelsByLang[currentLang];

  const goals = useMemo(
    () => data.goals.filter((goal) => goal.trim()),
    [data.goals]
  );
  const pricing = useMemo(() => data.pricing.slice(0, 3), [data.pricing]);
  const notesHtml = data.notesHtml.trim();
  const visionHtml = data.visionHtml.trim();

  const textAlign = isRtl ? "text-right" : "text-left";
  const alignClass = isRtl
    ? "items-center text-center"
    : "items-center text-center";
  const rowClass = isRtl
    ? "flex-row-reverse justify-end"
    : "flex-row justify-start";
  const workPlanRowClass = isRtl ? "md:flex-row-reverse" : "md:flex-row";
  const listDotClass = `flex items-start gap-2`;
  const listGoalClass = `flex items-start gap-3 `;
  const sectionClass =
    "relative scroll-mt-24 pt-12 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent";
  const phoneHref = "tel:+963982475910";
  const whatsappHref = "https://wa.me/+963982475910";
  const floatingButtonClass =
    "group flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-100 backdrop-blur transition hover:border-brand-orange/50 hover:bg-white/10";

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
            className={`flex flex-col gap-4 animate-fade-up ${alignClass}`}
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
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    {labels.vision}
                  </h2>
                  <div
                    className={`prose prose-invert mt-3 max-w-none ${textAlign}`}
                    dangerouslySetInnerHTML={{ __html: visionHtml }}
                  />
                </div>
              ) : null}

              {proposal.showGoals ? (
                <div
                  className={`${cardClass} animate-fade-up`}
                  style={{ animationDelay: "240ms" }}
                >
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    {labels.goals}
                  </h2>
                  <ul className={`mt-4 space-y-3 text-slate-200 ${textAlign}`}>
                    {goals.map((goal, goalIndex) => (
                      <li key={`goal-${goalIndex}`} className={listGoalClass}>
                        <span className="flex-shrink-0">🎯</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          {proposal.showWorkPlan ? (
            <section className={`${sectionClass} space-y-6`}>
              <h2
                className={`text-2xl font-semibold tracking-tight text-white ${textAlign}`}
              >
                {labels.workPlan}
              </h2>
              <div className="grid gap-4">
                {data.workPlan.map((block, blockIndex) => (
                  <div key={`work-${blockIndex}`} className={cardClass}>
                    <div
                      dir={`${isRtl ? "rtl" : "ltr"}`}
                      className={`flex  gap-3 md:items-start md:gap-6 flex-row ${textAlign}`}
                    >
                      <div className="text-3xl font-semibold text-brand-orange">
                        {block.number}
                      </div>
                      <div className={`space-y-2 ${textAlign}`}>
                        {block.heading ? (
                          <h3 className="text-xl font-semibold tracking-tight text-white">
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
                            className={listDotClass}
                          >
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />
                            <span
                              className={`rounded px-1 ${
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
                ))}
              </div>
            </section>
          ) : null}

          {proposal.showNotes && notesHtml ? (
            <section className={`${sectionClass} space-y-6`}>
              <div className={cardClass}>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {labels.notes}
                </h2>
                <div
                  className={`prose prose-invert mt-3 max-w-none ${textAlign}`}
                  dangerouslySetInnerHTML={{ __html: notesHtml }}
                />
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
