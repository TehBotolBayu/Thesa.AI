import { embeddings } from "../llm/model";
import { pinecone } from "@/config/pinecone";
import { unicodeToAscii } from "@/lib/general/parser";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const queryPineCone = async (indexName, userQuery, namespace) => {
  let relevantContext = "";
  try {
    const index = pinecone.index(indexName);
    // Create query embedding
    const queryEmbedding = await embeddings.embedQuery(userQuery);
    // Query Pinecone for similar documents
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
      namespace: namespace,
    });
    // Extract relevant context from retrieved documents
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const contextParts = queryResponse.matches
        .filter((match) => match.score && match.score > 0.7) // Only use relevant matches
        .map((match) => match.metadata?.content || "")
        .filter((content) => typeof content === "string" && content.length > 0);

      relevantContext = contextParts.join("\n\n");
      console.log(
        `Retrieved ${contextParts.length} relevant medical documents from Pinecone`
      );
    }

  } catch (pineconeError) {
    console.warn(
      "Pinecone query failed, proceeding without context:",
      pineconeError
    );
  }
  return relevantContext;
};

export const batchUpsertPineCone = async (title, content, namespace) => {
  try {
    // Get Pinecone index
    const index = pinecone.index("convi");
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitText(content);
    // Generate embeddings for each chunk
    const embeddingPromises = chunks.map((chunk) =>
      embeddings.embedQuery(chunk)
    );
    const embeddingsList = await Promise.all(embeddingPromises);
    // Store embeddings in Pinecone with metadata
    let cleanedtitle = unicodeToAscii(title);
    console.log("cleanedtitle:", cleanedtitle);
    const vectors = chunks.map((chunk, i) => ({
      id: `${cleanedtitle.replace(/ /g, "-")}-${i}-${Date.now()}`,
      values: embeddingsList[i],
      metadata: {
        title: cleanedtitle,
        content: chunk,
        chunkIndex: i,
        totalChunks: chunks.length,
        timestamp: new Date().toISOString(),
      },
    }));
    // Upsert vectors into Pinecone with namespace (if provided)
    console.log("namespace:", namespace);
    const namespaceIndex = index.namespace(namespace);
    await namespaceIndex.upsert(vectors);
    console.log(
      `Successfully stored document "${title}" with ${
        chunks.length
      } chunks in Pinecone (namespace: ${namespace || "default"})`
    );

    return { success: true, message: "Successfully stored document in Pinecone" };
  } catch (error) {
    console.error("Error upserting Pinecone:", error);
  }
};
