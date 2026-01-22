"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, clearSession, requireSession } from "@/lib/auth";
import { normalizeProposalData, isLanguageAvailable } from "@/lib/proposal-data";
import { slugSchema, statusSchema } from "@/lib/validation";

type ActionState = {
  error?: string;
  message?: string;
};

const parseJsonData = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string") {
    return normalizeProposalData(null);
  }
  try {
    return normalizeProposalData(JSON.parse(value));
  } catch {
    throw new Error("Invalid content payload.");
  }
};


const parseProposalFormData = (formData: FormData) => {
  const slugRaw = formData.get("slug")?.toString() ?? "";
  const slug = slugRaw.trim().toLowerCase();
  const status = statusSchema.parse(formData.get("status"));

  const dataEn = parseJsonData(formData.get("dataEn"));
  const dataAr = parseJsonData(formData.get("dataAr"));

  const showVision = formData.get("showVision") === "on";
  const showGoals = formData.get("showGoals") === "on";
  const showWorkPlan = formData.get("showWorkPlan") === "on";
  const showPricing = formData.get("showPricing") === "on";
  const showNotes = formData.get("showNotes") === "on";

  return {
    slug,
    status,
    dataEn,
    dataAr,
    showVision,
    showGoals,
    showWorkPlan,
    showPricing,
    showNotes
  };
};

const ensurePublishable = (status: string, dataEn: unknown, dataAr: unknown) => {
  if (status !== "PUBLISHED") {
    return;
  }
  const hasEn = isLanguageAvailable(dataEn as any);
  const hasAr = isLanguageAvailable(dataAr as any);
  if (!hasEn && !hasAr) {
    throw new Error("Publishing requires a hero title in EN or AR.");
  }
};

const ensureSlugAvailable = async (slug: string, id?: string) => {
  const existing = await prisma.proposal.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error("Slug is already in use.");
  }
};

export const login = async (_prevState: ActionState, formData: FormData) => {
  const username = formData.get("username")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPass = process.env.ADMIN_PASS ?? "";

  if (!username || !password || username !== expectedUser || password !== expectedPass) {
    return { error: "Invalid credentials." };
  }

  await createSession(username);
  const nextPath = formData.get("next")?.toString() ?? "";
  if (nextPath.startsWith("/")) {
    redirect(nextPath);
  }
  redirect("/dashboard/proposals");
};

export const logoutAction = async () => {
  await requireSession();
  clearSession();
  redirect("/login");
};

export const listProposals = async () => {
  await requireSession();
  return prisma.proposal.findMany({ orderBy: { updatedAt: "desc" } });
};

export const getProposalById = async (id: string) => {
  await requireSession();
  return prisma.proposal.findUnique({ where: { id } });
};

export const getProposalBySlug = async (slug: string) => {
  return prisma.proposal.findUnique({ where: { slug } });
};

export const deleteProposal = async (formData: FormData) => {
  await requireSession();
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }
  await prisma.proposal.delete({ where: { id } });
  revalidatePath("/dashboard/proposals");
  redirect("/dashboard/proposals");
};

export const createProposal = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const parsed = parseProposalFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug);
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr);

    const proposal = await prisma.proposal.create({
      data: {
        slug,
        status: parsed.status,
        showVision: parsed.showVision,
        showGoals: parsed.showGoals,
        showWorkPlan: parsed.showWorkPlan,
        showPricing: parsed.showPricing,
        showNotes: parsed.showNotes,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/proposals");
    redirect(`/dashboard/proposals/${proposal.id}/edit`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create proposal." };
  }
};

export const updateProposal = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const id = formData.get("id")?.toString();
    if (!id) {
      throw new Error("Missing proposal ID.");
    }

    const parsed = parseProposalFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug, id);
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr);

    await prisma.proposal.update({
      where: { id },
      data: {
        slug,
        status: parsed.status,
        showVision: parsed.showVision,
        showGoals: parsed.showGoals,
        showWorkPlan: parsed.showWorkPlan,
        showPricing: parsed.showPricing,
        showNotes: parsed.showNotes,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/proposals");
    revalidatePath(`/dashboard/proposals/${id}/edit`);
    return { message: "Saved." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update proposal." };
  }
};

const generateCopySlug = async (slug: string) => {
  const base = `${slug}-copy`;
  let candidate = base;
  let counter = 2;
  while (await prisma.proposal.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
};

export const duplicateProposal = async (formData: FormData) => {
  await requireSession();
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }
  const existing = await prisma.proposal.findUnique({ where: { id } });
  if (!existing) {
    return;
  }

  const slug = await generateCopySlug(existing.slug);
  const duplicated = await prisma.proposal.create({
    data: {
      slug,
      status: "DRAFT",
      showVision: existing.showVision,
      showGoals: existing.showGoals,
      showWorkPlan: existing.showWorkPlan,
      showPricing: existing.showPricing,
      showNotes: existing.showNotes,
      dataEn: existing.dataEn,
      dataAr: existing.dataAr
    }
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${duplicated.id}/edit`);
};
