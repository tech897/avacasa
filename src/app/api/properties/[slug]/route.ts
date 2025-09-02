import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
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

    // Connect to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Find property with location lookup
    const propertyResult = await db
      .collection("properties")
      .aggregate([
        {
          $match: {
            slug: slug,
            active: true,
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "locationId",
            foreignField: "_id",
            as: "location",
          },
        },
        {
          $addFields: {
            location: { $arrayElemAt: ["$location", 0] },
          },
        },
      ])
      .toArray();

    if (propertyResult.length === 0) {
      await client.close();
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const property = propertyResult[0];

    // Increment view count
    await db
      .collection("properties")
      .updateOne({ _id: property._id }, { $inc: { views: 1 } });

    await client.close();

    // Parse JSON fields safely to prevent crashes
    const parsedProperty = {
      ...property,
      id: property._id.toString(), // Convert MongoDB _id to string id
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
      // Transform location if it exists
      location: property.location
        ? {
            ...property.location,
            id: property.location._id?.toString(),
          }
        : null,
    };

    // Remove MongoDB _id field from the response
    delete (parsedProperty as any)._id;
    if (parsedProperty.location?._id) {
      delete (parsedProperty.location as any)._id;
    }

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
