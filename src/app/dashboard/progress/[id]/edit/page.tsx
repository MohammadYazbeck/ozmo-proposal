import { notFound } from "next/navigation";
import { ProgressEditor } from "@/components/ProgressEditor";
import { getProgressById } from "@/lib/progress-actions";
import { normalizeProgressData } from "@/lib/progress-data";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function EditProgressPage({ params }: { params: { id: string } }) {
  const progress = await getProgressById(params.id);
  if (!progress) {
    notFound();
  }

  return (
    <ProgressEditor
      mode="edit"
      progress={{
        id: progress.id,
        slug: progress.slug,
        status: statusSchema.parse(progress.status),
        showClient: progress.showClient,
        showPlan: progress.showPlan,
        showCalendar: progress.showCalendar,
        showAssets: progress.showAssets,
        showPayments: progress.showPayments,
        showMetaAds: progress.showMetaAds,
        hasPassword: Boolean(progress.accessPasswordHash)
      }}
      initialDataEn={normalizeProgressData(progress.dataEn)}
      initialDataAr={normalizeProgressData(progress.dataAr)}
    />
  );
}
