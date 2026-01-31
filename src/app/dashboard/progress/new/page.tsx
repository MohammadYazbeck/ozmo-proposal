import { ProgressEditor } from "@/components/ProgressEditor";
import { emptyProgressData } from "@/lib/progress-data";

export default function NewProgressPage() {
  return (
    <ProgressEditor
      mode="create"
      progress={{
        slug: "",
        status: "DRAFT",
        showClient: true,
        showPlan: true,
        showCalendar: true,
        showAssets: false,
        showPayments: true,
        showMetaAds: true
      }}
      initialDataEn={emptyProgressData()}
      initialDataAr={emptyProgressData()}
    />
  );
}
