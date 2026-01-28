import { ProposalEditor } from "@/components/ProposalEditor";
import { emptyProposalData } from "@/lib/proposal-data";

export default function NewProposalPage() {
  return (
    <ProposalEditor
      mode="create"
      proposal={{
        slug: "",
        status: "DRAFT",
        showVision: true,
        showGoals: true,
        showNoticed: false,
        showWorkPlan: true,
        showPricing: true,
        showNotes: true,
        expiresAt: null
      }}
      initialDataEn={emptyProposalData()}
      initialDataAr={emptyProposalData()}
    />
  );
}
