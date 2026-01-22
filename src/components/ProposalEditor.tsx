"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProposal, deleteProposal, duplicateProposal, updateProposal } from "@/lib/actions";
import { ProposalData, WorkPlanBlock } from "@/lib/proposal-data";
import { isLanguageAvailable } from "@/lib/proposal-data";
import type { ProposalStatus } from "@/lib/validation";
import { RichTextEditor } from "@/components/RichTextEditor";

type EditorProposal = {
  id?: string;
  slug?: string;
  status?: ProposalStatus;
  showVision?: boolean;
  showGoals?: boolean;
  showWorkPlan?: boolean;
  showPricing?: boolean;
  showNotes?: boolean;
};

type ProposalEditorProps = {
  mode: "create" | "edit";
  proposal?: EditorProposal | null;
  initialDataEn: ProposalData;
  initialDataAr: ProposalData;
};

const initialState: { error?: string; message?: string } = { error: "", message: "" };

const SaveButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
};

export const ProposalEditor = ({ mode, proposal, initialDataEn, initialDataAr }: ProposalEditorProps) => {
  const [dataEn, setDataEn] = useState<ProposalData>(initialDataEn);
  const [dataAr, setDataAr] = useState<ProposalData>(initialDataAr);

  const defaultLang = useMemo(() => {
    if (isLanguageAvailable(initialDataEn)) {
      return "en";
    }
    if (isLanguageAvailable(initialDataAr)) {
      return "ar";
    }
    return "en";
  }, [initialDataEn, initialDataAr]);

  const [activeLang, setActiveLang] = useState<"en" | "ar">(defaultLang);

  const [state, formAction] = useFormState(
    mode === "create" ? createProposal : updateProposal,
    initialState
  );

  const data = activeLang === "en" ? dataEn : dataAr;
  const setData = activeLang === "en" ? setDataEn : setDataAr;
  const isRtl = activeLang === "ar";

  const updateHero = (field: keyof ProposalData["hero"], value: string) => {
    setData((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateGoals = (index: number, value: string) => {
    setData((prev) => {
      const goals = [...prev.goals];
      goals[index] = value;
      return { ...prev, goals };
    });
  };

  const addGoal = () => {
    setData((prev) => ({ ...prev, goals: [...prev.goals, ""] }));
  };

  const removeGoal = (index: number) => {
    setData((prev) => {
      const goals = prev.goals.filter((_, idx) => idx !== index);
      return { ...prev, goals };
    });
  };

  const updateWorkPlanBlock = (index: number, changes: Partial<WorkPlanBlock>) => {
    setData((prev) => {
      const workPlan = prev.workPlan.map((block, idx) => (idx === index ? { ...block, ...changes } : block));
      return { ...prev, workPlan };
    });
  };

  const reindexWorkPlan = (workPlan: WorkPlanBlock[]) =>
    workPlan.map((block, index) => ({ ...block, number: index + 1 }));

  const addWorkPlanBlock = () => {
    setData((prev) => {
      const workPlan = [
        ...prev.workPlan,
        {
          number: prev.workPlan.length + 1,
          heading: "",
          leadText: "",
          bullets: [{ text: "", highlightColor: undefined }]
        }
      ];
      return { ...prev, workPlan };
    });
  };

  const removeWorkPlanBlock = (index: number) => {
    setData((prev) => {
      const workPlan = prev.workPlan.filter((_, idx) => idx !== index);
      return { ...prev, workPlan: reindexWorkPlan(workPlan) };
    });
  };

  const updateBullet = (blockIndex: number, bulletIndex: number, changes: { text?: string; highlightColor?: string }) => {
    setData((prev) => {
      const workPlan = [...prev.workPlan];
      const block = { ...workPlan[blockIndex] };
      const bullets = [...block.bullets];
      bullets[bulletIndex] = { ...bullets[bulletIndex], ...changes };
      block.bullets = bullets;
      workPlan[blockIndex] = block;
      return { ...prev, workPlan };
    });
  };

  const addBullet = (blockIndex: number) => {
    setData((prev) => {
      const workPlan = [...prev.workPlan];
      const block = { ...workPlan[blockIndex] };
      block.bullets = [...block.bullets, { text: "", highlightColor: undefined }];
      workPlan[blockIndex] = block;
      return { ...prev, workPlan };
    });
  };

  const removeBullet = (blockIndex: number, bulletIndex: number) => {
    setData((prev) => {
      const workPlan = [...prev.workPlan];
      const block = { ...workPlan[blockIndex] };
      const bullets = block.bullets.filter((_, idx) => idx !== bulletIndex);
      block.bullets = bullets;
      workPlan[blockIndex] = block;
      return { ...prev, workPlan };
    });
  };

  const moveBullet = (blockIndex: number, bulletIndex: number, direction: "up" | "down") => {
    setData((prev) => {
      const workPlan = [...prev.workPlan];
      const block = { ...workPlan[blockIndex] };
      const bullets = [...block.bullets];
      const targetIndex = direction === "up" ? bulletIndex - 1 : bulletIndex + 1;
      if (targetIndex < 0 || targetIndex >= bullets.length) {
        return prev;
      }
      [bullets[bulletIndex], bullets[targetIndex]] = [bullets[targetIndex], bullets[bulletIndex]];
      block.bullets = bullets;
      workPlan[blockIndex] = block;
      return { ...prev, workPlan };
    });
  };

  const updatePricing = (index: number, changes: { name?: string; price?: string }) => {
    setData((prev) => {
      const pricing = [...prev.pricing];
      pricing[index] = { ...pricing[index], ...changes };
      return { ...prev, pricing };
    });
  };

  const updatePricingPoint = (index: number, pointIndex: number, value: string) => {
    setData((prev) => {
      const pricing = [...prev.pricing];
      const points = [...pricing[index].points];
      points[pointIndex] = value;
      pricing[index] = { ...pricing[index], points };
      return { ...prev, pricing };
    });
  };

  const addPricingPoint = (index: number) => {
    setData((prev) => {
      const pricing = [...prev.pricing];
      pricing[index] = { ...pricing[index], points: [...pricing[index].points, ""] };
      return { ...prev, pricing };
    });
  };

  const removePricingPoint = (index: number, pointIndex: number) => {
    setData((prev) => {
      const pricing = [...prev.pricing];
      const points = pricing[index].points.filter((_, idx) => idx !== pointIndex);
      pricing[index] = { ...pricing[index], points };
      return { ...prev, pricing };
    });
  };

  return (
    <form id="proposal-form" action={formAction} className="space-y-8">
      {proposal?.id ? <input type="hidden" name="id" value={proposal.id} /> : null}
      <input type="hidden" name="dataEn" value={JSON.stringify(dataEn)} />
      <input type="hidden" name="dataAr" value={JSON.stringify(dataAr)} />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "create" ? "New proposal" : "Edit proposal"}
          </h1>
          <p className="text-sm text-slate-500">Build and publish bilingual proposals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {proposal?.id ? (
            <button
              type="submit"
              formAction={duplicateProposal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-orange hover:text-brand-orange"
            >
              Duplicate
            </button>
          ) : null}
          {proposal?.id ? (
            <button
              type="submit"
              formAction={deleteProposal}
              onClick={(event) => {
                if (!window.confirm("Delete this proposal? This cannot be undone.")) {
                  event.preventDefault();
                }
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
            >
              Delete
            </button>
          ) : null}
          <SaveButton label={mode === "create" ? "Create proposal" : "Save changes"} />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
      ) : null}
      {state.message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              name="slug"
              defaultValue={proposal?.slug ?? ""}
              placeholder="ozmo-proposal"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              defaultValue={proposal?.status ?? "DRAFT"}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Publishing requires a hero title in EN or AR.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Section visibility</label>
            <div className="mt-2 grid gap-2 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showVision" defaultChecked={proposal?.showVision ?? true} />
                Show Vision
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showGoals" defaultChecked={proposal?.showGoals ?? true} />
                Show Goals
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showWorkPlan" defaultChecked={proposal?.showWorkPlan ?? true} />
                Show Work Plan
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showPricing" defaultChecked={proposal?.showPricing ?? true} />
                Show Pricing
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showNotes" defaultChecked={proposal?.showNotes ?? true} />
                Show Notes
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLang("en")}
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              activeLang === "en"
                ? "bg-brand-orange text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLang("ar")}
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              activeLang === "ar"
                ? "bg-brand-orange text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            AR
          </button>
          <span className="text-xs text-slate-500">
            {activeLang === "en" ? "Editing English content" : "Editing Arabic content"}
          </span>
        </div>

        <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "font-arabic text-right" : ""}>
          <div className="grid gap-6">
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Hero</h2>
              <div className="grid gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={data.hero.title}
                    onChange={(event) => updateHero("title", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Subtitle</label>
                  <input
                    value={data.hero.subtitle}
                    onChange={(event) => updateHero("subtitle", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Introduction</label>
                  <textarea
                    rows={3}
                    value={data.hero.introduction}
                    onChange={(event) => updateHero("introduction", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Preview</p>
                <p className="mt-2 text-xl font-semibold text-brand-orange">
                  {data.hero.title || "Proposal title"}
                </p>
                <p className="text-sm text-slate-500">{data.hero.subtitle || "Subtitle"}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {data.hero.introduction || "Introduction paragraph"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Vision</h2>
                <RichTextEditor
                  value={data.visionHtml}
                  onChange={(value) => setData((prev) => ({ ...prev, visionHtml: value }))}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
                <div className="space-y-2">
                  {data.goals.map((goal, index) => (
                    <div key={`goal-${index}`} className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <input
                        value={goal}
                        onChange={(event) => updateGoals(index, event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addGoal}
                  className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                >
                  + Add goal
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Work Plan</h2>
                <button
                  type="button"
                  onClick={addWorkPlanBlock}
                  className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                >
                  + Add block
                </button>
              </div>
              {data.workPlan.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No work plan blocks yet. Add one to get started.
                </div>
              ) : null}
              <div className="grid gap-4">
                {data.workPlan.map((block, index) => (
                  <div key={`block-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="text-2xl font-bold text-brand-orange">{block.number}</div>
                      <input
                        value={block.heading ?? ""}
                        onChange={(event) => updateWorkPlanBlock(index, { heading: event.target.value })}
                        placeholder="Heading (optional)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeWorkPlanBlock(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove block
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={block.leadText ?? ""}
                      onChange={(event) => updateWorkPlanBlock(index, { leadText: event.target.value })}
                      placeholder="Lead text (optional)"
                      className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                    />
                    <div className="mt-3 space-y-2">
                      {block.bullets.map((bullet, bulletIndex) => (
                        <div key={`bullet-${index}-${bulletIndex}`} className="flex flex-col gap-2 md:flex-row md:items-center">
                          <textarea
                            rows={2}
                            value={bullet.text}
                            onChange={(event) => updateBullet(index, bulletIndex, { text: event.target.value })}
                            placeholder="Bullet text"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bullet.highlightColor || "#ffffff"}
                              onChange={(event) => updateBullet(index, bulletIndex, { highlightColor: event.target.value })}
                              className="h-9 w-10 cursor-pointer rounded border border-slate-200 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => updateBullet(index, bulletIndex, { highlightColor: undefined })}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBullet(index, bulletIndex, "up")}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBullet(index, bulletIndex, "down")}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBullet(index, bulletIndex)}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addBullet(index)}
                      className="mt-3 text-xs font-semibold text-brand-orange hover:text-orange-600"
                    >
                      + Add bullet
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Pricing (3 packages)</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {data.pricing.map((pkg, index) => (
                  <div key={`pricing-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Package name</label>
                        <input
                          value={pkg.name}
                          onChange={(event) => updatePricing(index, { name: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Price</label>
                        <input
                          value={pkg.price}
                          onChange={(event) => updatePricing(index, { price: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Points</label>
                        {pkg.points.map((point, pointIndex) => (
                          <div key={`point-${index}-${pointIndex}`} className="flex items-center gap-2">
                            <input
                              value={point}
                              onChange={(event) => updatePricingPoint(index, pointIndex, event.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removePricingPoint(index, pointIndex)}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPricingPoint(index)}
                          className="text-xs font-semibold text-brand-orange hover:text-orange-600"
                        >
                          + Add point
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              <RichTextEditor
                value={data.notesHtml}
                onChange={(value) => setData((prev) => ({ ...prev, notesHtml: value }))}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};
