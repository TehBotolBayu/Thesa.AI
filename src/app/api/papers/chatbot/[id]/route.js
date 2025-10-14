
import { getPaperByChatbotId } from "@/services/supabase/paperData.service";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    const paper = await getPaperByChatbotId(id);
    return NextResponse.json(paper);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
