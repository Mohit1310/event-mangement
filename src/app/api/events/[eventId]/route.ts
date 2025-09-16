import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { EventStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/try-catch";
import {
	type EventUpdateInput,
	eventUpdateSchema,
} from "@/lib/validators/event";
import { withErrorHandler } from "@/lib/with-error-handler";

// ✅ GET /api/events/:id → Fetch event by ID
export const GET = withErrorHandler(async (_: NextRequest, ctx) => {
	const { userId } = await auth();
	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { eventId } = ctx.params;

	const { data: event, error } = await tryCatch(
		prisma.event.findUnique({ where: { id: eventId } }),
	);

	if (error || !event) {
		return NextResponse.json({ error: "Event not found" }, { status: 404 });
	}

	return NextResponse.json(event, { status: 200 });
});

// ✅ PATCH /api/events/:id → Update event
export const PATCH = withErrorHandler(async (req: NextRequest, ctx) => {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { eventId } = ctx.params;

	const { data: user, error: userError } = await tryCatch(
		prisma.user.findUnique({ where: { clerkId } }),
	);

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const json = await req.json();

	const parsedResult = eventUpdateSchema.safeParse(json);
	if (!parsedResult.success) {
		return NextResponse.json(
			{ error: "Validation failed", details: parsedResult.error.issues },
			{ status: 400 },
		);
	}

	const body: EventUpdateInput = parsedResult.data;

	const { data: updatedEvent, error } = await tryCatch(
		prisma.event.update({
			where: {
				id_createdById: {
					id: eventId,
					createdById: user.id,
				},
				status: {
					not: EventStatus.DELETED,
				},
			},
			data: { ...body, updatedAt: new Date() },
		}),
	);

	if (error) {
		return NextResponse.json({ error: "Event not found" }, { status: 404 });
	}

	return NextResponse.json(updatedEvent, { status: 200 });
});

// ✅ DELETE /api/events/:id → Soft delete event
export const DELETE = withErrorHandler(async (_: NextRequest, ctx) => {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: user, error: userError } = await tryCatch(
		prisma.user.findUnique({ where: { clerkId } }),
	);

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const { eventId } = ctx.params;

	const { data: deletedEvent, error } = await tryCatch(
		prisma.event.update({
			where: {
				id_createdById: {
					id: eventId,
					createdById: user.id,
				},
			},
			data: { status: EventStatus.DELETED },
		}),
	);

	if (error) {
		return NextResponse.json(
			{ error: "Event not found or failed to delete event" },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{ message: "Event deleted successfully", deleted: deletedEvent },
		{ status: 200 },
	);
});
