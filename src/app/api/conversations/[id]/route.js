import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";

// GET a conversation by id
export async function GET(req, { params }) {
  
  const { id } = await params; // ✅ await params

  const { data, error } = await supabase
    .from("chatbot_conversations")
    .select("*")
    .eq("chatbot_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data);
}

// UPDATE a conversation
export async function PUT(req, { params }) {
  const { id } = await params; // ✅ await params
  const { message, sender, session_id } = await req.json();

  const { data, error } = await supabase
    .from("chatbot_conversations")
    .update({ message, sender, session_id })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE a conversation
export async function DELETE(req, { params }) {
  const { id } = await params; // ✅ await params

  const { error } = await supabase
    .from("chatbot_conversations")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Conversation deleted successfully" });
}
