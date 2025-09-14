import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/try-catch";

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/events/[eventId]">,
) {
	const { userId } = await auth();

	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { eventId } = await ctx.params;

	const { data: event, error } = await tryCatch(
		prisma.event.findUnique({
			where: { id: eventId },
		}),
	);

	if (error || !event) {
		return NextResponse.json({ error: "Event not found" }, { status: 404 });
	}

	return NextResponse.json(event, { status: 200 });
}

// ✅ PATCH /api/events/:id → Update event
export async function PATCH(
	req: NextRequest,
	ctx: RouteContext<"/api/events/[eventId]">,
) {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { eventId } = await ctx.params;
	const body = await req.json();

	const { data: user, error: userError } = await tryCatch(
		prisma.user.findUnique({
			where: { clerkId },
		}),
	);

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const {
		title,
		description,
		slug,
		category,
		status,
		startDate,
		location,
		capacity,
		price,
	} = body;

	const requiredFields = [
		title,
		description,
		slug,
		category,
		status,
		startDate,
		location,
		capacity,
		price,
	];
	if (requiredFields.some((field) => !field)) {
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 },
		);
	}

	const { data: updatedEvent, error } = await tryCatch(
		prisma.event.update({
			where: {
				id_createdById: {
					id: eventId,
					createdById: user.id,
				},
			},
			data: { ...body, updatedAt: new Date() },
		}),
	);

	if (error) {
		return NextResponse.json(
			{ error: "Event not found or failed to update event" },
			{ status: 500 },
		);
	}

	return NextResponse.json(updatedEvent, { status: 200 });
}

export async function DELETE(
	_: NextRequest,
	ctx: RouteContext<"/api/events/[eventId]">,
) {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: user, error: userError } = await tryCatch(
		prisma.user.findUnique({
			where: { clerkId },
		}),
	);

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const { eventId } = await ctx.params;

	const { data: deleted, error } = await tryCatch(
		prisma.event.delete({
			where: {
				id_createdById: {
					id: eventId,
					createdById: user.id,
				},
			},
		}),
	);

	if (error) {
		return NextResponse.json(
			{ error: "Event not found or failed to delete event" },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{ message: "Event deleted successfully", deleted },
		{ status: 200 },
	);
}
