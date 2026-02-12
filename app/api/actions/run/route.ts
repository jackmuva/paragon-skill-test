import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const projectId = process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;
  const signingKey = process.env.PARAGON_SIGNING_KEY;

  if (!projectId || !signingKey) {
    return NextResponse.json(
      { error: "Paragon credentials not configured" },
      { status: 500 }
    );
  }

  // In a real application, you would get the user ID from your auth system
  const userId = "demo-user-123";

  const currentTime = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      sub: userId,
      aud: `useparagon.com/${projectId}`,
      iat: currentTime,
      exp: currentTime + 60 * 60,
    },
    signingKey,
    {
      algorithm: "RS256",
    }
  );

  try {
    const body = await request.json();
    const { action, parameters } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action name is required" },
        { status: 400 }
      );
    }

    // Run action via ActionKit API
    const response = await fetch(
      `https://actionkit.useparagon.com/projects/${projectId}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          parameters: parameters || {},
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to run action", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to run action:", error);
    return NextResponse.json(
      { error: "Failed to run action" },
      { status: 500 }
    );
  }
}
