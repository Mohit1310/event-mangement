// app/api/events/[eventId]/tickets/route.ts

import { auth } from "@clerk/nextjs/server"; // or your auth provider
import { createId } from "@paralleldrive/cuid2";
import { type NextRequest, NextResponse } from "next/server";
import { EventRole, EventStatus, TicketStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ticketCreateSchema } from "@/lib/validators/ticket";
import { withErrorHandler } from "@/lib/with-error-handler";

export const POST = withErrorHandler(
	async (
		req: NextRequest,
		ctx: RouteContext<"/api/events/[eventId]/tickets">,
	) => {
		try {
			const { eventId } = await ctx.params;
			// 1. Auth check
			const { userId: clerkId } = await auth();
			if (!clerkId) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}

			const user = await prisma.user.findUnique({ where: { clerkId } });
			if (!user) {
				return NextResponse.json({ error: "User not found" }, { status: 404 });
			}
			const userId = user.id;

			// 2. Parse body
			const json = await req.json();
			const parsedResult = ticketCreateSchema.safeParse(json);
			if (!parsedResult.success) {
				return NextResponse.json(
					{ error: "Validation failed", details: parsedResult.error.issues },
					{ status: 400 },
				);
			}
			const { type } = parsedResult.data;

			// 3. Validate event
			const event = await prisma.event.findUnique({
				where: { id: eventId },
			});

			if (!event || event.status !== EventStatus.ACTIVE) {
				return NextResponse.json(
					{ error: "Event not found or inactive" },
					{ status: 404 },
				);
			}

			if (event.endDate < new Date()) {
				return NextResponse.json(
					{ error: "Event has already ended" },
					{ status: 400 },
				);
			}

			// 4. Capacity check
			const confirmedCount = await prisma.ticket.count({
				where: {
					eventId: eventId,
					status: { in: [TicketStatus.CONFIRMED, TicketStatus.USED] },
				},
			});

			if (confirmedCount >= event.capacity) {
				return NextResponse.json(
					{ error: "Event is sold out" },
					{ status: 409 },
				);
			}

			const qrCode = createId();

			// 5. Create ticket + ensure participant inside a transaction
			const result = await prisma.$transaction(async (tx) => {
				const ticket = await tx.ticket.create({
					data: {
						eventId: eventId,
						userId,
						type,
						status: TicketStatus.CONFIRMED, // MVP = directly confirmed
						qrCode,
					},
				});

				// Ensure EventParticipant exists
				await tx.eventParticipant.upsert({
					where: {
						eventId_userId: {
							eventId: eventId,
							userId,
						},
					},
					update: {}, // no update needed
					create: {
						eventId: eventId,
						userId,
						role: EventRole.attendee,
					},
				});

				return ticket;
			});

			// 6. Return created ticket
			return NextResponse.json(result, { status: 201 });
		} catch {
			return NextResponse.json(
				{ error: "Failed to purchase ticket" },
				{ status: 500 },
			);
		}
	},
);

export const GET = withErrorHandler(
	async (
		_: NextRequest,
		ctx: RouteContext<"/api/events/[eventId]/tickets">,
	) => {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find logged-in user in our DB
		const user = await prisma.user.findUnique({ where: { clerkId } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const params = await ctx.params;

		// Verify event exists and is created by logged-in user
		const event = await prisma.event.findUnique({
			where: { id: params.eventId },
		});
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}
		if (event.createdById !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const tickets = await prisma.ticket.findMany({
			where: { eventId: event.id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json(tickets);
	},
);
