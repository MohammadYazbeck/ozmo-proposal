"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
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

const parseOptionalDate = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid disable date.");
  }
  return parsed;
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
  const showNoticed = formData.get("showNoticed") === "on";
  const expiresAt = parseOptionalDate(formData.get("expiresAt"));

  return {
    slug,
    status,
    dataEn,
    dataAr,
    showVision,
    showGoals,
    showWorkPlan,
    showPricing,
    showNotes,
    showNoticed,
    expiresAt
  };
};

const ensurePublishable = (
  status: string,
  dataEn: unknown,
  dataAr: unknown,
  expiresAt: Date | null
) => {
  if (status !== "PUBLISHED") {
    return;
  }
  const hasEn = isLanguageAvailable(dataEn as any);
  const hasAr = isLanguageAvailable(dataAr as any);
  if (!hasEn && !hasAr) {
    throw new Error("Publishing requires a hero title in EN or AR.");
  }
  if (expiresAt && expiresAt <= new Date()) {
    throw new Error("Disable date must be in the future.");
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
  await prisma.proposal.updateMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { not: null, lte: new Date() }
    },
    data: { status: "DRAFT" }
  });
  return prisma.proposal.findMany({ orderBy: { updatedAt: "desc" } });
};

export const getProposalById = async (id: string) => {
  await requireSession();
  await prisma.proposal.updateMany({
    where: {
      id,
      status: "PUBLISHED",
      expiresAt: { not: null, lte: new Date() }
    },
    data: { status: "DRAFT" }
  });
  return prisma.proposal.findUnique({ where: { id } });
};

export const getProposalBySlug = async (slug: string) => {
  const proposal = await prisma.proposal.findUnique({ where: { slug } });
  if (!proposal) {
    return null;
  }
  if (proposal.status === "PUBLISHED" && proposal.expiresAt && proposal.expiresAt <= new Date()) {
    await prisma.proposal.update({ where: { id: proposal.id }, data: { status: "DRAFT" } });
    return { ...proposal, status: "DRAFT" };
  }
  return proposal;
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
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, parsed.expiresAt);

    const proposal = await prisma.proposal.create({
      data: {
        slug,
        status: parsed.status,
        showVision: parsed.showVision,
        showGoals: parsed.showGoals,
        showWorkPlan: parsed.showWorkPlan,
        showPricing: parsed.showPricing,
        showNotes: parsed.showNotes,
        showNoticed: parsed.showNoticed,
        expiresAt: parsed.expiresAt,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/proposals");
    redirect(`/dashboard/proposals/${proposal.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
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
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, parsed.expiresAt);

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
        showNoticed: parsed.showNoticed,
        expiresAt: parsed.expiresAt,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/proposals");
    revalidatePath(`/dashboard/proposals/${id}/edit`);
    return { message: "Saved." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
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
      showNoticed: existing.showNoticed,
      expiresAt: existing.expiresAt,
      dataEn: existing.dataEn,
      dataAr: existing.dataAr
    }
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${duplicated.id}/edit`);
};
