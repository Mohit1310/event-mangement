import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/try-catch";

export async function GET() {
  const { data: events, error } = await tryCatch(
    prisma.event.findMany({
      orderBy: { startDate: "asc" },
    }),
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }

  return NextResponse.json(events, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
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
    bannerUrl,
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

  const { data: user, error: userError } = await tryCatch(
    prisma.user.findUnique({ where: { clerkId } }),
  );

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: event, error } = await tryCatch(
    prisma.event.create({
      data: {
        title,
        description,
        slug,
        category,
        status,
        startDate: new Date(startDate),
        location,
        capacity,
        price,
        bannerUrl,
        createdById: user.id,
      },
    }),
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }

  return NextResponse.json(event, { status: 201 });
}
