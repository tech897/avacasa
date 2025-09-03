import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(6),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Build MongoDB query
    const mongoQuery: any = {
      status: "PUBLISHED",
      active: true,
    };

    if (query.category && query.category !== "All") {
      mongoQuery.category = query.category;
    }

    if (query.featured !== undefined) {
      mongoQuery.featured = query.featured;
    }

    if (query.search) {
      mongoQuery.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { excerpt: { $regex: query.search, $options: "i" } },
        { content: { $regex: query.search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      db.collection("blog_posts")
        .find(mongoQuery)
        .sort({ featured: -1, publishedAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      db.collection("blog_posts").countDocuments(mongoQuery),
    ]);

    // Transform posts for frontend
    const transformedPosts = posts.map((post: any) => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [],
      featuredImage: post.featuredImage,
      featured: post.featured,
      views: post.views || 0,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    await client.close();

    // Calculate pagination info
    const totalPages = Math.ceil(total / query.limit);
    const hasNext = query.page < totalPages;
    const hasPrev = query.page > 1;

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Blog API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
