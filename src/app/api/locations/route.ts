import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where = {
      ...(query.featured !== undefined && { featured: query.featured }),
    };

    const locations = await prisma.location.findMany({
      where,
      ...(query.limit && { take: query.limit }),
      orderBy: [
        { featured: "desc" },
        { propertyCount: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch locations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
