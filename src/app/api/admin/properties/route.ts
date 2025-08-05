import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      include: {
        location: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse JSON fields for each property
    const parsedProperties = properties.map((property) => ({
      ...property,
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
      nearbyInfrastructure: property.nearbyInfrastructure
        ? JSON.parse(property.nearbyInfrastructure)
        : null,
      emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
      tags: property.tags ? JSON.parse(property.tags) : null,
    }));

    return NextResponse.json({ properties: parsedProperties });
  } catch (error) {
    console.error("Properties fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Prepare data for database insertion
    const propertyData = {
      ...data,
      images: JSON.stringify(data.images || []),
      amenities: JSON.stringify(data.amenities || []),
      features: JSON.stringify(data.features || []),
      coordinates: data.coordinates ? JSON.stringify(data.coordinates) : null,
      unitConfiguration: data.unitConfiguration
        ? JSON.stringify(data.unitConfiguration)
        : null,
      legalApprovals: data.legalApprovals
        ? JSON.stringify(data.legalApprovals)
        : null,
      registrationCosts: data.registrationCosts
        ? JSON.stringify(data.registrationCosts)
        : null,
      propertyManagement: data.propertyManagement
        ? JSON.stringify(data.propertyManagement)
        : null,
      financialReturns: data.financialReturns
        ? JSON.stringify(data.financialReturns)
        : null,
      investmentBenefits: data.investmentBenefits
        ? JSON.stringify(data.investmentBenefits)
        : null,
      nearbyInfrastructure: data.nearbyInfrastructure
        ? JSON.stringify(data.nearbyInfrastructure)
        : null,
      emiOptions: data.emiOptions ? JSON.stringify(data.emiOptions) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      possessionDate: data.possessionDate
        ? new Date(data.possessionDate)
        : null,
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update location property count
    if (property.active && property.status === "AVAILABLE") {
      const propertyCount = await prisma.property.count({
        where: {
          locationId: property.locationId,
          active: true,
          status: "AVAILABLE",
        },
      });

      await prisma.location.update({
        where: { id: property.locationId },
        data: { propertyCount },
      });
    }

    // Parse JSON fields for response
    const parsedProperty = {
      ...property,
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
      nearbyInfrastructure: property.nearbyInfrastructure
        ? JSON.parse(property.nearbyInfrastructure)
        : null,
      emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
      tags: property.tags ? JSON.parse(property.tags) : null,
    };

    return NextResponse.json({ property: parsedProperty });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
