import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";
import { DocumentService } from "@/services/supabase/document.service";

export async function POST(req) {
  const body = await req.json();
  const { chatbot_id, content, type } = body;

  if (!chatbot_id || !content || !type) {
    return NextResponse.json(
      { error: "chatbot_id, content, and type are required" },
      { status: 400 }
    );
  }

  const data = await DocumentService.createDocument({ chatbot_id, content, type });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const chatbotId = searchParams.get("chatbot_id");

  if (!chatbotId) {
    return NextResponse.json(
      { error: "chatbot_id query param is required" },
      { status: 400 }
    );
  }
  
  const data = await DocumentService.getDocumentsByChatbot(chatbotId);
  return NextResponse.json(data);
}


export async function PUT(req) {
  const body = await req.json();
  const { id, content, type } = body;

  if (!id || !content || !type) {
    return NextResponse.json({ error: "id, content, and type are required" }, { status: 400 });
  }

  const data = await DocumentService.updateDocument(id, { content, type });
  return NextResponse.json(data);
}