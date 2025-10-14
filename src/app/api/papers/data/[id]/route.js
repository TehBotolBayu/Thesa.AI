
import { NextResponse } from "next/server";
import { getPaperById, updatePaper, deletePaper } from "@/services/supabase/paperData.service";

export async function GET(_req, { params }) {
  try {
    const paper = await getPaperById(params.id);
    return NextResponse.json(paper);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const updated = await updatePaper(params.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await deletePaper(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}