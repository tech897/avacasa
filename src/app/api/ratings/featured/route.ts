import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch top 3 approved ratings with highest ratings and helpful votes
    const ratings = await prisma.rating.findMany({
      where: {
        status: "APPROVED",
        verified: true,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { helpful: "desc" }, { createdAt: "desc" }],
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("Error fetching featured ratings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured ratings",
      },
      { status: 500 }
    );
  }
}
