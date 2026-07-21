import prisma from "../prisma";

export async function searchContentFallback({ query, type, category, page = 1, perPage = 10 }) {
  const skip = (page - 1) * perPage;
  const take = parseInt(perPage, 10);
  
  const results = [];
  const facets = { types: [], categories: [] };
  
  // A naive implementation that checks post and page models only, as a fallback.
  // We avoid loading all records into memory.
  
  try {
    const commonSelect = { id: true, title: true, slug: true, updatedAt: true };
    const containsQuery = { contains: query };
    
    // Search Posts
    if (!type || type === "post") {
      const posts = await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          OR: [
            { title: containsQuery },
            { excerpt: containsQuery }
          ],
        },
        include: { categories: true, tags: true, featuredImage: true },
        skip,
        take,
        orderBy: { publishedAt: 'desc' }
      });
      
      posts.forEach(post => {
        results.push({
          id: `post:${post.id}`,
          sourceId: post.id,
          type: "post",
          title: post.title,
          highlightedTitle: post.title,
          summary: post.excerpt || "",
          highlightedSummary: post.excerpt || "",
          url: `/blogs/${post.slug}`,
          imageUrl: post.featuredImage?.url || "",
          category: post.categories?.[0]?.name || "",
          tags: post.tags?.map(t => t.name) || [],
          publishedAt: post.publishedAt ? Math.floor(new Date(post.publishedAt).getTime() / 1000) : null,
        });
      });
    }

    // Search Pages
    if (!type || type === "page") {
      const pages = await prisma.page.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          OR: [
            { title: containsQuery },
            { seoDescription: containsQuery }
          ],
        },
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
      });
      
      pages.forEach(page => {
        results.push({
          id: `page:${page.id}`,
          sourceId: page.id,
          type: "page",
          title: page.title,
          highlightedTitle: page.title,
          summary: page.seoDescription || "",
          highlightedSummary: page.seoDescription || "",
          url: page.slug === "home" ? "/" : `/${page.slug}`,
          imageUrl: page.ogImage || "",
          category: "",
          tags: [],
          publishedAt: page.publishedAt ? Math.floor(new Date(page.publishedAt).getTime() / 1000) : null,
        });
      });
    }

    // The fallback can be expanded to Recipes, Services, etc., but we limit to primary models to avoid heavy fallback load.

    return {
      hits: results,
      found: results.length, // Fallback doesn't do a full count easily without separate count queries
      page,
      perPage,
      totalPages: 1, // Simplified pagination for fallback
      facets,
    };
  } catch (error) {
    console.error("[SearchFallback] Prisma search fallback failed:", error);
    return { hits: [], found: 0, page: 1, perPage, totalPages: 0, facets };
  }
}
