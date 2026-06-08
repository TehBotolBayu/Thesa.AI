import fetch from "node-fetch";
import { SEARCH_URL } from "../const/semanticapi.js";
import { searchArxiv } from "./arxivService.js";
import { logDev } from "../lib/logger.js";

// 1. Define the tool schema
export const tools = [
  {
    type: "function",
    function: {
      name: "searchAcademicPapers",
      description: "Search Semantic Scholar and Arxiv for research papers. Provide at least 3 distinct queries for comprehensive results.",
      parameters: {
        type: "object",
        properties: {
          queries: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of 3 or more distinct research topics or keywords to ensure diverse and comprehensive coverage.",
          },
        },
        required: ["queries"],
      },
    },
  },
];

// 2. Map function names → real functions
export const namesToFunctions = {
  searchAcademicPapers: async ({ queries }) => {
    try {
      logDev(`[toolCallingService] Fetching papers for queries:`, queries);

      const allResults = [];
      const fetchPromises = queries.map(async (query) => {
        let semanticData = [];
        let arxivData = [];

        try {
          let urlfetch = process.env.SEMANTIC_SCHOLAR_API_URL + SEARCH_URL(query);
          urlfetch = urlfetch.replace(/ /g, "%20");

          const res = await fetch(urlfetch, {
            method: "GET",
            headers: {
              "x-api-key": process.env.SEMANTIC_SCHOLAR_KEY_API,
            },
          });
          const data = await res.json();
          logDev("Semantic Scholar Result: ", JSON.stringify(data));
          if (data && data.data) {
            semanticData = data.data.map((paper) => ({
              title: paper.title,
              abstract: paper.abstract,
              isOpenAccess: paper.isOpenAccess,
              pdfUrl: paper.openAccessPdf?.url || null,
              authors: paper.authors?.map((a) => a.name) || [],
              source: "Semantic Scholar",
            }));
          }
        } catch (e) {
          console.error(`Error fetching Semantic Scholar for ${query}:`, e.message);
        }

        try {
          arxivData = await searchArxiv(query);
          if (arxivData && arxivData.length > 0) {
            arxivData = arxivData.map(p => ({ ...p, source: "Arxiv" }));
          }
        } catch (e) {
          console.error(`Error fetching Arxiv for ${query}:`, e.message);
        }

        return [...semanticData, ...arxivData];
      });

      const resultsArrays = await Promise.all(fetchPromises);
      resultsArrays.forEach(arr => allResults.push(...arr));

      // Deduplicate results based on title (case-insensitive)
      const uniquePapersMap = new Map();
      allResults.forEach(paper => {
        if (!paper.title || !paper.abstract) return; // skip empty
        const key = paper.title.toLowerCase().trim();
        if (!uniquePapersMap.has(key)) {
          uniquePapersMap.set(key, paper);
        } else {
          // If we already have it, prefer the one with a PDF URL if the current one doesn't have it
          const existing = uniquePapersMap.get(key);
          if (!existing.pdfUrl && paper.pdfUrl) {
            uniquePapersMap.set(key, paper);
          }
        }
      });

      let resultData = Array.from(uniquePapersMap.values());

      // Assign IDs
      resultData = resultData.map((paper, index) => ({
        ...paper,
        id: index,
      }));

      logDev(`[toolCallingService] resultData: ${JSON.stringify({ titles: resultData.map(x => x.title), count: resultData.length }, null, 2)}`)
      return JSON.stringify({ data: resultData, queries });
    } catch (err) {
      console.error("[toolCallingService] Error in searchAcademicPapers:", err);
      return JSON.stringify([{
        error: err.message,
        title: "",
        abstract: "",
        isOpenAccess: false,
        pdfUrl: "",
        authors: [],
      }]);
    }
  },
};
