import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const getUploadConfig = () => {
  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");
  const publicBaseRaw = process.env.UPLOAD_PUBLIC_BASE ?? "/uploads";
  const publicBase = publicBaseRaw.startsWith("/")
    ? publicBaseRaw.replace(/\/$/, "")
    : `/${publicBaseRaw.replace(/\/$/, "")}`;
  return { uploadDir, publicBase };
};

const getPathname = (value: string) => {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name || "").toLowerCase();
  const safeExtension = /^[a-z0-9.]+$/.test(extension) ? extension : "";
  const filename = `${randomUUID()}${safeExtension}`;

  const { uploadDir, publicBase } = getUploadConfig();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const url = `${publicBase}/${filename}`.replace(/\/{2,}/g, "/");
  return NextResponse.json({ url });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { url?: string } | null = null;
  try {
    payload = (await request.json()) as { url?: string };
  } catch {
    payload = null;
  }

  const url = typeof payload?.url === "string" ? payload.url : "";
  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  const { uploadDir, publicBase } = getUploadConfig();
  const pathname = getPathname(url);
  if (!pathname.startsWith(publicBase)) {
    return NextResponse.json({ ok: true });
  }

  const relativePath = pathname.slice(publicBase.length).replace(/^\/+/, "");
  const resolvedUploadDir = path.resolve(uploadDir);
  const targetPath = path.resolve(uploadDir, relativePath);
  if (!targetPath.startsWith(resolvedUploadDir)) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  await fs.unlink(targetPath).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
