import { generateCriteria } from "@/services/systematic-review.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { chatHistory, userQuery, paperCount, chatbot_id } = await req.json();

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return NextResponse.json(
        { error: "Chat history array is required" },
        { status: 400 }
      );
    }

    if (!paperCount || paperCount === 0) {
      return NextResponse.json(
        { error: "Paper count is required and must be greater than 0" },
        { status: 400 }
      );
    }

    if (!chatbot_id) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400 }
      );
    }

    // Generate criteria using AI
    const criteria = await generateCriteria(chatHistory, userQuery, paperCount, chatbot_id);

    console.log('Generated criteria: ', JSON.stringify(criteria));

    return NextResponse.json({ success: true, data: criteria });
  } catch (error) {
    console.error("Generate criteria API error:", error);
    return NextResponse.json(
      { error: "Failed to generate criteria", details: error.message },
      { status: 500 }
    );
  }
}