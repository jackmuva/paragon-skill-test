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
		// Fetch available actions from ActionKit API
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${projectId}/actions?format=json_schema&limit_to_available=true`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json(
				{ error: `ActionKit API error: ${error}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch actions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch actions from ActionKit" },
			{ status: 500 }
		);
	}
}
