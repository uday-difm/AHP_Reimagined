import { NextResponse } from "next/server";
import { searchContent } from "@/lib/search/search.service";
import { sendResponse } from "@/lib/response"; // standard response helper if it exists, or we just use NextResponse

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const pageParam = searchParams.get("page");
    const perPageParam = searchParams.get("perPage");

    const query = q?.trim();
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: "Search query must be at least 2 characters long",
      }, { status: 400 });
    }

    if (query.length > 100) {
      return NextResponse.json({
        success: false,
        error: "Search query is too long",
      }, { status: 400 });
    }

    const allowedTypes = ["post", "page", "recipe", "service", "magazine", "quiz"];
    if (type && !allowedTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: "Invalid content type",
      }, { status: 400 });
    }

    let page = 1;
    if (pageParam) {
      page = parseInt(pageParam, 10);
      if (isNaN(page) || page < 1) {
        return NextResponse.json({ success: false, error: "Invalid page number" }, { status: 400 });
      }
    }

    let perPage = 10;
    if (perPageParam) {
      perPage = parseInt(perPageParam, 10);
      if (isNaN(perPage) || perPage < 1 || perPage > 30) {
        return NextResponse.json({ success: false, error: "Invalid perPage value (must be 1-30)" }, { status: 400 });
      }
    }

    const results = await searchContent({
      query,
      type,
      category,
      page,
      perPage,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("[SearchAPI] Error processing search request:", error);
    return NextResponse.json({
      success: false,
      error: "An internal server error occurred",
    }, { status: 500 });
  }
}
