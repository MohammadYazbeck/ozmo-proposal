import { notFound } from "next/navigation";
import { getMetaBySlug } from "@/lib/meta-actions";
import { normalizeMetaData, isMetaAvailable } from "@/lib/meta-data";
import { hasMetaAccess } from "@/lib/meta-auth";
import { PublicMeta } from "@/components/PublicMeta";
import { MetaUnlockForm } from "@/components/MetaUnlockForm";

export const dynamic = "force-dynamic";

export default async function MetaPublicPage({ params }: { params: { slug: string } }) {
  const metaPage = await getMetaBySlug(params.slug);
  if (!metaPage || metaPage.status !== "PUBLISHED") {
    notFound();
  }

  const dataEn = normalizeMetaData(metaPage.dataEn);
  const dataAr = normalizeMetaData(metaPage.dataAr);
  const hasEn = isMetaAvailable(dataEn);
  const hasAr = isMetaAvailable(dataAr);
  if (!hasEn && !hasAr) {
    notFound();
  }

  const hasAccess = await hasMetaAccess(metaPage.slug);
  if (!hasAccess) {
    return (
      <div className="relative min-h-screen bg-black text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_55%)] opacity-70 animate-glow" />
        <div className="flex min-h-screen items-center justify-center px-6">
          <MetaUnlockForm slug={metaPage.slug} />
        </div>
      </div>
    );
  }

  return (
    <PublicMeta
      meta={{
        slug: metaPage.slug,
        showClient: metaPage.showClient,
        showWallet: metaPage.showWallet,
        showResults: metaPage.showResults,
        showPlan: metaPage.showPlan
      }}
      dataEn={dataEn}
      dataAr={dataAr}
      hasEn={hasEn}
      hasAr={hasAr}
    />
  );
}
