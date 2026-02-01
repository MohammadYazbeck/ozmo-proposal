import { notFound } from "next/navigation";
import { MetaEditor } from "@/components/MetaEditor";
import { getMetaById } from "@/lib/meta-actions";
import { normalizeMetaData } from "@/lib/meta-data";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function EditMetaPage({ params }: { params: { id: string } }) {
  const metaPage = await getMetaById(params.id);
  if (!metaPage) {
    notFound();
  }

  return (
    <MetaEditor
      mode="edit"
      meta={{
        id: metaPage.id,
        slug: metaPage.slug,
        status: statusSchema.parse(metaPage.status),
        showClient: metaPage.showClient,
        showWallet: metaPage.showWallet,
        showResults: metaPage.showResults,
        showPlan: metaPage.showPlan,
        hasPassword: Boolean(metaPage.accessPasswordHash)
      }}
      initialDataEn={normalizeMetaData(metaPage.dataEn)}
      initialDataAr={normalizeMetaData(metaPage.dataAr)}
    />
  );
}
