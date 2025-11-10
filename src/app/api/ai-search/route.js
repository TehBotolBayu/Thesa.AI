export const runtime = "nodejs"; // IMPORTANT: disable edge runtime
import { getAIPaperResponse } from "@/services/ai.service";
import { NextResponse } from "next/server";
import { bulkCreatePapers } from "@/services/supabase/paperData.service";
import { extractPdfTextFromUrl } from "@/lib/paperPDFUtil";

export async function POST(req) {
  try {
    const { serialized, message, chatbotId } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const prompt = `${message}`;
    const response = await getAIPaperResponse(prompt, serialized);

    const paperData = await response?.toolResult;

    // parse text from paper data pdfUrl
    const pdfTexts = [];
    for (const paper of paperData) {
      if (!paper.pdfUrl) continue;
      console.log("extracting paper: ", paper.title, " from: ", paper.pdfUrl);
      const pdfText = await extractPdfTextFromUrl(paper.pdfUrl);

      // upsert paper to pinecone
      const result = await batchUpsertPineCone(paper.title, pdfText, paper.pdfUrl);

      pdfTexts.push(pdfText);
    }
    console.log("pdfTexts:", pdfTexts);

    if (paperData && chatbotId) {
      const paperDataWithChatbotId = paperData.map((paper) => ({
        ...paper,
        chatbotId,
      }));
      const bulkPaperData = await bulkCreatePapers(paperDataWithChatbotId);
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
