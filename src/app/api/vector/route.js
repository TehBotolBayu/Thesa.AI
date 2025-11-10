import { NextResponse } from "next/server";
import { queryPineCone, batchUpsertPineCone } from "@/services/pinecone";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexName = searchParams.get("indexName") || undefined;
    const userQuery = searchParams.get("userQuery") || undefined;
    const relevantContext = await queryPineCone(indexName, userQuery);
    return NextResponse.json(relevantContext);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const {title, content, namespace} = await request.json();
    const result = await batchUpsertPineCone(title, content, namespace);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
