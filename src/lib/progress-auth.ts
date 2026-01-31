import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHmac } from "crypto";

const PROGRESS_COOKIE = "pb_progress";

type ProgressAccessPayload = {
  slug: string;
};

const secretKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
};

const hmacSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
};

export const hashProgressPassword = (password: string) =>
  createHmac("sha256", hmacSecret()).update(password).digest("hex");

const signProgressToken = async (payload: ProgressAccessPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
};

const verifyProgressToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as ProgressAccessPayload;
  } catch {
    return null;
  }
};

export const setProgressAccess = async (slug: string) => {
  const token = await signProgressToken({ slug });
  cookies().set(PROGRESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
};

export const hasProgressAccess = async (slug: string) => {
  const token = cookies().get(PROGRESS_COOKIE)?.value;
  if (!token) {
    return false;
  }
  const payload = await verifyProgressToken(token);
  return payload?.slug === slug;
};
