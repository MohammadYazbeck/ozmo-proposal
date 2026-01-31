import { listProgress } from "@/lib/progress-actions";
import { ProgressTable } from "@/components/ProgressTable";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const progress = await listProgress();
  const serialized = progress.map((item) => ({
    id: item.id,
    slug: item.slug,
    status: statusSchema.parse(item.status),
    updatedAt: item.updatedAt.toISOString(),
    dataEn: item.dataEn,
    dataAr: item.dataAr
  }));

  return <ProgressTable progress={serialized} />;
}
