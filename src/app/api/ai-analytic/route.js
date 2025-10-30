import { sequentialPaperAnalyticService } from "@/services/paperAnalytic.service";
import { PaperColumnValueService } from "@/services/supabase/paper-column-value.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log('hit post ai analytic');
  try {
    const { papersData, column } = await req.json();

    if (!papersData || !column) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    } 
    const response = await sequentialPaperAnalyticService(papersData, column);
    console.log("response from route: ", JSON.stringify(response));
 

    const bulkSaveResult =  PaperColumnValueService.bulkInsertPaperColumnValues(response);
    
    if(!bulkSaveResult){
      return NextResponse.json({ error: "Failed to save paper column values" }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response", details: error.message },
      { status: 500 }
    );
  }
}
