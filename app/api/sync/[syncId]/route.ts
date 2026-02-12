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

// DELETE - Delete a sync
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ syncId: string }> }
) {
  const token = getParagonToken();
  const { syncId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: "Paragon credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://sync.useparagon.com/api/syncs/${syncId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to delete sync: ${error}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sync:", error);
    return NextResponse.json(
      { error: "Failed to delete sync" },
      { status: 500 }
    );
  }
}
