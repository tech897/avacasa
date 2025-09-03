import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Find the blog post
    const post = await db.collection("blog_posts").findOne({
      slug: slug,
      status: "PUBLISHED",
      active: true,
    });

    if (!post) {
      await client.close();
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Get related posts (same category, excluding current post)
    const relatedPosts = await db
      .collection("blog_posts")
      .find({
        category: post.category,
        slug: { $ne: slug },
        status: "PUBLISHED",
        active: true,
      })
      .sort({ publishedAt: -1 })
      .limit(3)
      .toArray();

    // Transform the post
    const transformedPost = {
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
    };

    // Transform related posts
    const transformedRelatedPosts = relatedPosts.map((relatedPost: any) => ({
      id: relatedPost._id.toString(),
      title: relatedPost.title,
      slug: relatedPost.slug,
      excerpt: relatedPost.excerpt,
      author: relatedPost.author,
      category: relatedPost.category,
      featuredImage: relatedPost.featuredImage,
      publishedAt: relatedPost.publishedAt,
    }));

    // Increment view count
    await db.collection("blog_posts").updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      data: transformedPost,
      relatedPosts: transformedRelatedPosts,
    });
  } catch (error) {
    console.error("Blog post fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
