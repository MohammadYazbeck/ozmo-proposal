"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteProposal, duplicateProposal } from "@/lib/actions";
import { normalizeProposalData } from "@/lib/proposal-data";
import type { ProposalStatus } from "@/lib/validation";

type SerializedProposal = {
  id: string;
  slug: string;
  status: ProposalStatus;
  updatedAt: string;
  expiresAt?: string | null;
  dataEn: unknown;
  dataAr: unknown;
};

export const ProposalsTable = ({ proposals }: { proposals: SerializedProposal[] }) => {
  const [query, setQuery] = useState("");
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const buildPublicUrl = (slug: string) => (baseUrl ? `${baseUrl}/p/${slug}` : `/p/${slug}`);

  const normalized = useMemo(
    () =>
      proposals.map((proposal) => ({
        ...proposal,
        titleEn: normalizeProposalData(proposal.dataEn).hero.title,
        titleAr: normalizeProposalData(proposal.dataAr).hero.title
      })),
    [proposals]
  );

  const filtered = normalized.filter((proposal) => {
    const haystack = `${proposal.slug} ${proposal.titleEn} ${proposal.titleAr}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Proposals</h1>
          <p className="text-sm text-slate-500">Manage bilingual proposals and publish them.</p>
        </div>
        <Link
          href="/dashboard/proposals/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          New proposal
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            placeholder="Search by slug or title..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none sm:max-w-xs"
          />
          <p className="text-sm text-slate-500">{filtered.length} results</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-3 pr-4 font-medium">Slug</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Updated</th>
                <th className="py-3 pr-4 font-medium">Public Link</th>
                <th className="py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proposal) => (
                <tr key={proposal.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-3 pr-4 font-medium">{proposal.slug}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        proposal.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{new Date(proposal.updatedAt).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <a
                      href={buildPublicUrl(proposal.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-orange hover:text-brand-orange"
                    >
                      View
                    </a>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/proposals/${proposal.id}/edit`}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-orange hover:text-brand-orange"
                      >
                        Edit
                      </Link>
                      <form action={duplicateProposal}>
                        <input type="hidden" name="id" value={proposal.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-orange hover:text-brand-orange"
                        >
                          Duplicate
                        </button>
                      </form>
                      <form
                        action={deleteProposal}
                        onSubmit={(event) => {
                          if (!window.confirm("Delete this proposal? This cannot be undone.")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={proposal.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                    No proposals found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
