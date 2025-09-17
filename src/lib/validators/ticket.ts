import { z } from "zod";
import { TicketType } from "@/generated/prisma";

export const ticketCreateSchema = z.object({
	type: z.enum(TicketType).default(TicketType.GENERAL),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
