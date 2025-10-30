import { NextResponse } from "next/server";
import { PaperColumnService } from "@/services/supabase/paper-column.service";

// GET - Get a specific paper column by ID
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const data = await PaperColumnService.getPaperColumnById(id);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

// PUT - Update a paper column
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = await PaperColumnService.updatePaperColumn(id, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update a paper column (alternative to PUT)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = await PaperColumnService.updatePaperColumn(id, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a specific paper column
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await PaperColumnService.deletePaperColumn(id);

    return NextResponse.json({
      message: "Paper column deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

