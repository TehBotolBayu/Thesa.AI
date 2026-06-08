export const runtime = "nodejs"; // IMPORTANT: disable edge runtime
import { getAIPaperResponse } from "@/services/ai.service";
import { NextResponse } from "next/server";
import { bulkCreatePapers } from "@/services/supabase/paperData.service";
import { extractPdfTextFromUrl } from "@/lib/paperPDFUtil";
import { batchUpsertPineCone } from "@/services/pinecone";

export async function POST(req) {
  try {
    const body = await req.json();
    const { serialized, message, chatbotId, namespaces, paperData: reqPaperData } = body;
    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (step) => {
          const data = JSON.stringify({ type: "progress", message: step });
          controller.enqueue(encoder.encode(data + "\n"));
        };

        const sendToken = (token) => {
          const data = JSON.stringify({ type: "token", token });
          controller.enqueue(encoder.encode(data + "\n"));
        };

        try {
          const prompt = `${message}`;
          const response = await getAIPaperResponse(prompt, serialized, namespaces, sendProgress, sendToken, reqPaperData);

          const paperData = await response?.toolResult;

          if (paperData && Array.isArray(paperData)) {
            if (chatbotId) {
              sendProgress("Saving papers to database...");
              const paperDataWithChatbotId = paperData.map((paper) => ({
                ...paper,
                chatbotId,
              }));
              await bulkCreatePapers(paperDataWithChatbotId);
            }
          }

          const successPayload = response?.streamed
            ? { ...response, finalAnswer: undefined }
            : response;
          const finalData = JSON.stringify({ type: "success", data: successPayload });
          controller.enqueue(encoder.encode(finalData + "\n"));
          controller.close();
        } catch (error) {
          console.error("Stream Error:", error);
          const errData = JSON.stringify({ type: "error", message: error.message });
          controller.enqueue(encoder.encode(errData + "\n"));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
