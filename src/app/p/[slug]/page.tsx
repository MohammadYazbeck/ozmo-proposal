import { notFound } from "next/navigation";
import { getProposalBySlug } from "@/lib/actions";
import {
  isLanguageAvailable,
  normalizeProposalData,
} from "@/lib/proposal-data";
import { PublicProposal } from "@/components/PublicProposal";

export const dynamic = "force-dynamic";

export default async function PublicProposalPage({
  params,
}: {
  params: { slug: string };
}) {
  const proposal = await getProposalBySlug(params.slug);
  if (!proposal || proposal.status !== "PUBLISHED") {
    notFound();
  }

  const dataEn = normalizeProposalData(proposal.dataEn);
  const dataAr = normalizeProposalData(proposal.dataAr);

  const hasEn = isLanguageAvailable(dataEn);
  const hasAr = isLanguageAvailable(dataAr);

  if (!hasEn && !hasAr) {
    notFound();
  }

  return (
    <PublicProposal
      proposal={{
        slug: proposal.slug,
        showVision: proposal.showVision,
        showGoals: proposal.showGoals,
        showWorkPlan: proposal.showWorkPlan,
        showPricing: proposal.showPricing,
        showNotes: proposal.showNotes,
      }}
      dataEn={dataEn}
      dataAr={dataAr}
      hasEn={hasEn}
      hasAr={hasAr}
    />
  );
}
