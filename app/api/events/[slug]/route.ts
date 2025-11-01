import { NextRequest, NextResponse } from "next/server";
import { models, Model } from "mongoose";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params to extract slug
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }


    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        {
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }


    await connectDB();

    // Get Event model (ensures it's initialized after DB connection)
    const EventModel = (models.Event || Event) as Model<IEvent>;

    // Query event by slug
    const event: IEvent | null = await EventModel.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching event by slug:", error);

    if (error instanceof Error) {
      if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
        return NextResponse.json(
          { message: "Database connection failed" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          message: "Failed to fetch event",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
