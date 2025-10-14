import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";

// GET chatbot by id
export async function GET(req, { params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// UPDATE chatbot
export async function PUT(req, { params }) {
  const { id } = await params;
  const { name, description, system_prompt } = await req.json();

  const { data, error } = await supabase
    .from("chatbots")
    .update({
      name,
      description,
      system_prompt,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE chatbot
export async function DELETE(req, { params }) {
  const { id } = await params;
  const { error } = await supabase
    .from("chatbots")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}
