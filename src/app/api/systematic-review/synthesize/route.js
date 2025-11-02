import { DocumentService } from "@/services/supabase/document.service";
import { synthesizeResults } from "@/services/systematic-review.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { papers, evaluations, extractions, criteria,chatbot_id } = await req.json();

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: "Papers array is required" },
        { status: 400 }
      );
    }

    if (!evaluations || !Array.isArray(evaluations)) {
      return NextResponse.json(
        { error: "Evaluations array is required" },
        { status: 400 }
      );
    }

    if (!extractions || !Array.isArray(extractions)) {
      return NextResponse.json(
        { error: "Extractions array is required" },
        { status: 400 }
      );
    }

    if (!criteria) {
      return NextResponse.json(
        { error: "Criteria is required" },
        { status: 400 }
      );
    }

    // Generate synthesis
    const synthesis = await synthesizeResults(papers, evaluations, extractions, criteria);
    
    // Format as markdown report

    // save the synthesis report to the database
    const data  = await DocumentService.createDocument({
      content: synthesis,
      type: "synthesis",
      chatbot_id: chatbot_id,
    });

    if (!data) {
      return NextResponse.json({ error: "Failed to save synthesis report" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        synthesis,
      }
    });
  } catch (error) {
    console.error("Synthesize API error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize results", details: error.message },
      { status: 500 }
    );
  }
}

