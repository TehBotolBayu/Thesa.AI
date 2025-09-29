import { NextResponse } from "next/server";
import { getAIResponse } from "@/services/ai.service";

export async function POST(req) {
  try {
    const { serialized, message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const prompt = `${message}`;

    const response = await getAIResponse(serialized || [], prompt);

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
