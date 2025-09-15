import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/try-catch";
import {
	type EventCreateInput,
	eventCreateSchema,
} from "@/lib/validators/event";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async () => {
	const { data: events, error } = await tryCatch(
		prisma.event.findMany({ orderBy: { startDate: "asc" } }),
	);

	if (error) {
		return NextResponse.json(
			{ error: "Failed to fetch events" },
			{ status: 500 },
		);
	}

	return NextResponse.json(events, { status: 200 });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const json = await req.json();

	const parseResult = eventCreateSchema.safeParse(json);
	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Validation failed", details: parseResult.error.issues },
			{ status: 400 },
		);
	}

	const data: EventCreateInput = parseResult.data;

	const { data: user, error: userError } = await tryCatch(
		prisma.user.findUnique({ where: { clerkId } }),
	);
	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const { data: event, error } = await tryCatch(
		prisma.event.create({ data: { ...data, createdById: user.id } }),
	);
	if (error) {
		return NextResponse.json(
			{ error: "Failed to create event" },
			{ status: 500 },
		);
	}

	return NextResponse.json(event, { status: 201 });
});
