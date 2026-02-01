import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHmac } from "crypto";

const META_COOKIE = "pb_meta";

type MetaAccessPayload = {
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

export const hashMetaPassword = (password: string) =>
  createHmac("sha256", hmacSecret()).update(password).digest("hex");

const signMetaToken = async (payload: MetaAccessPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
};

const verifyMetaToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as MetaAccessPayload;
  } catch {
    return null;
  }
};

export const setMetaAccess = async (slug: string) => {
  const token = await signMetaToken({ slug });
  cookies().set(META_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
};

export const hasMetaAccess = async (slug: string) => {
  const token = cookies().get(META_COOKIE)?.value;
  if (!token) {
    return false;
  }
  const payload = await verifyMetaToken(token);
  return payload?.slug === slug;
};
