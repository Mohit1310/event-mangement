import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";

// Zod schema
const validateTicketSchema = z.object({
	qrCode: z.string().min(1, "QR code is required"),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
	// 1. Auth check (organizer or staff usually does this)
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// 2. Parse body
	const body = await req.json();
	const { qrCode } = validateTicketSchema.parse(body);

	// 3. Find ticket
	const ticket = await prisma.ticket.findUnique({
		where: { qrCode },
		include: {
			event: true,
			user: true,
		},
	});

	if (!ticket) {
		return NextResponse.json({ error: "Invalid ticket" }, { status: 404 });
	}

	// 4. Check if already used
	if (ticket.status === TicketStatus.USED) {
		return NextResponse.json({ error: "Ticket already used" }, { status: 400 });
	}

	// 5. Mark as used
	const updatedTicket = await prisma.ticket.update({
		where: { id: ticket.id },
		data: { status: TicketStatus.USED },
	});

	return NextResponse.json({
		success: true,
		message: "Ticket validated successfully",
		ticket: {
			id: updatedTicket.id,
			event: ticket.event.title,
			user: ticket.user.email,
			status: updatedTicket.status,
		},
	});
});
