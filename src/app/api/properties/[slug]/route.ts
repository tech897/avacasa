import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Parse nearbyInfrastructure and convert strings to proper arrays
    let nearbyInfrastructure = null;
    if (property.nearbyInfrastructure) {
      try {
        const parsed = JSON.parse(property.nearbyInfrastructure);
        nearbyInfrastructure = {
          educational: parsed.education
            ? parsed.education
                .split(",")
                .filter((item: string) => item.trim())
                .map((item: string) => ({
                  name: item.trim(),
                  distance: "Contact for details",
                }))
            : [],
          healthcare: parsed.healthcare
            ? parsed.healthcare
                .split(",")
                .filter((item: string) => item.trim())
                .map((item: string) => ({
                  name: item.trim(),
                  distance: "Contact for details",
                }))
            : [],
          shopping: parsed.shopping
            ? parsed.shopping
                .split(",")
                .filter((item: string) => item.trim())
                .map((item: string) => ({
                  name: item.trim(),
                  distance: "Contact for details",
                }))
            : [],
          transportation: parsed.transport
            ? [
                ...(parsed.transport.airport
                  ? [
                      {
                        name: `Airport: ${parsed.transport.airport}`,
                        distance: "Contact for details",
                      },
                    ]
                  : []),
                ...(parsed.transport.bus
                  ? [
                      {
                        name: `Bus: ${parsed.transport.bus}`,
                        distance: "Contact for details",
                      },
                    ]
                  : []),
                ...(parsed.transport.train
                  ? [
                      {
                        name: `Train: ${parsed.transport.train}`,
                        distance: "Contact for details",
                      },
                    ]
                  : []),
                ...(parsed.transport.highway
                  ? [
                      {
                        name: `Highway: ${parsed.transport.highway}`,
                        distance: "Contact for details",
                      },
                    ]
                  : []),
              ]
            : [],
          attractions: parsed.attractions || [],
        };
      } catch (e) {
        nearbyInfrastructure = {
          educational: [],
          healthcare: [],
          shopping: [],
          transportation: [],
          attractions: [],
        };
      }
    }

    // Parse JSON fields
    const parsedProperty = {
      ...property,
      price: parseFloat(property.price),
      images: JSON.parse(property.images || "[]"),
      amenities: JSON.parse(property.amenities || "[]"),
      features: JSON.parse(property.features || "[]"),
      coordinates: property.coordinates
        ? JSON.parse(property.coordinates)
        : null,
      unitConfiguration: property.unitConfiguration
        ? JSON.parse(property.unitConfiguration)
        : null,
      legalApprovals: property.legalApprovals
        ? JSON.parse(property.legalApprovals)
        : null,
      registrationCosts: property.registrationCosts
        ? JSON.parse(property.registrationCosts)
        : null,
      propertyManagement: property.propertyManagement
        ? JSON.parse(property.propertyManagement)
        : null,
      financialReturns: property.financialReturns
        ? JSON.parse(property.financialReturns)
        : null,
      investmentBenefits: property.investmentBenefits
        ? JSON.parse(property.investmentBenefits)
        : null,
      nearbyInfrastructure,
      emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
      tags: property.tags ? JSON.parse(property.tags) : null,
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
