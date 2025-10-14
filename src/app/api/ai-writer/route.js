import { getAIWriterResponse } from "@/services/ai.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { serialized, message, docData } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const prompt = `${message}`;

    const response = await getAIWriterResponse(prompt, docData, serialized);

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
