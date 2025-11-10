import { XMLParser } from 'fast-xml-parser';

export async function searchArxiv(query, start = 0, maxResults = 1) {
  const baseUrl = 'https://export.arxiv.org/api/query';
  const url = `${baseUrl}?search_query=all:${encodeURIComponent(query)}&start=${start}&max_results=${maxResults}&sortOrder=descending&sortBy=relevance`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const data = parser.parse(xmlText);

    // Extract entries safely
    const entries = data.feed.entry ? (Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry]) : [];

    const results = entries.map(entry => {
      const title = entry.title || '';
      const abstract = entry.summary || '';
      const authors = Array.isArray(entry.author)
        ? entry.author.map(a => a.name)
        : [entry.author?.name].filter(Boolean);
      const pdfLink = Array.isArray(entry.link)
        ? entry.link.find(l => l.title === 'pdf')?.href
        : entry.link?.href;
      const isOpenAccess = !!pdfLink;

      return {
        title,
        abstract,
        authors,
        pdfUrl: pdfLink || '',
        isOpenAccess,
      };
    });

    return results;
  } catch (error) {
    console.error('Error fetching arXiv data:', error);
    return [];
  }
}
