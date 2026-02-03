import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

const contentTypeFor = (ext: string) => {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

export async function GET(
  _request: Request,
  context: { params: { path?: string[] } }
) {
  const { uploadDir, publicBase } = getUploadConfig();
  const parts = context.params.path ?? [];
  const relative = parts.join("/");
  if (!relative) {
    return new NextResponse("Not found", { status: 404 });
  }
  const targetPath = path.resolve(uploadDir, relative);
  const resolvedUploadDir = path.resolve(uploadDir);
  if (!targetPath.startsWith(resolvedUploadDir)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypeFor(ext),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Upload-Base": publicBase
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
