
import { NextResponse } from "next/server";
import { getPapers, createPaper } from "@/services/supabase/paperData.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get("chatbotId") || undefined;
    const papers = await getPapers(chatbotId);
    return NextResponse.json(papers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const paper = await createPaper(body);
    return NextResponse.json(paper);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}