import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const projectId = process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;
  const signingKey = process.env.PARAGON_SIGNING_KEY;

  if (!projectId || !signingKey) {
    return NextResponse.json(
      { error: "Paragon credentials not configured" },
      { status: 500 }
    );
  }

  // In a real application, you would get the user ID from your auth system
  // For demo purposes, we use a static user ID
  const userId = "demo-user-123";

  const currentTime = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      sub: userId,
      aud: `useparagon.com/${projectId}`,
      iat: currentTime,
      exp: currentTime + 60 * 60, // 1 hour from now
    },
    signingKey,
    {
      algorithm: "RS256",
    }
  );

  return NextResponse.json({ token });
}
