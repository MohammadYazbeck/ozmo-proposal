"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { normalizeProgressData, isProgressAvailable } from "@/lib/progress-data";
import { hashProgressPassword, setProgressAccess } from "@/lib/progress-auth";
import { slugSchema, statusSchema } from "@/lib/validation";

type ActionState = {
  error?: string;
  message?: string;
};

const parseJsonData = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string") {
    return normalizeProgressData(null);
  }
  try {
    return normalizeProgressData(JSON.parse(value));
  } catch {
    throw new Error("Invalid progress payload.");
  }
};

const parseProgressFormData = (formData: FormData) => {
  const slugRaw = formData.get("slug")?.toString() ?? "";
  const slug = slugRaw.trim().toLowerCase();
  const status = statusSchema.parse(formData.get("status"));
  const password = formData.get("password")?.toString().trim() ?? "";

  const dataEn = parseJsonData(formData.get("dataEn"));
  const dataAr = parseJsonData(formData.get("dataAr"));

  const showClient = formData.get("showClient") === "on";
  const showPlan = formData.get("showPlan") === "on";
  const showCalendar = formData.get("showCalendar") === "on";
  const showAssets = formData.get("showAssets") === "on";
  const showPayments = formData.get("showPayments") === "on";
  const showMetaAds = formData.get("showMetaAds") === "on";

  return {
    slug,
    status,
    password,
    dataEn,
    dataAr,
    showClient,
    showPlan,
    showCalendar,
    showAssets,
    showPayments,
    showMetaAds
  };
};

const ensurePublishable = (status: string, dataEn: unknown, dataAr: unknown, passwordHash?: string | null) => {
  if (status !== "PUBLISHED") {
    return;
  }
  const hasEn = isProgressAvailable(dataEn as any);
  const hasAr = isProgressAvailable(dataAr as any);
  if (!hasEn && !hasAr) {
    throw new Error("Publishing requires a client name in EN or AR.");
  }
  if (!passwordHash) {
    throw new Error("Publishing requires a password.");
  }
};

const ensureSlugAvailable = async (slug: string, id?: string) => {
  const existing = await prisma.progress.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error("Slug is already in use.");
  }
};

export const listProgress = async () => {
  await requireSession();
  return prisma.progress.findMany({ orderBy: { updatedAt: "desc" } });
};

export const getProgressById = async (id: string) => {
  await requireSession();
  return prisma.progress.findUnique({ where: { id } });
};

export const getProgressBySlug = async (slug: string) => {
  return prisma.progress.findUnique({ where: { slug } });
};

export const deleteProgress = async (formData: FormData) => {
  await requireSession();
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }
  await prisma.progress.delete({ where: { id } });
  revalidatePath("/dashboard/progress");
  redirect("/dashboard/progress");
};

export const createProgress = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const parsed = parseProgressFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug);
    const passwordHash = parsed.password ? hashProgressPassword(parsed.password) : null;
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, passwordHash);

    const progress = await prisma.progress.create({
      data: {
        slug,
        status: parsed.status,
        accessPasswordHash: passwordHash,
        showClient: parsed.showClient,
        showPlan: parsed.showPlan,
        showCalendar: parsed.showCalendar,
        showAssets: parsed.showAssets,
        showPayments: parsed.showPayments,
        showMetaAds: parsed.showMetaAds,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/progress");
    redirect(`/dashboard/progress/${progress.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to create progress page." };
  }
};

export const updateProgress = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const id = formData.get("id")?.toString();
    if (!id) {
      throw new Error("Missing progress ID.");
    }

    const parsed = parseProgressFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug, id);

    const existing = await prisma.progress.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Progress not found.");
    }

    const passwordHash = parsed.password
      ? hashProgressPassword(parsed.password)
      : existing.accessPasswordHash;

    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, passwordHash);

    await prisma.progress.update({
      where: { id },
      data: {
        slug,
        status: parsed.status,
        accessPasswordHash: passwordHash,
        showClient: parsed.showClient,
        showPlan: parsed.showPlan,
        showCalendar: parsed.showCalendar,
        showAssets: parsed.showAssets,
        showPayments: parsed.showPayments,
        showMetaAds: parsed.showMetaAds,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/progress");
    revalidatePath(`/dashboard/progress/${id}/edit`);
    return { message: "Saved." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to update progress page." };
  }
};

export const unlockProgress = async (_prevState: ActionState, formData: FormData) => {
  try {
    const slug = formData.get("slug")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    if (!slug || !password) {
      return { error: "Password is required." };
    }
    const progress = await prisma.progress.findUnique({ where: { slug } });
    if (!progress || progress.status !== "PUBLISHED") {
      return { error: "Progress page not available." };
    }
    if (!progress.accessPasswordHash) {
      return { error: "Password is not configured." };
    }
    const hashed = hashProgressPassword(password);
    if (hashed !== progress.accessPasswordHash) {
      return { error: "Incorrect password." };
    }
    await setProgressAccess(slug);
    redirect(`/progress/${slug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to unlock progress page." };
  }
};
