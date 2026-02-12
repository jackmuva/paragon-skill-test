import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getParagonToken() {
  const projectId = process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;
  const signingKey = process.env.PARAGON_SIGNING_KEY;

  if (!projectId || !signingKey) {
    return null;
  }

  const userId = "demo-user-123";
  const currentTime = Math.floor(Date.now() / 1000);

  return jwt.sign(
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
}

// GET - List all syncs for the user
export async function GET() {
  const token = getParagonToken();

  if (!token) {
    return NextResponse.json(
      { error: "Paragon credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://sync.useparagon.com/api/syncs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Sync API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to list syncs:", error);
    return NextResponse.json(
      { error: "Failed to list syncs" },
      { status: 500 }
    );
  }
}

// POST - Enable a new sync
export async function POST(request: NextRequest) {
  const token = getParagonToken();

  if (!token) {
    return NextResponse.json(
      { error: "Paragon credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { integration, pipeline, configuration, configurationName } = body;

    if (!integration || !pipeline) {
      return NextResponse.json(
        { error: "Integration and pipeline are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://sync.useparagon.com/api/syncs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        integration,
        pipeline,
        configuration: configuration || {},
        configurationName: configurationName || "default",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to enable sync", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to enable sync:", error);
    return NextResponse.json(
      { error: "Failed to enable sync" },
      { status: 500 }
    );
  }
}
