import { listMetaPages } from "@/lib/meta-actions";
import { MetaTable } from "@/components/MetaTable";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function MetaPage() {
  const metaPages = await listMetaPages();
  const serialized = metaPages.map((item) => ({
    id: item.id,
    slug: item.slug,
    status: statusSchema.parse(item.status),
    updatedAt: item.updatedAt.toISOString(),
    dataEn: item.dataEn,
    dataAr: item.dataAr
  }));

  return <MetaTable metaPages={serialized} />;
}
