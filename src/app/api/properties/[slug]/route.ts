import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  parseArray,
  parseObject,
  parseCoordinates,
  parseNearbyInfrastructure,
} from "@/lib/utils/json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const property = await prisma.property.findUnique({
      where: {
        slug: slug,
        active: true,
      },
      include: {
        location: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    });

    // Parse JSON fields safely to prevent crashes
    const parsedProperty = {
      ...property,
      price: parseFloat(property.price) || 0,
      images: parseArray(property.images),
      amenities: parseArray(property.amenities),
      features: parseArray(property.features),
      coordinates: parseCoordinates(property.coordinates),
      nearbyInfrastructure: parseNearbyInfrastructure(
        property.nearbyInfrastructure
      ),
      unitConfiguration: parseObject(property.unitConfiguration),
      legalApprovals: parseObject(property.legalApprovals),
      registrationCosts: parseObject(property.registrationCosts),
      investmentBenefits: parseArray(property.investmentBenefits),
      tags: parseArray(property.tags),
      // Keep text fields as strings (don't parse as JSON)
      propertyManagement: property.propertyManagement || "",
      financialReturns: property.financialReturns || "",
      emiOptions: property.emiOptions || "",
    };

    return NextResponse.json({
      success: true,
      data: parsedProperty,
    });
  } catch (error) {
    console.error("Property fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
