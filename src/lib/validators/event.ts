import { z } from "zod";
import { EventStatus } from "@/generated/prisma";

export const eventCreateSchema = z
	.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().optional(),
		slug: z
			.string()
			.min(1, "Slug is required")
			.regex(
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
				"Slug must be lowercase letters, numbers, separated by single hyphens",
			),
		category: z.string().min(1, "Category is required"),
		startDate: z.coerce.date("Start date is required"),
		endDate: z.coerce.date("End date is required"),
		location: z.string().min(1, "Location is required"),
		capacity: z.number().int().positive("Capacity must be a greater than zero"),
		price: z.number().nonnegative("Price must be zero or greater"),
		bannerUrl: z.url().optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be greater than start date",
		path: ["endDate"],
	});

export const eventUpdateSchema = eventCreateSchema
	.safeExtend({
		status: z.enum(EventStatus),
	})
	.partial();

// 👇 Types inferred from schemas
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
