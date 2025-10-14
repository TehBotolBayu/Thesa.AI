import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";

export async function POST(req) {
  const body = await req.json();
  const { chatbot_id, message, sender, session_id } = body;

  if (!chatbot_id || !message || !sender) {
    return NextResponse.json(
      { error: "chatbot_id, message, and sender are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("chatbot_conversations")
    .insert([{ chatbot_id, message, sender, session_id }])
    .select()
    .single();

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

  const { data, error } = await supabase
    .from("chatbot_conversations")
    .select("*")
    .eq("chatbot_id", chatbotId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
