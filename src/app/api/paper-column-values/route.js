import { NextResponse } from "next/server";
import { PaperColumnValueService } from "@/services/supabase/paper-column-value.service";

// POST - Create a new paper column value
export async function POST(req) {
  try {
    const body = await req.json();
    const { paper_id, column_id, chatbot_id, value } = body;

    if (!paper_id || !column_id || !chatbot_id) {
      return NextResponse.json(
        { error: "paper_id, column_id, and chatbot_id are required" },
        { status: 400 }
      );
    }

    const data = await PaperColumnValueService.createPaperColumnValue({
      paper_id,
      column_id,
      chatbot_id,
      value,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get paper column values with optional filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbot_id");
    const paperId = searchParams.get("paper_id");
    const columnId = searchParams.get("column_id");
    const limit = Number.parseInt(searchParams.get("limit") || "-1");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    const data = await PaperColumnValueService.getPaperColumnValuesBy(
      chatbotId,
      paperId,
      columnId,
      limit < 0 ? null : limit,
      offset
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete all paper column values for a chatbot
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

    await PaperColumnValueService.deletePaperColumnValuesByChatbot(chatbotId);

    return NextResponse.json({
      message: "All paper column values deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

