import fetch from "node-fetch";
import { SEARCH_URL } from "../const/semanticapi.js";

// 1. Define the tool schema
export const tools = [
  {
    type: "function",
    function: {
      name: "searchSemanticScholar",
      description: "Search Semantic Scholar for research papers",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Research topic or keywords",
          },
        },
        required: ["query"],
      },
    },
  },
];

// 2. Map function names → real functions
export const namesToFunctions = {
  searchSemanticScholar: async ({ query }) => {
    try {
      let urlfetch = process.env.SEMANTIC_SCHOLAR_API_URL + SEARCH_URL(query);
      urlfetch = urlfetch.replace(/ /g, "%20");
      console.log("Fetching URL:", urlfetch);
      const res = await fetch(urlfetch);
      const data = await res.json();
      console.log("Papers found:", data?.data.length || 0);
      return JSON.stringify(
        data.data.map((paper) => ({
          title: paper.title,
          abstract: paper.abstract,
          isOpenAccess: paper.isOpenAccess,
          pdfUrl: paper.openAccessPdf?.url || null,
          authors: paper.authors?.map((a) => a.name),
        }))
      );
    } catch (err) {
      return JSON.stringify({ error: err.message });
    }
  },
};