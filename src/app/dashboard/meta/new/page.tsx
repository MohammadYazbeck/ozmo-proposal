import { MetaEditor } from "@/components/MetaEditor";
import { emptyMetaData } from "@/lib/meta-data";

export default function NewMetaPage() {
  return (
    <MetaEditor
      mode="create"
      meta={{
        slug: "",
        status: "DRAFT",
        showClient: true,
        showWallet: true,
        showResults: true,
        showPlan: true
      }}
      initialDataEn={emptyMetaData()}
      initialDataAr={emptyMetaData()}
    />
  );
}
