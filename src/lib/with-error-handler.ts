import { type NextRequest, NextResponse } from "next/server";

// Higher-order handler wrapper
export function withErrorHandler<
	T extends (req: NextRequest, ...args: any[]) => Promise<Response>,
>(handler: T) {
	return async (req: NextRequest, ...args: any[]): Promise<Response> => {
		try {
			return await handler(req, ...args);
		} catch {
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	};
}
