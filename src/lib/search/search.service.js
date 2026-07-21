import { getTypesenseClient, isTypesenseConfigured } from "../typesense";
import { searchContentFallback } from "./prismaSearchFallback";

export async function searchContent({ query, type, category, page = 1, perPage = 10 }) {
  if (!isTypesenseConfigured()) {
    console.warn("[SearchService] Typesense is not configured. Falling back to Prisma search.");
    return searchContentFallback({ query, type, category, page, perPage });
  }

  const client = getTypesenseClient();

  try {
    const searchParams = {
      q: query,
      query_by: "title,summary,content,category,tags",
      query_by_weights: "10,6,2,4,3",
      prefix: "true,true,false,true,true",
      typo_tokens_threshold: 1,
      num_typos: 2,
      facet_by: "type,category",
      sort_by: "_text_match:desc,publishedAt:desc",
      highlight_full_fields: "title,summary",
      highlight_affix_num_tokens: 8,
      page,
      per_page: perPage,
    };

    const filterBy = [];
    if (type) {
      filterBy.push(`type:=[${type}]`);
    }
    if (category) {
      filterBy.push(`category:=[${category}]`);
    }

    if (filterBy.length > 0) {
      searchParams.filter_by = filterBy.join(" && ");
    }

    const searchResults = await client.collections("content").documents().search(searchParams);

    return {
      hits: searchResults.hits.map((hit) => {
        const doc = hit.document;
        return {
          id: doc.id,
          sourceId: doc.sourceId,
          type: doc.type,
          title: doc.title,
          highlightedTitle: hit.highlights?.find((h) => h.field === "title")?.snippet || doc.title,
          summary: doc.summary,
          highlightedSummary: hit.highlights?.find((h) => h.field === "summary")?.snippet || doc.summary,
          url: doc.url,
          imageUrl: doc.imageUrl,
          category: doc.category,
          tags: doc.tags,
          publishedAt: doc.publishedAt,
        };
      }),
      found: searchResults.found,
      page: searchResults.page,
      perPage: searchParams.per_page,
      totalPages: Math.ceil(searchResults.found / searchParams.per_page),
      facets: {
        types: searchResults.facet_counts?.find((f) => f.field_name === "type")?.counts || [],
        categories: searchResults.facet_counts?.find((f) => f.field_name === "category")?.counts || [],
      },
    };
  } catch (error) {
    console.warn("[SearchService] Typesense search failed. Falling back to Prisma.", error.message);
    return searchContentFallback({ query, type, category, page, perPage });
  }
}
