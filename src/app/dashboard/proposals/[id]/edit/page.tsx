import { notFound } from "next/navigation";
import { ProposalEditor } from "@/components/ProposalEditor";
import { getProposalById } from "@/lib/actions";
import { normalizeProposalData } from "@/lib/proposal-data";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function EditProposalPage({ params }: { params: { id: string } }) {
  const proposal = await getProposalById(params.id);
  if (!proposal) {
    notFound();
  }

  return (
    <ProposalEditor
      mode="edit"
      proposal={{
        id: proposal.id,
        slug: proposal.slug,
        status: statusSchema.parse(proposal.status),
        showVision: proposal.showVision,
        showGoals: proposal.showGoals,
        showWorkPlan: proposal.showWorkPlan,
        showPricing: proposal.showPricing,
        showNotes: proposal.showNotes,
        expiresAt: proposal.expiresAt ? proposal.expiresAt.toISOString() : null
      }}
      initialDataEn={normalizeProposalData(proposal.dataEn)}
      initialDataAr={normalizeProposalData(proposal.dataAr)}
    />
  );
}
