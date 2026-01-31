"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProgressData, ProgressCalendarItem } from "@/lib/progress-data";

type LangKey = "en" | "ar";

type PublicProgressProps = {
  progress: {
    slug: string;
    showClient: boolean;
    showPlan: boolean;
    showCalendar: boolean;
    showAssets: boolean;
    showPayments: boolean;
    showMetaAds: boolean;
  };
  dataEn: ProgressData;
  dataAr: ProgressData;
  hasEn: boolean;
  hasAr: boolean;
};

const labelsByLang: Record<
  LangKey,
  {
    client: string;
    workPlan: string;
    calendar: string;
    assets: string;
    payments: string;
    agreed: string;
    totalPaid: string;
    metaAds: string;
    upcoming: string;
    completed: string;
    showAll: string;
    close: string;
  }
> = {
  en: {
    client: "Client",
    workPlan: "Work Plan Progress",
    calendar: "Calendar",
    assets: "Assets",
    payments: "Payments",
    agreed: "Agreed price",
    totalPaid: "Total paid",
    metaAds: "Meta ads balance",
    upcoming: "Next up",
    completed: "All tasks completed",
    showAll: "Show all",
    close: "Close",
  },
  ar: {
    client: "العميل",
    workPlan: "تقدم خطة العمل",
    calendar: "الجدول",
    assets: "الملفات",
    payments: "المدفوعات",
    agreed: "المبلغ المتفق عليه",
    totalPaid: "إجمالي المدفوع",
    metaAds: "رصيد إعلانات ميتا",
    upcoming: "الخطوة التالية",
    completed: "تمت جميع المهام",
    showAll: "عرض الكل",
    close: "إغلاق",
  },
};

const cardClass =
  "relative isolate z-0 overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.35),transparent_60%)] before:opacity-80 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[linear-gradient(140deg,rgba(0,0,0,0.65),rgba(0,0,0,0.25))] after:content-['']";
const panelClass =
  "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur";
const modalCardClass =
  "relative isolate z-0 w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.7)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_60%)] before:opacity-90 before:content-['']";
const floatingButtonClass =
  "group flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-100 backdrop-blur transition hover:border-brand-orange/50 hover:bg-white/10";
const calendarCardClass =
  "relative min-w-[300px] md:min-w-[380px] min-h-[200px] md:min-h-[230px] snap-center rounded-3xl border border-white/15 bg-white/[0.06] p-5 pt-16 text-left text-slate-100 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:border-brand-orange/40";
const sectionClass = "relative border-t border-white/10 pt-12";
const topSectionClass = "relative pt-4";

const parseAmount = (value: string) => {
  const cleaned = value.replace(/[^0-9.]+/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calendarDate = (item: ProgressCalendarItem) => {
  if (!item.date) {
    return null;
  }
  const time = item.time ? item.time : "00:00";
  const parsed = new Date(`${item.date}T${time}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatDayMonthParts = (date: Date, lang: "en" | "ar") => {
  const formatter = new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", {
    day: "numeric",
    month: "short",
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return {
    day,
    month: lang === "en" ? month.toUpperCase() : month,
  };
};

export const PublicProgress = ({
  progress,
  dataEn,
  dataAr,
  hasEn,
  hasAr,
}: PublicProgressProps) => {
  const singleLanguage = !hasEn || !hasAr;
  const defaultLang: LangKey = hasEn ? "en" : "ar";
  const [activeLang, setActiveLang] = useState<LangKey>(defaultLang);
  const currentLang = singleLanguage ? defaultLang : activeLang;

  const data = currentLang === "ar" ? dataAr : dataEn;
  const isRtl = currentLang === "ar";
  const labels = labelsByLang[currentLang];
  const textAlign = isRtl ? "text-right" : "text-left";
  const alignClass = isRtl ? "items-end text-right" : "items-start text-left";
  const rowClass = isRtl
    ? "flex-row-reverse justify-end"
    : "flex-row justify-start";
  const rowBetweenClass = isRtl ? "flex-row-reverse" : "flex-row";
  const planRowClass = isRtl ? "flex-row-reverse" : "flex-row";
  const planListPadding = isRtl ? "pr-12" : "pl-12";
  const planLinePosition = isRtl ? "right-[14px]" : "left-[14px]";
  const planMarkerPosition = isRtl ? "right-0" : "left-0";
  const planTextPadding = isRtl ? "pr-10" : "pl-10";
  const lineClass = isRtl
    ? "border-r border-white/10 pr-4"
    : "border-l border-white/10 pl-4";
  const workPlanPoints = useMemo(
    () => data.workPlan.points.filter((point) => point.text.trim()),
    [data.workPlan.points]
  );
  const planDoneCount = useMemo(
    () => workPlanPoints.filter((point) => point.done).length,
    [workPlanPoints]
  );
  const planTotalCount = workPlanPoints.length;
  const planProgress = planTotalCount
    ? Math.round((planDoneCount / planTotalCount) * 100)
    : 0;
  const calendarItems = useMemo(
    () =>
      data.calendar
        .map((item) => ({ ...item, parsed: calendarDate(item) }))
        .filter((item) => item.date.trim())
        .sort((a, b) => {
          if (!a.parsed || !b.parsed) {
            return 0;
          }
          return a.parsed.getTime() - b.parsed.getTime();
        }),
    [data.calendar]
  );

  const paymentEntries = useMemo(
    () =>
      data.payments.entries.filter(
        (entry) => entry.amount.trim() || entry.description.trim()
      ),
    [data.payments.entries]
  );
  const totalPaid = paymentEntries.reduce(
    (sum, entry) => sum + parseAmount(entry.amount),
    0
  );
  const agreed = parseAmount(data.payments.agreedPrice);
  const progressRatio = agreed > 0 ? Math.min(totalPaid / agreed, 1) : 0;
  const progressAngle = Math.round(progressRatio * 360);
  const phoneHref = "tel:+963982475910";
  const whatsappHref = "https://wa.me/+963982475910";

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  const nextIndex = useMemo(() => {
    const now = new Date();
    const upcomingIndex = calendarItems.findIndex(
      (item) => item.parsed && item.parsed >= now
    );
    if (upcomingIndex >= 0) {
      return upcomingIndex;
    }
    return calendarItems.length ? calendarItems.length - 1 : -1;
  }, [calendarItems]);
  const nextDate = nextIndex >= 0 ? calendarItems[nextIndex]?.parsed : null;
  const isNextUp =
    !!nextDate && nextDate >= new Date() && currentIndex === nextIndex;

  useEffect(() => {
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    }
  }, [nextIndex]);

  useEffect(() => {
    const recenter = () => {
      const viewport = viewportRef.current;
      const card = cardRefs.current[currentIndex];
      if (!viewport || !card) {
        return;
      }
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const viewportCenter = viewport.clientWidth / 2;
      const target = cardCenter - viewportCenter;
      setOffset(target);
    };
    const handle = () => requestAnimationFrame(recenter);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [calendarItems.length, currentIndex, isRtl]);

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      const stored = window.localStorage.getItem(
        `ozmo:progress:lang:${progress.slug}`
      );
      if (stored === "en" || stored === "ar") {
        setActiveLang(stored);
      }
    } catch {
      // ignore storage access errors
    }
  }, [progress.slug, singleLanguage]);

  useEffect(() => {
    if (singleLanguage) {
      return;
    }
    try {
      window.localStorage.setItem(
        `ozmo:progress:lang:${progress.slug}`,
        currentLang
      );
    } catch {
      // ignore storage access errors
    }
  }, [currentLang, progress.slug, singleLanguage]);

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

  const moveCarousel = (direction: "prev" | "next") => {
    if (!calendarItems.length) {
      return;
    }
    setCurrentIndex((prev) => {
      if (direction === "prev") {
        return Math.max(0, prev - 1);
      }
      return Math.min(calendarItems.length - 1, prev + 1);
    });
  };

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
          {progress.showClient ? (
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

          {progress.showPlan && workPlanPoints.length ? (
            <section className={`${sectionClass} ${textAlign}`}>
              <div className="space-y-8">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-3xl font-semibold text-white md:text-4xl">
                      {labels.workPlan}
                    </h2>
                    {data.workPlan.brief ? (
                      <p className="mt-4 text-base leading-relaxed text-slate-300">
                        {data.workPlan.brief}
                      </p>
                    ) : null}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-orange transition-all duration-500"
                      style={{ width: `${planProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className={`relative mt-8 ${planListPadding}`}>
                <span
                  className={`pointer-events-none absolute top-1 bottom-1 w-px bg-white/10 ${planLinePosition}`}
                />
                <div className="space-y-6">
                  {workPlanPoints.map((point, index) => (
                    <div key={`plan-${index}`} className="relative">
                      <span
                        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full border ${planMarkerPosition} ${
                          point.done
                            ? "border-brand-orange bg-brand-orange text-black"
                            : "border-white/20 text-white/50"
                        }`}
                      >
                        {point.done ? (
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 10l3 3 7-7" />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white/40" />
                        )}
                      </span>
                      <div className={planTextPadding}>
                        <p
                          className={`text-base leading-relaxed md:text-lg ${
                            point.done
                              ? "text-slate-400 line-through"
                              : "text-slate-100"
                          }`}
                        >
                          {point.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {progress.showCalendar && calendarItems.length ? (
            <section className={`${sectionClass} space-y-6`}>
              <div className={`flex items-center justify-between gap-4`}>
                <div className={textAlign}>
                  <h2 className="text-2xl font-semibold text-white">
                    {labels.calendar}
                  </h2>
                  <p
                    className={`mt-1 text-sm text-brand-orange transition-opacity ${
                      isNextUp ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden={!isNextUp}
                  >
                    {labels.upcoming}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-brand-orange/40"
                >
                  {labels.showAll}
                </button>
              </div>
              <div
                ref={viewportRef}
                className="relative overflow-x-hidden overflow-y-visible py-8"
                dir="ltr"
              >
                <button
                  type="button"
                  onClick={() => moveCarousel("prev")}
                  className="hidden sm:flex absolute left-3 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-orange/50 bg-black/80 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur transition hover:border-brand-orange hover:text-brand-orange"
                  aria-label="Previous"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => moveCarousel("next")}
                  className="hidden sm:flex absolute right-3 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-orange/50 bg-black/80 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur transition hover:border-brand-orange hover:text-brand-orange"
                  aria-label="Next"
                >
                  {">"}
                </button>
                <div
                  ref={carouselRef}
                  className="flex gap-4 transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(${-offset}px)`,
                  }}
                >
                  {calendarItems.map((item, index) => {
                    const isActive = index === currentIndex;
                    const parsed = item.parsed;
                    const dateParts = parsed
                      ? formatDayMonthParts(parsed, currentLang)
                      : { day: "", month: item.date };
                    return (
                      <button
                        key={`calendar-card-${index}`}
                        ref={(el) => {
                          cardRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(index);
                        }}
                        className={`${calendarCardClass} ${
                          isActive
                            ? "border-brand-orange/60 scale-105 opacity-100"
                            : "scale-95 opacity-60 blur-[1px]"
                        }`}
                      >
                        <div className="absolute left-4 top-4 flex items-end gap-2 text-brand-orange">
                          <span className="text-3xl font-semibold leading-none">
                            {dateParts.day || "--"}
                          </span>
                          <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-brand-orange/70">
                            {dateParts.month}
                          </span>
                        </div>
                        {item.time ? (
                          <span className="absolute right-4 top-4 text-[11px] text-slate-400">
                            {item.time}
                          </span>
                        ) : null}
                        <div
                          className={`mt-6 flex h-full flex-col gap-3 ${textAlign}`}
                        >
                          {item.title ? (
                            <h3
                              className={`text-xl font-semibold tracking-tight text-white md:text-2xl ${textAlign}`}
                            >
                              {item.title}
                            </h3>
                          ) : null}
                          <ul
                            dir={isRtl ? "rtl" : "ltr"}
                            className={`space-y-2 text-sm text-slate-300 ${textAlign}`}
                          >
                            {item.points
                              .filter((point) => point.trim())
                              .map((point, idx) => (
                                <li
                                  key={`calendar-${index}-point-${idx}`}
                                  className={`flex items-start gap-2  ${textAlign}`}
                                >
                                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />
                                  <span>{point}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 sm:hidden">
                  <button
                    type="button"
                    onClick={() => moveCarousel("prev")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-orange/50 bg-black/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur transition hover:border-brand-orange hover:text-brand-orange"
                    aria-label="Previous"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCarousel("next")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-orange/50 bg-black/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur transition hover:border-brand-orange hover:text-brand-orange"
                    aria-label="Next"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {progress.showPayments ? (
            <section className={`${sectionClass}`}>
              <div className={`flex items-center justify-between gap-4 `}>
                <h2
                  className={`text-3xl font-semibold text-white ${textAlign}`}
                >
                  {labels.payments}
                </h2>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  USD
                </span>
              </div>
              <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                  <div className={`flex flex-col gap-8 ${textAlign}`}>
                    <div className="flex justify-center">
                      <div
                        className="relative flex h-28 w-28 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#F97316 ${progressAngle}deg, rgba(255,255,255,0.08) 0deg)`,
                        }}
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/80 text-sm font-semibold text-white">
                          {Math.round(progressRatio * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className={`grid gap-4 sm:grid-cols-2 ${textAlign}`}>
                      <div
                        className={`rounded-2xl border border-white/10 bg-black/40 p-4 ${textAlign}`}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {labels.agreed}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          ${data.payments.agreedPrice || "0"}
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl border border-white/10 bg-black/40 p-4 ${textAlign}`}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {labels.totalPaid}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          ${totalPaid.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div
                      dir={isRtl ? "rtl" : "ltr"}
                      className={`space-y-3 text-sm text-slate-300 ${textAlign}`}
                    >
                      {paymentEntries.map((entry, index) => (
                        <div
                          key={`entry-${index}`}
                          className={`flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 `}
                        >
                          <div className={textAlign}>
                            <p className="text-base font-semibold text-white">
                              ${entry.amount || "0"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {entry.description}
                            </p>
                          </div>
                          {entry.date ? (
                            <span
                              className={`text-xs text-slate-500 ${textAlign}`}
                            >
                              {entry.date}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {progress.showMetaAds ? (
                  <div className="self-start rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className={`flex flex-col gap-4 ${textAlign}`}>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          {labels.metaAds}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-brand-orange">
                          {data.payments.metaAdsBalance
                            ? `$${data.payments.metaAdsBalance}`
                            : "--"}
                        </p>
                      </div>
                      <div className="h-1 w-16 rounded-full bg-brand-orange/60" />
                    </div>
                  </div>
                ) : null}
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
            className="h-6 w-6 text-brand-orange"
            fill="currentColor"
            aria-label="WhatsApp"
          >
            <path d="M12.04 0C5.39 0 .16 5.33.16 11.9c0 2.09.55 4.13 1.59 5.94L0 24l6.31-1.65a11.86 11.86 0 0 0 5.69 1.45h.01c6.65 0 11.99-5.33 11.99-11.9A11.86 11.86 0 0 0 12.04 0zm0 21.79h-.01a9.85 9.85 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.84 9.84 0 1 1 8.38 4.63zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
          </svg>
        </a>
        {progress.showAssets && data.assetsUrl ? (
          <a
            href={data.assetsUrl}
            target="_blank"
            rel="noreferrer"
            className={floatingButtonClass}
            aria-label="Google Drive"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Google_Drive-Logo.wine.svg"
              alt="Google Drive"
              className="h-6 w-6"
            />
          </a>
        ) : null}
      </div>

      {showAll ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur">
          <div className={`${cardClass} w-full max-w-2xl`}>
            <div
              dir={isRtl ? "rtl" : "ltr"}
              className={`relative z-10 space-y-5 ${textAlign}`}
            >
              <div className={`flex items-center justify-between `}>
                <h3 className="text-xl font-semibold text-white">
                  {labels.calendar}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-brand-orange/40"
                >
                  {labels.close}
                </button>
              </div>
              <div className="space-y-3">
                {calendarItems.map((item, index) => {
                  const parsed = item.parsed;
                  const dateLabel = parsed
                    ? parsed.toLocaleDateString(
                        currentLang === "ar" ? "ar" : "en",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : item.date;
                  return (
                    <button
                      key={`calendar-list-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedIndex(index);
                        setShowAll(false);
                      }}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-slate-200 transition hover:border-brand-orange/40 ${textAlign}`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">
                          {item.title || labels.calendar}
                        </p>
                        <p className="text-xs text-slate-400">{dateLabel}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-brand-orange">
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedIndex !== null && calendarItems[selectedIndex] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur">
          <div className={modalCardClass}>
            <div className="relative z-10 space-y-6">
              <div className={`flex items-start justify-between gap-4 `}>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-orange">
                    {labels.calendar}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    {calendarItems[selectedIndex].title || labels.calendar}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white transition hover:border-brand-orange/40"
                  aria-label={labels.close}
                >
                  ✕
                </button>
              </div>
              <div className={`flex flex-wrap items-center gap-3 ${rowClass}`}>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                  {calendarItems[selectedIndex].parsed
                    ? calendarItems[selectedIndex].parsed?.toLocaleDateString(
                        currentLang === "ar" ? "ar" : "en",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : calendarItems[selectedIndex].date}
                </span>
                {calendarItems[selectedIndex].time ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400">
                    {calendarItems[selectedIndex].time}
                  </span>
                ) : null}
              </div>
              <ul
                dir={isRtl ? "rtl" : "ltr"}
                className={`space-y-3 text-sm text-slate-200 ${textAlign}`}
              >
                {calendarItems[selectedIndex].points
                  .filter((point) => point.trim())
                  .map((point, idx) => (
                    <li
                      key={`modal-${idx}`}
                      className={`flex items-start gap-3  ${textAlign}`}
                    >
                      <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-orange" />
                      <span>{point}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
