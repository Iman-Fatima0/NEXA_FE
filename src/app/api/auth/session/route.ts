import { NextResponse } from "next/server";

const SESSION_COOKIE = "nexa_session";
const ACCESS_COOKIE = "nexa_access_token";
const ONE_WEEK_S = 60 * 60 * 24 * 7;

type SessionBody = {
  email?: string;
  password?: string;
  accessToken?: string;
};

export async function POST(request: Request) {
  let body: SessionBody | null = null;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    body = null;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK_S,
    secure: process.env.NODE_ENV === "production",
  });

  const token = body?.accessToken?.trim();
  if (token) {
    res.cookies.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_WEEK_S,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
