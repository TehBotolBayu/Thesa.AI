import { supabase } from "@/config/supabase";

export async function createPaper(paper) {

  
    
  const { data, error } = await supabase
    .from("paper_data")
    .insert([
      {
        title: paper.title,
        abstract: paper.abstract,
        isOpenAccess: paper.isOpenAccess,
        pdfUrl: paper.pdfUrl,
        authors: paper.authors,
        chatbotId: paper.chatbotId,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function getPapers(chatbotId = null) {
  let query = supabase
    .from("paper_data")
    .select("*")
    .order("created_at", { ascending: false });

  if (chatbotId) {
    query = query.eq("chatbotId", chatbotId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPaperById(id) {
  const { data, error } = await supabase
    .from("paper_data")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaper(id, updates) {
  const { data, error } = await supabase
    .from("paper_data")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deletePaper(id) {
  const { error } = await supabase.from("paper_data").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function bulkCreatePapers(papers) {
  
  const formatted = papers.map((paper) => ({
    title: paper.title || null,
    abstract: paper.abstract || null,
    isOpenAccess: paper.isOpenAccess ?? null,
    pdfUrl: paper.pdfUrl || null,
    authors: paper.authors || null,
    chatbotId: paper.chatbotId || null,
  }));

  const { data, error } = await supabase.from("paper_data").insert(formatted).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function getPaperByUserId(userId) {
  const { data, error } = await supabase.from("paper_data").select("*").eq("userId", userId);
  if (error) throw error;
  return data;
}

export async function getPaperByChatbotId(chatbotId) {
  
  const { data, error } = await supabase.from("paper_data").select("*").eq("chatbotId", chatbotId);
  if (error) throw error;
  return data;
}

export async function bulkDeletePapers(ids) {
  
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("IDs array is required");
  }

  const { error } = await supabase.from("paper_data").delete().in("id", ids);

  if (error) throw new Error(error.message);
  return { deleted: ids.length };
}
