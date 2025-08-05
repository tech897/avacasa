import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const location = await prisma.location.findUnique({
      where: {
        slug: slug,
        active: true,
      },
      include: {
        properties: {
          where: {
            active: true,
            status: "AVAILABLE",
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            images: true,
            amenities: true,
            features: true,
            coordinates: true,
            featured: true,
            views: true,
            createdAt: true,
            updatedAt: true,
            status: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
        },
        { status: 404 }
      );
    }

    // Calculate real property count
    const propertyCount = location.properties.length;

    // Calculate average rating (mock for now, can be enhanced with actual reviews)
    const avgRating = 4.8; // This would come from actual reviews in the future

    // Parse JSON fields
    const locationData = {
      ...location,
      coordinates: JSON.parse(location.coordinates || '{"lat": 0, "lng": 0}'),
      highlights: JSON.parse(location.highlights || "[]"),
      amenities: JSON.parse(location.amenities || "[]"),
      propertyCount,
      avgRating,
      properties: location.properties.map((property) => ({
        ...property,
        price: parseFloat(property.price),
        images: JSON.parse(property.images || "[]"),
        amenities: JSON.parse(property.amenities || "[]"),
        features: JSON.parse(property.features || "[]"),
        coordinates: property.coordinates
          ? JSON.parse(property.coordinates)
          : null,
        location: {
          id: location.id,
          name: location.name,
          slug: location.slug,
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: locationData,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
