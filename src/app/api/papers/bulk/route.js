
import { NextResponse } from "next/server";
import { bulkDeletePapers } from "@/services/supabase/paperData.service";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const ids = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'ids' array" }, { status: 400 });
    }

    const result = await bulkDeletePapers(ids);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}