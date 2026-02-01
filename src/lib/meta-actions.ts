"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { normalizeMetaData, isMetaAvailable } from "@/lib/meta-data";
import { hashMetaPassword, setMetaAccess } from "@/lib/meta-auth";
import { slugSchema, statusSchema } from "@/lib/validation";

type ActionState = {
  error?: string;
  message?: string;
};

const parseJsonData = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string") {
    return normalizeMetaData(null);
  }
  try {
    return normalizeMetaData(JSON.parse(value));
  } catch {
    throw new Error("Invalid meta payload.");
  }
};

const parseMetaFormData = (formData: FormData) => {
  const slugRaw = formData.get("slug")?.toString() ?? "";
  const slug = slugRaw.trim().toLowerCase();
  const status = statusSchema.parse(formData.get("status"));
  const password = formData.get("password")?.toString().trim() ?? "";

  const dataEn = parseJsonData(formData.get("dataEn"));
  const dataAr = parseJsonData(formData.get("dataAr"));

  const showClient = formData.get("showClient") === "on";
  const showWallet = formData.get("showWallet") === "on";
  const showResults = formData.get("showResults") === "on";
  const showPlan = formData.get("showPlan") === "on";

  return {
    slug,
    status,
    password,
    dataEn,
    dataAr,
    showClient,
    showWallet,
    showResults,
    showPlan
  };
};

const ensurePublishable = (
  status: string,
  dataEn: unknown,
  dataAr: unknown,
  passwordHash?: string | null
) => {
  if (status !== "PUBLISHED") {
    return;
  }
  const hasEn = isMetaAvailable(dataEn as any);
  const hasAr = isMetaAvailable(dataAr as any);
  if (!hasEn && !hasAr) {
    throw new Error("Publishing requires a client name in EN or AR.");
  }
  if (!passwordHash) {
    throw new Error("Publishing requires a password.");
  }
};

const ensureSlugAvailable = async (slug: string, id?: string) => {
  const existing = await prisma.metaPage.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error("Slug is already in use.");
  }
};

export const listMetaPages = async () => {
  await requireSession();
  return prisma.metaPage.findMany({ orderBy: { updatedAt: "desc" } });
};

export const getMetaById = async (id: string) => {
  await requireSession();
  return prisma.metaPage.findUnique({ where: { id } });
};

export const getMetaBySlug = async (slug: string) => {
  return prisma.metaPage.findUnique({ where: { slug } });
};

export const deleteMeta = async (formData: FormData) => {
  await requireSession();
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }
  await prisma.metaPage.delete({ where: { id } });
  revalidatePath("/dashboard/meta");
  redirect("/dashboard/meta");
};

export const createMeta = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const parsed = parseMetaFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug);
    const passwordHash = parsed.password ? hashMetaPassword(parsed.password) : null;
    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, passwordHash);

    const metaPage = await prisma.metaPage.create({
      data: {
        slug,
        status: parsed.status,
        accessPasswordHash: passwordHash,
        showClient: parsed.showClient,
        showWallet: parsed.showWallet,
        showResults: parsed.showResults,
        showPlan: parsed.showPlan,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/meta");
    redirect(`/dashboard/meta/${metaPage.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to create meta page." };
  }
};

export const updateMeta = async (_prevState: ActionState, formData: FormData) => {
  await requireSession();
  try {
    const id = formData.get("id")?.toString();
    if (!id) {
      throw new Error("Missing meta ID.");
    }

    const parsed = parseMetaFormData(formData);
    const slug = slugSchema.parse(parsed.slug);
    await ensureSlugAvailable(slug, id);

    const existing = await prisma.metaPage.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Meta page not found.");
    }

    const passwordHash = parsed.password
      ? hashMetaPassword(parsed.password)
      : existing.accessPasswordHash;

    ensurePublishable(parsed.status, parsed.dataEn, parsed.dataAr, passwordHash);

    await prisma.metaPage.update({
      where: { id },
      data: {
        slug,
        status: parsed.status,
        accessPasswordHash: passwordHash,
        showClient: parsed.showClient,
        showWallet: parsed.showWallet,
        showResults: parsed.showResults,
        showPlan: parsed.showPlan,
        dataEn: JSON.stringify(parsed.dataEn),
        dataAr: JSON.stringify(parsed.dataAr)
      }
    });

    revalidatePath("/dashboard/meta");
    revalidatePath(`/dashboard/meta/${id}/edit`);
    return { message: "Saved." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to update meta page." };
  }
};

export const unlockMeta = async (_prevState: ActionState, formData: FormData) => {
  try {
    const slug = formData.get("slug")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    if (!slug || !password) {
      return { error: "Password is required." };
    }
    const metaPage = await prisma.metaPage.findUnique({ where: { slug } });
    if (!metaPage || metaPage.status !== "PUBLISHED") {
      return { error: "Meta page not available." };
    }
    if (!metaPage.accessPasswordHash) {
      return { error: "Password is not configured." };
    }
    const hashed = hashMetaPassword(password);
    if (hashed !== metaPage.accessPasswordHash) {
      return { error: "Incorrect password." };
    }
    await setMetaAccess(slug);
    redirect(`/meta/${slug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Unable to unlock meta page." };
  }
};
