import { NextResponse } from "next/server";
import { PaperColumnValueService } from "@/services/supabase/paper-column-value.service";

// GET - Get a specific paper column value by ID
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const data = await PaperColumnValueService.getPaperColumnValueById(id);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

// PUT - Update a paper column value
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = await PaperColumnValueService.updatePaperColumnValue(id, body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update a paper column value (alternative to PUT)
// Note: PATCH and PUT have identical implementations for simplicity
export async function PATCH(req, { params }) {
  return PUT(req, { params });
}

// DELETE - Delete a specific paper column value
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await PaperColumnValueService.deletePaperColumnValue(id);

    return NextResponse.json({
      message: "Paper column value deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

