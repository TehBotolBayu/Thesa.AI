/**
 * Simple BM25 implementation for local retrieval.
 */
export class BM25 {
  constructor(corpus) {
    this.k1 = 1.2;
    this.b = 0.75;
    this.documents = corpus.map(doc => ({
      id: doc.id,
      text: (doc.title + " " + doc.abstract).toLowerCase()
    }));
    
    this.docCount = this.documents.length;
    this.avgDocLength = 0;
    this.docLengths = {};
    this.termFrequencies = {}; // docId -> { term: count }
    this.docFrequencies = {}; // term -> doc count
    
    this._initialize();
  }

  _tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  _initialize() {
    let totalLength = 0;

    this.documents.forEach(doc => {
      const tokens = this._tokenize(doc.text);
      this.docLengths[doc.id] = tokens.length;
      totalLength += tokens.length;

      this.termFrequencies[doc.id] = {};
      const uniqueTerms = new Set(tokens);

      tokens.forEach(term => {
        this.termFrequencies[doc.id][term] = (this.termFrequencies[doc.id][term] || 0) + 1;
      });

      uniqueTerms.forEach(term => {
        this.docFrequencies[term] = (this.docFrequencies[term] || 0) + 1;
      });
    });

    this.avgDocLength = this.docCount > 0 ? totalLength / this.docCount : 0;
  }

  _idf(term) {
    const df = this.docFrequencies[term] || 0;
    // Standard BM25 IDF formula
    return Math.log(1 + (this.docCount - df + 0.5) / (df + 0.5));
  }

  search(query) {
    const tokens = this._tokenize(query);
    const scores = [];

    this.documents.forEach(doc => {
      let score = 0;
      const docId = doc.id;
      const docLen = this.docLengths[docId];

      tokens.forEach(term => {
        const tf = this.termFrequencies[docId][term] || 0;
        if (tf > 0) {
          const idf = this._idf(term);
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
          score += idf * (numerator / denominator);
        }
      });

      scores.push({ id: docId, score });
    });

    return scores.sort((a, b) => b.score - a.score);
  }
}
