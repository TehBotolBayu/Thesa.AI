import { NextResponse } from "next/server";
import { supabase } from "@/config/supabase";
import { ReviewCriteriaService } from "@/services/supabase/review_criteria";

export async function GET(req, { params }) {
    const { id } = await params;
  try {
    const data = await ReviewCriteriaService.getAll(id);

    if (data) {
      const criteriaData = {
        researchQuestion: data.research_question, 
        keywords: data.keywords,
        inclusionCriteria: data.inclusion_criteria,
        exclusionCriteria: data.exclusion_criteria
      };
        return NextResponse.json({ success: true, data: criteriaData });
    }

    return NextResponse.json({ error: "No criteria found" }, { status: 404 });
  } catch (error) {
    console.error("Get criteria API error:", error);
    if(error.message.includes('Cannot coerce the result')){
      return NextResponse.json({ error: "No criteria found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to get criteria", details: error.message },
      { status: 500 }
    );
  }
}
