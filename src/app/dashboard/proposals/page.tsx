import { listProposals } from "@/lib/actions";
import { ProposalsTable } from "@/components/ProposalsTable";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const proposals = await listProposals();
  const serialized = proposals.map((proposal) => ({
    id: proposal.id,
    slug: proposal.slug,
    status: statusSchema.parse(proposal.status),
    updatedAt: proposal.updatedAt.toISOString(),
    dataEn: proposal.dataEn,
    dataAr: proposal.dataAr
  }));

  return <ProposalsTable proposals={serialized} />;
}
