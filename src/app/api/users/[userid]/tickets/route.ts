import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(
	async (_: NextRequest, ctx: RouteContext<"/api/users/[userid]/tickets">) => {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const params = await ctx.params;

		// Find logged-in user in our DB
		const user = await prisma.user.findUnique({ where: { clerkId } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Ensure user can only see their own tickets
		if (user.id !== params.userid) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const tickets = await prisma.ticket.findMany({
			where: { userId: user.id },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						startDate: true,
						endDate: true,
						location: true,
					},
				},
			},
		});

		return NextResponse.json(tickets);
	},
);
