import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";
import { createClient } from "@/lib/supabase/server";

// GET all chatbots
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST new chatbot
export async function POST(req) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()
  try {
    const { id, name, description, system_prompt } = await req.json();

    const { data, error } = await supabase
      .from("chatbots")
      .insert([
        {
          id, // ✅ will use custom UUID if provided
          name,
          description,
          system_prompt,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
