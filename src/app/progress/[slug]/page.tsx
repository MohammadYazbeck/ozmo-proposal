import { notFound } from "next/navigation";
import { getProgressBySlug } from "@/lib/progress-actions";
import { normalizeProgressData, isProgressAvailable } from "@/lib/progress-data";
import { hasProgressAccess } from "@/lib/progress-auth";
import { PublicProgress } from "@/components/PublicProgress";
import { ProgressUnlockForm } from "@/components/ProgressUnlockForm";

export const dynamic = "force-dynamic";

export default async function ProgressPublicPage({ params }: { params: { slug: string } }) {
  const progress = await getProgressBySlug(params.slug);
  if (!progress || progress.status !== "PUBLISHED") {
    notFound();
  }

  const dataEn = normalizeProgressData(progress.dataEn);
  const dataAr = normalizeProgressData(progress.dataAr);
  const hasEn = isProgressAvailable(dataEn);
  const hasAr = isProgressAvailable(dataAr);
  if (!hasEn && !hasAr) {
    notFound();
  }

  const hasAccess = await hasProgressAccess(progress.slug);
  if (!hasAccess) {
    return (
      <div className="relative min-h-screen bg-black text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)] opacity-70 animate-glow" />
        <div className="flex min-h-screen items-center justify-center px-6">
          <ProgressUnlockForm slug={progress.slug} />
        </div>
      </div>
    );
  }

  return (
    <PublicProgress
      progress={{
        slug: progress.slug,
        showClient: progress.showClient,
        showPlan: progress.showPlan,
        showCalendar: progress.showCalendar,
        showAssets: progress.showAssets,
        showPayments: progress.showPayments,
        showMetaAds: progress.showMetaAds
      }}
      dataEn={dataEn}
      dataAr={dataAr}
      hasEn={hasEn}
      hasAr={hasAr}
    />
  );
}
