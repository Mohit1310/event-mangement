import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/try-catch";

export async function GET() {
  const { data: events, error } = await tryCatch(
    prisma.event.findMany({
      orderBy: { date: "asc" },
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

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    description,
    slug,
    category,
    status,
    date,
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
    date,
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

  const { data: event, error } = await tryCatch(
    prisma.event.create({
      data: {
        title,
        description,
        slug,
        category,
        status,
        date: new Date(date),
        location,
        capacity,
        price,
        bannerUrl,
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
