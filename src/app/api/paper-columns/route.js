import { NextResponse } from "next/server";
import { PaperColumnService } from "@/services/supabase/paper-column.service";

// POST - Create a new paper column
export async function POST(req) {
  try {
    const body = await req.json();
    const { chatbot_id, label, instruction } = body;

    if (!chatbot_id || !label) {
      return NextResponse.json(
        { error: "chatbot_id and label are required" },
        { status: 400 }
      );
    }

    const data = await PaperColumnService.createPaperColumn({
      chatbot_id,
      label,
      instruction,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get all paper columns for a chatbot
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbot_id");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    console.log("hit get paper columns route");
    console.log("chatbotId", chatbotId);
    if (!chatbotId) {
      return NextResponse.json(
        { error: "chatbot_id query param is required" },
        { status: 400 }
      );
    }

    const data = await PaperColumnService.getPaperColumnsByChatbot(
      chatbotId,
      limit,
      offset
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete all paper columns for a chatbot
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbot_id");

    if (!chatbotId) {
      return NextResponse.json(
        { error: "chatbot_id query param is required" },
        { status: 400 }
      );
    }

    await PaperColumnService.deletePaperColumnsByChatbot(chatbotId);

    return NextResponse.json({
      message: "All paper columns deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

